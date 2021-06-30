<template>
  <div class="icon" :class="classes">
    <div class="icon--svg">
      <svg><use :href="`${getSpriteUrl}#${image}`"></use></svg>
    </div>
    <div v-if="text">{{ text }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue'

export default defineComponent({
  props: {
    image: {
      type: String,
      required: true
    },
    iconType: {
      type: String
    },
    text: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const classes = ref('')
    const getSpriteUrl = ref('/img/svg/sprite.svg')

    const setClasses = () => {
      classes.value = `${props.iconType ? 'icon--link' : ''} 
        icon--${props.image} 
        ${props.text ? 'icon--text' : ''}
        ${props.disabled ? 'icon--disabled' : ''}`
    }

    watch(props, () => {
      setClasses()
    })

    onMounted(() => {
      setClasses()
    })

    return {
      classes,
      getSpriteUrl
    }
  }
})
</script>
