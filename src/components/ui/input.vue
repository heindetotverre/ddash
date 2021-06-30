<template>
  <label :for="id" class="form__label">
    <span>{{ label }}</span>
  </label>
  <div :class="`form__input ${classes}`">
    <input
      @input="onInput($event)"
      @focus="onFocus()"
      @blur="onBlur()"
      :type="type"
      :id="id"
      :value="modelValue"
      :disabled="disabled"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'Input',
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
      type: String
    },
    validation: {
      type: String
    },
    renderValidation: {
      type: Boolean
    }
  },
  setup(props, { emit }) {
    const input = ref('')
    const classes = ref('')

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('update:modelValue', target.value)
    }

    const onFocus = () => {
      setClasses(
        props.validation === 'error' && props.renderValidation
          ? 'form__input--focus form__input--error'
          : 'form__input--focus'
      )
      emit('focus')
    }

    const onBlur = () => {
      emit('blur')
    }

    const setClasses = (data: string) => {
      classes.value = data ? data : ''
    }

    watch(props, () => {
      props.renderValidation
        ? setClasses(props.validation === 'error' ? 'form__input--error' : '')
        : setClasses('')
    })

    return {
      input,
      onBlur,
      onFocus,
      onInput,
      classes
    }
  }
})
</script>
