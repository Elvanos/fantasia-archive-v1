<template>
  <div>
    <!-- Insert image dialog -->
    <WISIWYG_insertImageChoice
      :dialog-trigger="WISIWYG_insertImageChoiceDialogTrigger"
      @trigger-dialog-close="WISIWYG_insertImageChoiceDialogClose"
      @passing-image-link="insertImageLink"
    />

    <!-- Change image path dialog -->
    <WISIWYG_changeImagePath
      :dialog-trigger="WISIWYG_changeImagePathDialogTrigger"
      @trigger-dialog-close="WISIWYG_changeImagePathDialogClose"
      @passing-image-path-change="changeImagePath"
      :current-image-path="currentImagePath"
      :current-image-target="currentImageTarget"
    />

    <!-- Insert existing document dialog -->
    <existingDocumentDialog
      v-if="editMode"
      preventOpen="true"
      quickInsertMode="true"
      :dialog-trigger="existingObjectDialogTrigger"
      @trigger-dialog-close="existingObjectDialogClose"
      @signal-document-selected="handleDocumentSelected"
    />

    <div class="flex justify-center items-center text-weight-bolder q-mb-sm q-mt-md fieldWysiwygTitle">
      <span>
      <q-icon v-if="inputIcon" :name="inputIcon"  :size="(inputIcon.includes('fas') || inputIcon.includes('fab'))? '15px': '20px'"   class="q-mr-md"/>
      {{inputDataBluePrint.name}}
       <q-icon v-if="toolTip && !disableDocumentToolTips" name="mdi-help-circle" size="16px" class="q-ml-md">
         <q-tooltip :delay="500">
           <span v-html="toolTip"/>
        </q-tooltip>
      </q-icon>
      </span>
    </div>

    <div
      v-if="!editMode"
      class="fieldWysiwyg"
      v-html="localInput">
    </div>

    <div>
      <q-editor
      v-model="localInput"
      :id="inputDataBluePrint.id"
      :ref="`wysiwygField${inputDataBluePrint.id}`"
      @paste.native="evt => pasteCapture(evt)"
      :toolbar="wysiwygOptions"
      :fonts="wysiwygFonts"
      @input="processInput"
      :flat="isDarkMode"
      v-if="editMode"
      :definitions="definitions"
      min-height="350px"
      :class="{
        'limitEditorHeight': limitEditorHeight
      }"
      @keypress.native="handleEditorKeypress"
      @click.native="handleEditorClick"
      @contextmenu="handleRightClick($event)"
      >
      </q-editor>
    </div>

    <div class="separatorWrapper">
      <q-separator color="grey q-mt-md" />
    </div>

  </div>

</template>

<script lang="ts">
import { Component, Emit, Prop, Watch } from "vue-property-decorator"

import FieldBase from "src/components/fields/_FieldBase"
import { QEditor, extend } from "quasar"
import { I_HasFullScreenEditMode, I_OpenedDocument } from "src/interfaces/I_OpenedDocument"

import WISIWYG_insertImageChoice from "src/components/dialogs/WISIWYG_insertImageChoice.vue"
import WISIWYG_changeImagePath from "src/components/dialogs/WISIWYG_changeImagePath.vue"

@Component({
  components: {
    existingDocumentDialog: () => import("src/components/dialogs/ExistingDocument.vue"),
    WISIWYG_insertImageChoice: WISIWYG_insertImageChoice,
    WISIWYG_changeImagePath: WISIWYG_changeImagePath
  }
})
export default class Field_Wysiwyg extends FieldBase {
  /****************************************************************/
  // LOCAL SETTINGS
  /****************************************************************/

  /**
   * React to changes on the options store
   */
  @Watch("SGET_options", { immediate: true, deep: true })
  onSettingsChange () {
    this.limitEditorHeight = this.SGET_options.limitEditorHeight
  }

  limitEditorHeight = false

  /****************************************************************/
  // BASIC FIELD DATA
  /****************************************************************/

  /**
   * Already existing value in the input field (IF one is there right now)
   */
  @Prop({ default: "" }) readonly inputDataValue!: string

  /**
   * Current status of the fullscreen of the field
   */
  @Prop({
    default: () => ({
      fieldID: "",
      value: false
    })

  }) readonly fullScreenStatus!: I_HasFullScreenEditMode

  /**
   * Current scroll in fullscreen mode
   */
  @Prop({ default: 0 }) readonly fullScreenScrollDistance!: number

