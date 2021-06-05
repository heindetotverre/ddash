<template>
  <form autocomplete="off" class="form" @submit.prevent="excecuteForm">
    <div
      v-for="(field, index) in form.fields"
      :key="field.name"
      class="form__group"
    >
      <component
        :is="mapComponents(field.component)"
        :type="field.type"
        :label="field.label"
        :id="makeId(field.name, index)"
        :name="field.name"
        @input="onInput({ field: field.name, value: $event })"
        @blur="onBlur({ field: field.name })"
        @focus="onFocus({ field: field.name, value: formValues[field.name] })"
      >
      </component>
    </div>
    <component
      :is="mapComponents(button.component)"
      v-for="button in form.buttons"
      :key="button.id"
      :classes="button.classes"
      >{{ button.text }}</component
    >
  </form>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import Button from '@/components/ui/button.vue'
import { componentMapping } from '@/maps/components'
import { FormEvent } from '@/types/types'

export default defineComponent({
  name: 'Forms',
  emits: ['input', 'blur', 'focus', 'submit', 'validate'],
  components: {
    Button
  },
  props: {
    form: {
      type: Object,
      required: true,
      buttons: {
        type: Array,
        required: true
      },
      fields: {
        type: Array,
        required: true
      },
      name: {
        type: String,
        requird: true
      }
    },
    updatedForm: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  setup(props, { emit }) {
    const formValues = ref<Record<string, unknown>>({})

    const excecuteForm = () => {
      emit('submit', formValues.value)
    }

    const mapComponents = (component: string) => {
      return componentMapping(component)
    }

    const makeId = (name: string, index: string) => {
      return `formItem_${index}_${name}`
    }

    const onInput = (data: FormEvent) => {
      formValues.value[data.field] = data.value
    }

    const onBlur = () => {
      console.log('blur')
    }

    const onFocus = (data: FormEvent) => {
      console.log('focus', data)
    }

    watch(formValues.value, (updatedValue) => {
      if (
        updatedValue.itemSelector &&
        updatedValue.linkSelector &&
        updatedValue.listSelector &&
        updatedValue.titleSelector &&
        updatedValue.listUrl &&
        updatedValue.listName
      ) {
        emit('validate', {
          validationStatus: true,
          formValues: formValues.value
        })
      }
    })

    return {
      excecuteForm,
      formValues,
      makeId,
      mapComponents,
      onInput,
      onBlur,
      onFocus
    }
  }
})
</script>
