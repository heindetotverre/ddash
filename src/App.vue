<template>
  <ddashCore />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ddashCore from '@/components/core.vue'

export default defineComponent({
  name: 'Ddash',
  components: {
    ddashCore
  }
})
</script>

<style lang="scss">
@import './src/assets/css/ddash.scss';
</style>
