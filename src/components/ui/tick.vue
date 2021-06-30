<template>
  <label :for="id" class="form__label">
    <span>{{ label }}</span>
  </label>
  <div :class="`form__tick ${setClasses()}`">
    <input
      @input.prevent="onInput($event)"
      @focus="onFocus()"
      :type="'checkbox'"
      :id="id"
      :checked="modelValue"
      :disabled="disabled"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Tick',
  emits: ['update:modelValue', 'focus', 'blur'],
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
    },
    required: {
      type: Boolean,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    },
    modelValue: {
      type: Boolean
    },
    validation: {
      type: String
    },
    renderValidation: {
      type: Boolean
    }
  },
  setup(props, { emit }) {
    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('update:modelValue', target.checked)
    }

    const onFocus = () => {
      setClasses('form__tick--focus')
      emit('focus')
    }

    const setClasses = (data: string | void) => {
      return data ? data : ''
    }

    return {
      onFocus,
      setClasses,
      onInput
    }
  }
})
</script>
