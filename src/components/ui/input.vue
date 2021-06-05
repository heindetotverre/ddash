<template>
  <label :for="id" class="form__label">
    <span>{{ label }}</span>
  </label>
  <div :class="`form__input ${setClasses()}`">
    <input
      @input="onInput($event)"
      @focus="onFocus()"
      @blur="onBlur()"
      :type="type"
      :id="id"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Input',
  emits: ['input', 'focus', 'blur'],
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    name: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('input', target.value)
    }

    const onFocus = () => {
      setClasses('form__input--focus')
      emit('focus')
    }

    const onBlur = () => {
      setClasses()
      emit('blur')
    }

    const setClasses = (data: string | void) => {
      return data ? data : ''
    }

    return {
      onBlur,
      onFocus,
      setClasses,
      onInput
    }
  }
})
</script>
