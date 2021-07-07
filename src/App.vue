<template>
  <ddashCore />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { userStore } from '@/store/user'
import ddashCore from '@/components/core.vue'

export default defineComponent({
  name: 'Ddash',
  components: {
    ddashCore
  },
  setup() {
    onMounted(async () => {
      await userStore.do.authCheck()
    })
  }
})
</script>

<style lang="scss">
@import './src/assets/css/ddash.scss';
</style>
