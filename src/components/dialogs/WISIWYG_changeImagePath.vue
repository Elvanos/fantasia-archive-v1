<template>
    <q-dialog
      v-model="dialogModel"
      @before-hide="triggerDialogClose"
      no-route-dismiss
      >

      <q-card dark class="WISIWYG_changeImageDialog">
        <q-card-section class="row justify-center">
          <h6 class="text-center q-my-sm">Change image path</h6>
        </q-card-section>

        <q-card-section class="row justify-around">
           <q-input
            v-model="imagePath"
            outlined
            filled
            dense
            type="url"
            style="width: 80%;"
            label="Image path"
            ref="changeImagePathRef"
          />
        </q-card-section>

        <q-card-section class="row justify-around">
           <q-card-actions align="around">
              <q-btn
              flat
              label="Submit"
              color="primary"
              @click="passImagePath"
              />
            </q-card-actions>
        </q-card-section>

      </q-card>
    </q-dialog>
</template>

<script lang="ts">

import { Component, Watch, Prop } from "vue-property-decorator"

import DialogBase from "src/components/dialogs/_DialogBase"

@Component({
  components: { }
})
export default class WISIWYG_changeImagePath extends DialogBase {
  /**
   * React to dialog opening request
   */
  @Watch("dialogTrigger")
  checkForOpenedProject (val: string|false) {
    if (val) {
      this.openDialog().catch(e => console.log(e))
    }
  }

  @Prop() readonly currentImagePath!: string

  @Prop() readonly currentImageTarget!: HTMLImageElement

  imagePath = ""

  /**
   * Open the the dialog if project is present on the window
   */
  async openDialog () {
    if (this.SGET_getDialogsState) {
      return
    }
    this.SSET_setDialogState(true)
    this.dialogModel = true

    await this.$nextTick()

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.$refs.changeImagePathRef.focus()
    this.imagePath = this.currentImagePath
  }

  passImagePath () {
    this.$emit("passing-image-path-change", this.imagePath, this.currentImageTarget)
    this.triggerDialogClose()
  }
}
</script>

<style lang="scss" scoped>

.WISIWYG_changeImageDialog {
  min-width: 800px;
}
</style>
