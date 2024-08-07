<template>
  <div id="q-app">

    <component v-bind:is="'style'" type="text/css" v-html="customCSS"></component>

    <component v-if="allowWiderScrollbars" v-bind:is="'style'" type="text/css" v-html="widerScrollBarCSSS"></component>

    <appWindowButtons />
    <router-view />

    <q-window
      v-model="documentPreviewWindowVisible"
      no-resize
      dark
      headless
      ref="documentPreviewWindow"
      @input="refreshDocumentPreviewWindow"
      no-move
      :content-class="{'bg-gunmetal-light text-accent docPreviewWindow': true, '-noBar': disableDocumentControlBar}"
    >
      <div class="fit">
        <q-btn
          icon="mdi-close"
          color="secondary"
          round
          flat
          size="md"
          class="previewCloseButton"
          @click="refreshDocumentPreviewWindow(false)"
        >
          <q-tooltip
            :delay="500"
            anchor="bottom middle"
            self="top middle"
          >
            Close document preview
          </q-tooltip>
        </q-btn>

        <documentPreview
          :document-id="documentPreviewElementID"
          :display-mode="'document'"
        />

      </div>
    </q-window>

    <q-window
      v-model="advSearchWindowVisible"
      no-resize
      dark
      title="Advanced Search Cheatsheet"
      :height="625"
      :width="500"
      :start-x="50"
      :start-y="150"
      :actions="['pin', 'close']"
      content-class="bg-gunmetal-light text-accent advSearchWindow"
    >
      <div class="q-pa-md fit">
        <q-markdown no-heading-anchor-links>
          {{$t('documents.advancedSearchCheatSheet')}}
        </q-markdown>
      </div>
    </q-window>

    <q-window
      v-model="corkboardWindowVisible"
      dark
      title="Note board"
      gripper-border-color="primary"
      gripper-background-color="primary"
      :height="600"
      :width="350"
      :start-x="350"
      :start-y="100"
      :actions="['pin', 'close']"
      content-class="bg-gunmetal-light text-accent noteBoardWindow"
    >
      <form
      class="corkboardInput"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
      >
        <q-input

        v-model="corkboardContent"
        filled
        dark
        @keyup="processCorkboardInput"
        type="textarea"
      />
      </form>
    </q-window>

  </div>
</template>

<script lang="ts">
import BaseClass from "src/BaseClass"
import { Component, Watch } from "vue-property-decorator"
import { defaultKeybinds } from "src/scripts/appSettings/defaultKeybinds"
import appWindowButtons from "src/components/appHeader/AppWindowButtons.vue"
import PouchDB from "pouchdb"
import { OptionsStateInteface } from "./store/module-options/state"
import { colors } from "quasar"
import { tipsTricks } from "src/scripts/utilities/tipsTricks"
import { summonAllPlusheForms } from "src/scripts/utilities/plusheMascot"
import { saveCorkboard, retrieveCorkboard, retrieveCurrentProjectName, retrieveCurrentProjectCustomCSS } from "src/scripts/projectManagement/projectManagent"
import documentPreview from "src/components/DocumentPreview.vue"
@Component({
  components: {
    documentPreview: documentPreview,
    appWindowButtons: appWindowButtons
  }
})
export default class App extends BaseClass {
  /****************************************************************/
  // APP START & END SETUP
  /****************************************************************/

  async created () {
    // Catch middle clicks
    window.addEventListener("auxclick", this.reactToMiddleClick)

    // Add a secondary blocker to prevent the middle-mouse button scrolling
    document.body.onmousedown = function (e) {
      if (e.button === 1) {
        e.preventDefault()
        return false
      }
    }

    // Load settings
    await this.loadSettings()

    await this.loadCorkboardCotent()

    const currentProjectName = await retrieveCurrentProjectName()

    this.SSET_setProjectName(currentProjectName)

    // eslint-disable-next-line prefer-const
    const currentProjectCustomCSS = await retrieveCurrentProjectCustomCSS()

    this.SSET_setProjectCustomCSS(currentProjectCustomCSS)

    // Load the popup hint on
    this.loadHintPopup()

    // React to keybind presses
    window.addEventListener("keydown", this.triggerKeyPush)

    // Catch normal clicks inside wysiwyg
    window.addEventListener("click", this.openWysiwygLink)
  }

  destroyed () {
    window.removeEventListener("auxclick", this.reactToMiddleClick)

    this.deregisterCustomKeybinds()
    this.deregisterDefaultKeybinds()
    window.removeEventListener("keydown", this.triggerKeyPush)
  }

  /****************************************************************/
  // START NOTIFICATION
  /****************************************************************/