  /****************************************************************/
  // INPUT HANDLING
  /****************************************************************/

  /**
   * Watch changes to the prefilled data already existing in the field and update local input accordingly
   */
  @Watch("inputDataValue", { deep: true, immediate: true })
  reactToInputChanges () {
    this.localInput = this.inputDataValue
  }

  /**
   * Watch changes to the prefilled data already existing in the field and update local input accordingly
   */
  @Watch("fullScreenStatus", { deep: true, immediate: true })
  reactToFullScreenStatusChanges () {
    this.$nextTick(() => {
      const fullScreenFieldID = this.fullScreenStatus.fieldID
      const localID = this.inputDataBluePrint.id

      const fullScreenValue = this.fullScreenStatus.value
      if (fullScreenFieldID === localID) {
        const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

        if (fullScreenValue) {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          editor.setFullscreen()
          editor.focus()
        }
        else {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          editor.exitFullscreen()
          editor.focus()
        }
      }
    })
  }

  /**
   * Model for the local input
   */
  localInput = ""

  /**
   * Debounce timer to prevent buggy input sync
   */
  pullTimer = null as any

  processInput () {
    clearTimeout(this.pullTimer)
    this.pullTimer = setTimeout(() => {
      // Fist for HTML -> Body -> List of actual nodes
      /*       let finalString = ""
      const nodeList = new DOMParser().parseFromString(this.localInput, "text/html").childNodes[0].childNodes[1].childNodes

      nodeList.forEach((node: Node) => {
        let additionalString = ""

        if (node.nodeType === 3 && node.textContent !== null && node.textContent.trim().length > 1) {
          additionalString = `<div>${node.textContent}</div>`
        }

        if (node.nodeType === 1) {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          additionalString = node.outerHTML
        }

        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        finalString = finalString + additionalString
      })

      this.localInput = finalString */

      this.signalInput()
    }, 500)
  }

  /**
   * Signals the input change to the document body parent component
   */
  @Emit()
  signalInput () {
    return this.localInput.trim()
  }

  /**
   * Signals the fullscreen value change to the document body parent component
   */
  @Emit()
  signalFullScreenStatusChange () {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const fullScreenState = editor.inFullscreen

    return {
      fieldID: this.inputDataBluePrint.id,
      value: !fullScreenState
    }
  }

  /****************************************************************/
  // WYSIWYG FUNCTIONALITY
  /****************************************************************/

  /**
   * Disableds the full-screen edit mode upon cancleling the editing mode
   */
  @Watch("editMode")
  turnOffFullScreen () {
    if (!this.editMode && this.$refs[`wysiwygField${this.inputDataBluePrint.id}`]) {
      /*eslint-disable */
      // @ts-ignore
      this.$refs[`wysiwygField${this.inputDataBluePrint.id}`].exitFullscreen()
      /* eslint-enable */
    }
  }

