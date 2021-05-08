<template>
 <q-tooltip
  content-class="documentPreviewWrapper"
  :content-style="`z-index: ${specialZIndex} !important;`"
  :delay="customDelay"
  max-width="700px"
  max-height="600px"
  :target="customTarget"
  :offset="[0, 0]"
  :anchor="customAnchor"
  :self="customSelf"
  @show="openDocumentPreview"
  @before-hide="consitentDocumentPreviewSwitch"
  v-model="documentPreviewSwitch"
  transition-show="scale"
  transition-hide="scale"
  >
    <div
      v-if="localBlueprint"
      class="documentPreviewContent"
      @mouseenter="clearCloseTimer"
      @mouseleave="setCloseTimer"
    >
     <div
        v-for="field in localBlueprint.extraFields"
        :key="`${field.id}`"
        class="col-12 q-mb-md"
        v-show="hasValueFieldFilter(field)"
      >

        <Field_Break
        class="inputWrapper break"
        v-if="field.type === 'break' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        />

        <Field_Text
        class="inputWrapper"
        v-if="field.type === 'text' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

        <Field_Number
        class="inputWrapper"
        v-if="field.type === 'number' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

        <Field_Switch
        class="inputWrapper"
        v-if="field.type === 'switch' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

        <Field_ColorPicker
        class="inputWrapper"
        v-if="field.type === 'colorPicker' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

        <Field_List
        class="inputWrapper"
        v-if="field.type === 'list' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

        <Field_SingleSelect
        class="inputWrapper"
        v-if="field.type === 'singleSelect' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

        <Field_MultiSelect
        class="inputWrapper"
        v-if="field.type === 'multiSelect' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

        <Field_SingleRelationship
        class="inputWrapper"
        v-if="(field.type === 'singleToNoneRelationship' || field.type === 'singleToSingleRelationship' || field.type === 'singleToManyRelationship') && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        :current-id="localDocument._id"
        :recursive="true"
        @menu-mode="reactToMenuMode"
        @menu-enter="reactToMenuEnter"
        @menu-leave="reactToMenuLeave"
        />

        <Field_MultiRelationship
        class="inputWrapper"
        v-if="(field.type === 'manyToNoneRelationship' || field.type ===
        'manyToSingleRelationship' || field.type === 'manyToManyRelationship') && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        :current-id="localDocument._id"
        :recursive="true"
        @menu-mode="reactToMenuMode"
        @menu-enter="reactToMenuEnter"
        @menu-leave="reactToMenuLeave"
        />

        <Field_Wysiwyg
        class="inputWrapper"
        v-if="field.type === 'wysiwyg' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="(retrieveFieldValue(localDocument, field.id)) ? retrieveFieldValue(localDocument, field.id) : ''"
        :isNew="false"
        :editMode="false"
        :current-id="localDocument._id"
        />

        <Field_Tags
        class="inputWrapper"
        v-if="field.type === 'tags' && categoryFieldFilter(field.id)"
        :inputDataBluePrint="field"
        :inputDataValue="retrieveFieldValue(localDocument, field.id)"
        :isNew="false"
        :editMode="false"
        />

     </div>

    </div>

  </q-tooltip>
</template>

<script lang="ts">

import { Component, Prop, Watch } from "vue-property-decorator"

import BaseClass from "src/BaseClass"
import { I_ShortenedDocument } from "src/interfaces/I_OpenedDocument"
import { I_Blueprint } from "src/interfaces/I_Blueprint"

import Field_Break from "src/components/fields/Field_Break.vue"
import Field_Text from "src/components/fields/Field_Text.vue"
import Field_Number from "src/components/fields/Field_Number.vue"
import Field_Switch from "src/components/fields/Field_Switch.vue"
import Field_ColorPicker from "src/components/fields/Field_ColorPicker.vue"
import Field_List from "src/components/fields/Field_List.vue"
import Field_SingleSelect from "src/components/fields/Field_SingleSelect.vue"
import Field_MultiSelect from "src/components/fields/Field_MultiSelect.vue"
import Field_Wysiwyg from "src/components/fields/Field_Wysiwyg.vue"
import Field_Tags from "src/components/fields/Field_Tags.vue"

@Component({
  components: {
    Field_Break,
    Field_Text,
    Field_Number,
    Field_Switch,
    Field_ColorPicker,
    Field_List,
    Field_SingleSelect,
    Field_MultiSelect,
    Field_SingleRelationship: () => import("src/components/fields/Field_SingleRelationship.vue"),
    Field_MultiRelationship: () => import("src/components/fields/Field_MultiRelationship.vue"),
    Field_Wysiwyg,
    Field_Tags
  }
})
export default class DocumentPreview extends BaseClass {
  /****************************************************************/
  // LOCAL CONTENT
  /****************************************************************/