  /**
   * Model for the startup notification
   */
  starupNotif = null as any

  /**
   * Notification checker
   * Can go up to 3
   */
  popupCheck = 0

  /**
   * Show the actual popup
   */
  loadHintPopup () {
    const options = this.SGET_options

    // Considering there is a bit of a delay between the initial load of the store DB content, we give the program 3 attempts to load the data over 3 seconds. If no is loaded in that time, we assume that the settings are not set at all and display the hint as normal.
    if ((!options._id || !options._rev) && this.popupCheck < 3) {
      setTimeout(() => {
        this.popupCheck++
        this.loadHintPopup()
      }, 1000)
      return
    }

    if (options.hideTooltipsStart) {
      return
    }

    const messageToShow = tipsTricks[Math.floor(Math.random() * tipsTricks.length)]
    const plusheForm = summonAllPlusheForms[Math.floor(Math.random() * summonAllPlusheForms.length)]
    this.starupNotif = this.$q.notify({

      timeout: 15000,
      icon: (this.hidePlushes) ? "mdi-help" : undefined,
      color: "info",
      message: "Did you know?",
      avatar: (!this.hidePlushes) ? plusheForm : undefined,
      caption: messageToShow,
      actions: [{ icon: "mdi-close", color: "white" }]
    })
  }

  /**
   * Hide the startup notification if the user changed the route before it disappeared
   */
  @Watch("$route", { deep: true })
  onUrlChange () {
    if (typeof this.starupNotif === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.starupNotif()
    }
  }

  /****************************************************************/
  // KEYBIND HANDLING
  /****************************************************************/

  /**
   * React to keybind combinations being pushed and submit them to the store
   */
  triggerKeyPush (e:any) {
    // console.log("")
    // console.log(`Key: ${e.key}`)
    // console.log(`Ctrl: ${e.ctrlKey}`)
    // console.log(`Shift: ${e.shiftKey}`)
    // console.log(`Alt: ${e.altKey}`)
    // console.log(e)

    const specialKeyList = [
      // F11
      122
    ]

    if (e?.altKey === true || e?.ctrlKey || e?.shiftKey || specialKeyList.includes(e?.which)) {
      const ouputKeycombo = {
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        which: e.which
      }

      this.SSET_updatePressedKey(ouputKeycombo)
    }
  }

  /**
   * Registers a default keybind into the store
   */
  registerDefaultKeybinds () {
    // @ts-ignore
    defaultKeybinds.forEach(e => this.SSET_registerDefaultKeybind(e))
  }

  /**
   * Removes a default keybind from the store
   */
  deregisterDefaultKeybinds () {
    // @ts-ignore
    defaultKeybinds.forEach(e => this.SSET_deregisterDefaultKeybind(e))
  }

  /**
   * Registers a custom keybind into the store
   */
  registerCustomKeybinds () {
    setTimeout(() => {
      this.SGET_options.userKeybindList.forEach(e => this.SSET_registerUserKeybind(e))
    }, 1000)
  }

  /**
   * Removes a custom keybind from the store
   */
  deregisterCustomKeybinds () {
    // @ts-ignore
    defaultKeybinds.forEach(e => this.SSET_deregisterUserKeybind(e))
  }

  /****************************************************************/
  // VARIOUS APP FUNCTIONALITY
  /****************************************************************/

  /**
   * Open wysiwyg links in default browser window
   */
  openWysiwygLink (event: MouseEvent) {
    event.preventDefault()
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (event.target && event.target.tagName.toLowerCase() === "a" && event.target.closest(".fieldWysiwyg")) {
      // @ts-ignore
      this.openLink(event.target.href as string)
      // @ts-ignore
    }
  }

  /**
   * React to middle mouse button clicks
   */
  reactToMiddleClick (e: {button: number, preventDefault: ()=> void}) {
    if (e.button === 1) {
      e.preventDefault()
      return false
    }
  }

  /**
   * Load settings for the first time upon app load
   */
  async loadSettings () {
    const SettingsDB = new PouchDB("fa-settings")
    const settingsData = await SettingsDB.allDocs({ include_docs: true })
    const settings = settingsData?.rows[0]?.doc as unknown as OptionsStateInteface

    if (settings) {
      this.SSET_options(settings)
    }

    this.registerDefaultKeybinds()
    this.registerCustomKeybinds()

    await SettingsDB.close()
  }

