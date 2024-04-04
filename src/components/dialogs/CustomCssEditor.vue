<template>
    <q-dialog
      v-model="dialogModel"
      persistent
      @before-hide="triggerDialogClose"
      no-route-dismiss
      >
      <q-card dark class="customCssEditorDialog">
         <q-card-section class="row justify-center">
          <h6 class="text-center q-my-sm">Custom CSS editor</h6>
        </q-card-section>

        <q-card-section class="codeMirrorWrapper row justify-center q-mx-xl">
         <codemirror v-model="customCSS" :options="cmOption" />
        </q-card-section>

        <q-card-actions align="right" class="q-mb-lg q-mt-md closeButton">
          <q-btn
            flat
            label="Cancel without saving"
            color="accent"
            v-close-popup />
          <q-btn
            flat
            label="Save CSS code changes"
            color="primary"
            v-close-popup
            @click="saveCustomCss()" />
        </q-card-actions>

      </q-card>
    </q-dialog>
</template>

<script lang="ts">

import { Component, Watch } from "vue-property-decorator"

import DialogBase from "src/components/dialogs/_DialogBase"
import { changeCurrentProjectSettings } from "src/scripts/projectManagement/projectManagent"

// @ts-ignore
import { codemirror } from "vue-codemirror"

// default css
import "codemirror/lib/codemirror.css"

// language
import "codemirror/mode/css/css.js"

// theme css
import "codemirror/theme/monokai.css"

// require active-line.js
import "codemirror/addon/selection/active-line.js"

@Component({
  components: {
    codemirror
  }
})
export default class CustomCssEditorDialog extends DialogBase {
  cmOption = {
    tabSize: 4,
    styleActiveLine: true,
    lineNumbers: true,
    line: true,
    autoRefresh: true,
    mode: "text/css",
    theme: "monokai"
  }

  customCSS = ""

  /**
   * React to dialog opening request
   */
  @Watch("dialogTrigger")
  checkForOpenedProject (val: string|false) {
    if (val) {
      const projectName = this.SGET_getProjectName
      if (projectName.length > 0) {
        this.openDialog()
      }
    }
  }

  /**
   * Open the the dialog if project is present on the window
   */
  openDialog () {
    if (this.SGET_getDialogsState) {
      return
    }
    this.SSET_setDialogState(true)
    this.dialogModel = true
    this.customCSS = this.SGET_getProjectCustomCSS
  }

  async saveCustomCss () {
    const newSettings = {
      projectCustomCSS: this.customCSS
    }

    await changeCurrentProjectSettings(newSettings)
    this.SSET_setProjectCustomCSS(this.customCSS)

    this.triggerDialogClose()
  }
}
</script>

<style lang="scss">

.customCssEditorDialog {
  width: 1400px;
  max-width: calc(100vw - 100px) !important;
  max-height: calc(100vh - 85px);
  height: 100%;

  .closeButton {
    width: 100%;
  }

  .codeMirrorWrapper{
    height: calc(100% - 175px);
  }

  .vue-codemirror{
    width: 100%;
    height: 100%;
    max-height: 100%;
  }

  .CodeMirror {
    height: 100%;
  }

  .CodeMirror-gutter-wrapper{
    left: -30px !important;
  }

  .CodeMirror pre.CodeMirror-line,
  .CodeMirror pre.CodeMirror-line-like{
    padding-left: 30px;
  }
}

</style>
