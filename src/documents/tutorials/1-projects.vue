<template>
  <div class="wrapper">
    <div>
      projects
    </div>

    <div>
      <q-img
        :src="localImages.tut1_image1"
        contain
        />
    </div>
  </div>
</template>

<script lang="ts">
import BaseClass from "src/BaseClass"
import { tutorialImages } from "src/scripts/utilities/tutorialImages"

export default class TutorialPage_projects extends BaseClass {
  localImages = tutorialImages as unknown as any
}
</script>

<style  lang="scss">
</style>
