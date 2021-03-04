<template>
    <q-dialog
      v-model="dialogModel"
      @hide="triggerDialogClose"
      >
      <q-card dark class="newProjectCheckDialog">
         <q-card-section class="row justify-center">
          <h6 class="text-center q-my-sm">New project</h6>
        </q-card-section>

        <q-card-section class="row justify-center q-mx-xl" v-if="projectExists">
          <div>
            Please note that the new project will <span class="text-bold text-secondary">COMPLETELY OVERWRITE</span> the currently opened project.
            <br>
            If you haven't done so already, please export your current project first to prevent a <span class="text-bold text-secondary">FULL LOSS</span> of all your current project data!
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-center">
            <q-input
              filled
              dark
              ref="newProjectInput"
              style="width: 400px;"
              label="New project name"
              v-model="newProjectName"
            />
          </div>

        </q-card-section>

        <q-card-actions align="around" class="q-mx-xl q-mt-lg q-mb-md">
          <q-btn
          flat
          label="Cancel"
          color="accent"
          v-close-popup />
          <q-btn
          flat
          v-if="projectExists"
          label="Export project"
          color="primary"
          @click="commenceExport"
           />
          <q-btn
            flat
            label="Create new project"
            :disable="newProjectName.length === 0"
            color="primary"
            v-close-popup
            @click="createNewProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">

import { Component, Watch } from "vue-property-decorator"

import DialogBase from "src/components/dialogs/_DialogBase"
import { retrieveCurrentProjectName, exportProject, createNewProject } from "src/scripts/projectManagement/projectManagent"

@Component({
  components: { }
})
export default class ImportProjectCheckDialog extends DialogBase {
  @Watch("dialogTrigger")
  async openDialog (val: string|false) {
    if (val) {
      if (this.SGET_getDialogsState) {
        return
      }
      this.SSET_setDialogState(true)
      this.dialogModel = true
      this.newProjectName = ""
      this.projectExists = await retrieveCurrentProjectName()

      /*eslint-disable */
      // @ts-ignore
      this.$refs.newProjectInput.focus()
      /* eslint-enable */
    }
  }

  projectExists: undefined | string | boolean = false

  newProjectName = ""

  createNewProject () {
    createNewProject(this.newProjectName, this.$router).catch(e => console.log(e))
  }

  async commenceExport () {
    const projectName = await retrieveCurrentProjectName()
    exportProject(projectName)
  }
}
</script>

<style lang="scss" scoped>

.newProjectCheckDialog {
  min-width: 600px;
}
</style>