  /**
   * Update dark/light mode across the app based on what is currently in the store
   */
  @Watch("SGET_options", { deep: true })
  onSettingsChange () {
    const options = this.SGET_options

    this.hidePlushes = options.hidePlushes
    this.allowWiderScrollbars = options.allowWiderScrollbars
    this.$q.dark.set(options.darkMode)
    if (options.darkMode) {
      colors.setBrand("dark", "#1b333e")
      colors.setBrand("primary", "#ffd673")
    }
    else {
      colors.setBrand("dark", "#18303a")
      colors.setBrand("primary", "#e8bb50")
    }

    this.disableDocumentControlBar = options.disableDocumentControlBar
    this.refreshDocumentPreviewWindow()

    if (options.disableSpellCheck) {
      document.body.setAttribute("spellcheck", "false")
    }
    else {
      document.body.setAttribute("spellcheck", "true")
    }
  }

  disableDocumentControlBar = false

  /**
   * Hides the mascot... nooo :(
   */
  hidePlushes = false

  allowWiderScrollbars = false

  @Watch("SGET_getAdvSearchWindowVisible")
  onAdvSearchWindowOpen () {
    this.advSearchWindowVisible = true
  }

  advSearchWindowVisible = false

  @Watch("SGET_getNoteCorkboardWindowVisible")
  onCorkboardWindowOpen () {
    this.corkboardWindowVisible = true
  }

  corkboardWindowVisible = false

  corkboardContent = ""

  /**
   * Debounce timer to prevent buggy input sync
   */
  corkboardTimer = null as any

  processCorkboardInput () {
    clearTimeout(this.corkboardTimer)
    this.corkboardTimer = setTimeout(() => {
      saveCorkboard(this.corkboardContent).catch(e => console.log(e))
    }, 1000)
  }

  /**
   * Corkboard checker
   * Can go up to 3
   */
  corkboardCheck = 0

  async loadCorkboardCotent () {
    const options = this.SGET_options

    this.corkboardContent = await retrieveCorkboard()

    // Considering there is a bit of a delay between the initial load of the store DB content, we give the program 3 attempts to load the data over 3 seconds. If no is loaded in that time, we assume that the settings are not set at all and display the hint as normal.
    if ((!options._id || !options._rev) && this.corkboardCheck < 3) {
      setTimeout(() => {
        this.corkboardCheck++
        this.loadCorkboardCotent().catch(e => console.log(e))
      }, 1000)
      return
    }

    if (options.preventFilledNoteBoardPopup) {
      return
    }

    if (this.corkboardContent.length) {
      this.corkboardWindowVisible = true
    }
  }

  documentPreviewWindowVisible = false
  documentPreviewElementID = ""

  @Watch("SGET_getDocumentPreviewWindowID")
  reactToPreviewIDChange () {
    this.refreshDocumentPreviewWindow()
  }

  @Watch("SGET_getDocumentPreviewVisible")
  reactToPreviewVisibilityChange () {
    if (this.SGET_getDocumentPreviewVisible !== "") {
      this.refreshDocumentPreviewWindow()
    }
  }

  refreshDocumentPreviewWindow (input = true) {
    this.documentPreviewElementID = this.SGET_getDocumentPreviewWindowID
    const newOpenString = this.SGET_getDocumentPreviewVisible

    if (!input || newOpenString.length === 0) {
      this.SSET_setDocumentPreviewWindowVisible(false)
      this.documentPreviewWindowVisible = false
    }
    else {
      this.documentPreviewWindowVisible = true
    }

    if (this.documentPreviewWindowVisible) {
      /* eslint-disable */
      //@ts-ignore
      this.$refs.documentPreviewWindow.setX(0)
      //@ts-ignore
      this.$refs.documentPreviewWindow.setY(95)
      //@ts-ignore
      /* eslint-enable */
    }
  }

  /****************************************************************/
  // Local keybinds
  /****************************************************************/

  @Watch("SGET_getCurrentKeyBindData", { deep: true })
  processKeyPush () {
  // Toggle the Advanced search cheatsheet
    if (this.determineKeyBind("toggleAdvSearchCheatsheet")) {
      this.advSearchWindowVisible = !this.advSearchWindowVisible
    }

    // Toggle Note Board - CTRL + ALT + SHIFT + P
    if (this.determineKeyBind("toggleNoteCorkboard")) {
      this.corkboardWindowVisible = !this.corkboardWindowVisible
    }
  }

  /****************************************************************/
  // CUSTOM CSS ATTACHING
  /****************************************************************/

  widerScrollBarCSSS = "*::-webkit-scrollbar{width: 15px !important; height: 15px !important;}"

  customCSS = ""

  @Watch("SGET_getProjectCustomCSS", { deep: true })
  checkCustomCSS () {
    this.customCSS = this.SGET_getProjectCustomCSS
  }
}
</script>
