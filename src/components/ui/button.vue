<template>
  <button :class="setClasses()">
    <slot />
  </button>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Button',
  props: {
    classes: {
      type: String
    }
  },
  setup(props) {
    const setClasses = () => {
      return `button ${props.classes ? props.classes : ''}`
    }

    return {
      setClasses
    }
  }
})
</script>