  /**
   * Strips all formatting from CTRL + V pasting
   */
  pasteCapture (evt: any) {
    /*eslint-disable */

    // Let inputs do their thing, so we don't break pasting of links.
    if (evt.target.nodeName === "INPUT") {
      return
    }
    let text, onPasteStripFormattingIEPaste
    evt.preventDefault()
    if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
      text = evt.originalEvent.clipboardData.getData("text/plain")
      // @ts-ignore
      this.$refs[`wysiwygField${this.inputDataBluePrint.id}`].runCmd("insertText", text)
    }
    else if (evt.clipboardData && evt.clipboardData.getData) {
      text = evt.clipboardData.getData("text/plain")
      // @ts-ignore
      this.$refs[`wysiwygField${this.inputDataBluePrint.id}`].runCmd("insertText", text)
    }
    // @ts-ignore
    else if (window.clipboardData && window.clipboardData.getData) {
      if (!onPasteStripFormattingIEPaste) {
        onPasteStripFormattingIEPaste = true
        // @ts-ignore
        this.$refs[`wysiwygField${this.inputDataBluePrint.id}`].runCmd("ms-pasteTextOnly", text)
      }
      onPasteStripFormattingIEPaste = false
    }
    /* eslint-enable */
  }

  existingObjectDialogTrigger: string | false = false

  handleDocumentSelected (id: string) {
    /*eslint-disable */
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as any

    const doc = this.SGET_document(id)

    setTimeout(() => {
      editor.runCmd("insertHtml", `<a href="document:${id}">${doc.label}</a>&nbsp;`)
    }, 100)

    /* eslint-enable */
  }

  existingObjectDialogClose () {
    this.existingObjectDialogTrigger = false
  }

  existingObjectAssignUID () {
    this.existingObjectDialogTrigger = this.generateUID()
  }

  handleEditorKeypress (evt: any) {
    /*eslint-disable */
    if (evt.key === '@' && this.editMode) {
      const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

      // We don't want to paste anything special in the source mode editor, let the user do their thing
      if ((editor as any).isViewingSource){
        return;
      }

      // Prevent showing up `@` character
      evt.preventDefault()

      // Open the selector dialog
      // Timeout to allow to actually type the '@' symbol
      setTimeout(() => {
        this.existingObjectAssignUID()
      }, 1)
    }
    /* eslint-enable */
  }

  handleEditorClick (evt: any) {
    /*eslint-disable */
    if (evt.target.tagName.toLowerCase() === 'a') {
      // Only follow links when ctrl is pressed
      if (evt.ctrlKey) {
        const link = evt.target.href
        evt.stopPropagation()
        this.openLink(link)
      }
    }
    /* eslint-enable */
  }

  insertImageLink (imageLink: string) {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

    editor.focus()
    editor.runCmd("insertParagraph")

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    editor.caret.restore()

    editor.runCmd("insertHTML", `<img src='${imageLink}'>`)

    editor.runCmd("insertParagraph")

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    editor.caret.restore()

    editor.focus()
  }

  changeImagePath (imagePath: string, imageTarget: HTMLImageElement) {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

    imageTarget.src = imagePath

    // Bugfix due to editor not refreshing image SRC content after direct edit like this. Therefore we need to trigger the refresh manually by inserting imaginary html code.
    editor.runCmd("insertHTML", "")
  }

  currentImagePath = ""
  currentImageTarget = null as unknown as HTMLImageElement

  toggleEditorFullScreen () {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const fullScreenState = editor.inFullscreen

    if (fullScreenState) {
      this.signalFullScreenStatusChange()

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      editor.exitFullscreen()
      editor.focus()
    }
    else {
      this.signalFullScreenStatusChange()

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      editor.setFullscreen()
      editor.focus()
    }
  }

  turnOffEditorFullScreen () {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const fullScreenState = editor.inFullscreen

    if (fullScreenState) {
      this.signalFullScreenStatusChange()

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      editor.exitFullscreen()
    }
  }

  handleRightClick (event: MouseEvent) {
    if (event?.target) {
      // @ts-ignore
      const target = event.target as unknown as HTMLImageElement
      const targetType:string = target.tagName

      if (targetType === "IMG") {
        this.currentImagePath = target.src
        this.currentImageTarget = target

        this.WISIWYG_changeImagePathAssignUID()
      }
    }
  }

  /**
   * Subsitution strings for toolbar
   */
  definitions = {
    toggleFullSceen: {
      tip: "Toggle fullscreen <br><br> (Ctrl + Shift + F / F11)",
      icon: "fullscreen",
      label: "Fullscreen",
      handler: this.toggleEditorFullScreen
    },
    insertImageLink: {
      tip: "Insert image link",
      icon: "image",
      label: "",
      handler: this.WISIWYG_insertImageChoiceAssignUID
    },
    quote: {
      tip: "Quote",
      key: false
    }
  }

  /**
   * Font list
   */
  wysiwygFonts = {
    arial: "Arial",
    arial_black: "Arial Black",
    comic_sans: "Comic Sans MS",
    courier_new: "Courier New",
    impact: "Impact",
    lucida_grande: "Lucida Grande",
    times_new_roman: "Times New Roman",
    verdana: "Verdana"
  }

  /**
   * Wysiwyg toolbar ontions
   */
  wysiwygOptions = [
    ["left", "center", "right", "justify"],
    ["bold", "italic", "underline", "subscript", "superscript"],
    [
      {
        label: this.$q.lang.editor.formatting,
        icon: this.$q.iconSet.editor.formatting,
        list: "no-icons",
        fixedIcon: true,
        options: [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p"
        ]
      },
      {
        label: this.$q.lang.editor.fontSize,
        icon: this.$q.iconSet.editor.fontSize,
        fixedIcon: true,
        list: "no-icons",
        options: [
          "size-1",
          "size-2",
          "size-3",
          "size-4",
          "size-5",
          "size-6",
          "size-7"
        ]
      },
      {
        label: this.$q.lang.editor.defaultFont,
        icon: this.$q.iconSet.editor.font,
        fixedIcon: true,
        list: "no-icons",
        options: [
          "default_font",
          "arial",
          "arial_black",
          "comic_sans",
          "courier_new",
          "impact",
          "lucida_grande",
          "times_new_roman",
          "verdana"
        ]
      },
      "removeFormat"
    ],
    ["hr", "link", "quote", "unordered", "ordered", "outdent", "indent"],
    ["insertImageLink"],
    ["undo", "redo"],
    ["toggleFullSceen"],
    ["viewsource"]
  ]

  /****************************************************************/
  // Insert image dialog
  /****************************************************************/

  WISIWYG_insertImageChoiceDialogTrigger: string | false = false
  WISIWYG_insertImageChoiceDialogClose () {
    this.WISIWYG_insertImageChoiceDialogTrigger = false
  }

  WISIWYG_insertImageChoiceAssignUID () {
    this.WISIWYG_insertImageChoiceDialogTrigger = this.generateUID()
  }

  /****************************************************************/
  // Change image path dialog
  /****************************************************************/

  WISIWYG_changeImagePathDialogTrigger: string | false = false
  WISIWYG_changeImagePathDialogClose () {
    this.WISIWYG_changeImagePathDialogTrigger = false
  }

  WISIWYG_changeImagePathAssignUID () {
    this.WISIWYG_changeImagePathDialogTrigger = this.generateUID()
  }

  /****************************************************************/
  // Keybinds management
  /****************************************************************/

  /**
   * Local keybinds
   */
  @Watch("SGET_getCurrentKeyBindData", { deep: true })
  processKeyPush () {
    // Quick new document
    if ((this.determineKeyBind("toggleCurrentWysiwygFullScreen") || this.determineKeyBind("toggleCurrentWysiwygFullScreenAlt")) && !this.SGET_getDialogsState) {
      const localFocus = document.activeElement?.closest(`#${this.inputDataBluePrint.id}`)

      if (localFocus) {
        this.toggleEditorFullScreen()
      }
      else {
        this.turnOffEditorFullScreen()
      }
    }
  }

  /****************************************************************/
  // FullScreen Scrolling support
  /****************************************************************/
  /**
  * Determines if the documents will recall their scroll distances and auto-scroll on switching ot not.
  */
  preventAutoScroll = false

  decounceScrollTimer = false as any

  mounted () {
    this.addEditorScrollWatcher()
    this.fullScreenAutoScroll()
  }

  updated () {
    this.addEditorScrollWatcher()
  }

  fullScreenAutoScroll () {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

    if (!editor) {
      return
    }

    const editorContent = editor.$el.querySelector(".q-editor__content")

    if (!editorContent) {
      return
    }

    const scrollTop = (this.fullScreenScrollDistance && !this.preventAutoScroll) ? this.fullScreenScrollDistance : 0

    setTimeout(() => {
      editorContent.scrollTo({ top: scrollTop, behavior: "auto" })
    }, 120)
  }

  addEditorScrollWatcher () {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

    if (!editor) {
      return
    }

    const editorContent = editor.$el.querySelector(".q-editor__content")

    if (!editorContent) {
      return
    }

    setTimeout(() => {
      editorContent.addEventListener("scroll", (e: Event) => {
        this.watchEditorScroll(e)
      })
    }, 100)
  }

  beforeUpdate () {
    const editor = this.$refs[`wysiwygField${this.inputDataBluePrint.id}`] as QEditor

    if (!editor) {
      return
    }

    const editorContent = editor.$el.querySelector(".q-editor__content")

    if (!editorContent) {
      return
    }
    editorContent.removeEventListener("scroll", (e: Event) => {
      this.watchEditorScroll(e)
    })
  }

  watchEditorScroll (event: Event) {
    if (this.preventAutoScroll || !this.editMode || !this.fullScreenStatus.value) {
      return
    }

    if (this.decounceScrollTimer) {
      window.clearTimeout(this.decounceScrollTimer)
    }

    this.decounceScrollTimer = window.setTimeout(() => {
      const dataCopy: I_OpenedDocument = extend(true, {}, this.findRequestedOrActiveDocument())

      // @ts-ignore
      dataCopy.fullScreenScrollDistance = event.target.scrollTop

      // Attempts to add current document to list
      const dataPass = { doc: dataCopy, treeAction: false }
      this.SSET_updateOpenedDocument(dataPass)
    }, 100)
  }
}
</script>

<style lang='scss'>
.fieldWysiwyg {
  padding-top: 15px;
  padding-bottom: 15px;
}
</style>