  /**
   * Retrieved document ID
   */
  @Prop() readonly documentId!: string

  @Prop() readonly forceRefresh!: string

  @Watch("forceRefresh", { immediate: true })
  reactToForceRefresh () {
    this.reactToDocumentIDChange()
  }

  @Watch("documentId", { immediate: true })
  reactToDocumentIDChange () {
    if (this.documentId) {
      this.localDocument = this.SGET_document(this.documentId)
      if (!this.localDocument) {
        // @ts-ignore
        this.localDocument = this.SGET_openedDocument(this.documentId)
      }
      if (this.localDocument) {
        this.localBlueprint = this.SGET_blueprint(this.localDocument.type)
      }
    }
  }

  localDocument = false as unknown as I_ShortenedDocument
  localBlueprint = false as unknown as I_Blueprint

  /**
   * Check if field should be showing if the category setting is turned on
   */
  categoryFieldFilter (currentFieldID: string) {
    const isCategory = this.retrieveFieldValue(this.localDocument, "categorySwitch")

    const ignoredList = ["breakDocumentSettings", "name", "documentColor", "documentBackgroundColor", "parentDoc", "order", "categorySwitch", "minorSwitch", "deadSwitch", "finishedSwitch", "tags", "otherNames"]
    return (
      (
        (!isCategory && currentFieldID !== "categoryDescription") ||
        ignoredList.includes(currentFieldID)
      ) || (isCategory && currentFieldID === "categoryDescription")
    )
  }

  /**
   * Checks if the field in question
   */
  hasValueFieldFilter (field: any) {
    const value = this.retrieveFieldValue(this.localDocument, field.id)

    if (!value ||
    (Array.isArray(value) && value.length === 0) ||
    // @ts-ignore
     (value?.value && value.value.length === 0) ||
    // @ts-ignore
     (value.value === null)) {
      return false
    }
    return true
  }

  /****************************************************************/
  // GLOBAL OPTIONS
  /****************************************************************/

  /**
   * React to changes on the options store
   */
  @Watch("SGET_options", { immediate: true, deep: true })
  onSettingsChange () {
    this.isDarkMode = this.SGET_options.darkMode
  }

  /**
   * Determines if this is in dark-mode or not
   */
  isDarkMode = false

  /****************************************************************/
  // VISIBILITY MANAGEMENT
  /****************************************************************/

  /**
   * Variable string for closing of the popup due to external influences
   */
  @Prop({ default: "" }) readonly externalCloseTrigger!: string
  @Prop({ default: 999 }) readonly specialZIndex!: number
  @Prop({ default: 750 }) readonly customDelay!: number
  @Prop({ default: true }) readonly customTarget!: string | boolean
  @Prop({ default: "bottom middle" }) readonly customAnchor!: string
  @Prop({ default: "top middle" }) readonly customSelf!: string
  @Prop({ default: 500 }) readonly customCloseDelay!: number

  @Watch("externalCloseTrigger")
  reactToExternalClose () {
    this.setCloseTimer()
  }

  consitentDocumentPreviewSwitch () {
    if (this.documentPreviewLock) {
      this.documentPreviewSwitch = true
    }
  }

  documentPreviewClose () {
    this.documentPreviewLock = false
    this.documentPreviewSwitch = false
  }

  documentPreviewLock = false
  documentPreviewSwitch = false

  openDocumentPreview () {
    this.documentPreviewLock = true
  }

  clearCloseTimer () {
    clearTimeout(this.closeTimer)
  }

  setCloseTimer () {
    this.closeTimer = setTimeout(() => {
      this.documentPreviewClose()
    }, this.customCloseDelay)
  }

  /**
   * Debounce timer for nice user experience
   */
  closeTimer = null as any

  menuMode = false

  reactToMenuMode (menuMode: boolean) {
    this.menuMode = menuMode
  }

  reactToMenuEnter () {
    this.clearCloseTimer()
  }

  reactToMenuLeave () {
    this.setCloseTimer()
  }
}
</script>

<style lang="scss">
.documentPreviewWrapper.no-pointer-events {
  pointer-events: all !important;
  padding: 0 !important;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
}

.documentPreviewContent {
  padding: 20px;
  width: 700px;
  background-color: map-get($customColors, 'gunmetal-lighter') !important;
  color: #fff;

  .text-primary {
    color: #ffd673 !important;
  }

  .colorIndicator {
    border: 1px solid #c5c5c5 !important;
  }

  .connectionNote,
  .listNote {
    color: #fff !important;
    font-weight: normal;
  }

  .fieldWysiwyg {
    font-size: 14px;
    font-weight: normal;
  }
}
</style>