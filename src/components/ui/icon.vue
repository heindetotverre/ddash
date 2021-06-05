<template>
  <div class="icon" :class="classes">
    <div class="icon--svg">
      <svg><use :href="`${getSpriteUrl}#${imageId}`"></use></svg>
    </div>
    <div v-if="textRef">{{ textRef }}</div>
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
    type: {
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
    const imageId = ref(props.image)
    const textRef = ref(props.text)

    const setClasses = () => {
      classes.value = `${props.type ? 'icon--link' : ''} 
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
      getSpriteUrl,
      imageId,
      textRef
    }
  }
})
</script>
