<template>
  <form autocomplete="off" class="form" @submit.prevent="excecuteForm">
    <div
      v-for="(field, index) in form.fields"
      :key="field.name"
      @click="onClick(field.name)"
      class="form__group"
    >
      <component
        :is="mapComponents(field.component)"
        :type="field.type"
        :label="field.label"
        :id="`formItem_${index}_${field.name}`"
        :name="field.name"
        :required="field.required"
        :validation="
          validate({
            field: field.name,
            value: formValues[field.name]
          })
        "
        :disabled="field.disabled"
        :renderValidation="renderValidationResult"
        v-model="formValues[field.name]"
        @update:modelValue="
          onInput({ field: field.name, value: formValues[field.name] })
        "
        @blur="onBlur({ field: field.name, value: formValues[field.name] })"
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
    <IconList
      :iconGroup="{
        iconList: form.icons,
        name: form.name
      }"
      @targetFunction="targetFunction"
      v-if="form.icons"
    />
  </form>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import Button from '@/components/ui/button.vue'
import IconList from '@/components/factory/icons.vue'
import { validators } from '@/validators/validators'
import { componentMapping } from '@/maps/components'
import { FormEvent, FormField, ValidationResult } from '@/types/types'

export default defineComponent({
  name: 'Form',
  emits: [
    'input',
    'blur',
    'focus',
    'click',
    'submit',
    'validate',
    'targetFunction'
  ],
  components: {
    Button,
    IconList
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
    updatedFormValues: {
      type: Object
    },
    status: {
      type: String
    }
  },
  setup(props, { emit }) {
    let formValues = ref<Record<string, unknown>>({})
    const validationErrors = [] as Array<ValidationResult>
    const renderValidationResult = ref(false)

    const excecuteForm = () => {
      emit('submit', formValues.value)
    }

    const targetFunction = (formFunction: string) => {
      emit('targetFunction', formFunction)
    }

    const mapComponents = (component: string) => {
      return componentMapping(component)
    }

    const onInput = (data: FormEvent) => {
      emit('input', { field: data.field, value: data.value })
      formValues.value[data.field] = data.value
    }

    const onBlur = (data: FormEvent) => {
      validate(data)
    }

    const onFocus = (data: FormEvent) => {
      emit('focus', { field: data.field, value: data.value })
    }

    const onClick = (data: string) => {
      emit('click', data)
    }

    const validate = (inputData: FormEvent) => {
      const field = props.form.fields.find(
        (f: FormField) => f.name === inputData.field
      )

      props.form.fields.forEach((f: FormField, index: number) => {
        const value = formValues.value[f.name]
          ? (formValues.value[f.name] as string)
          : ('' as string)

        const error = f.required ? !validators(f.validator, value) : false

        validationErrors[index] = {
          fieldName: f.name,
          error: error
        }
      })

      const formError = validationErrors.find((e) => e.error)
      !formError
        ? emit('validate', {
            validationStatus: true,
            formValues: formValues.value
          })
        : emit('validate', {
            validationStatus: false
          })

      return validators(field.validator, inputData.value) || !field.required
        ? 'approved'
        : 'error'
    }

    watch(props, () => {
      if (props.updatedFormValues) {
        const form = {
          ...formValues.value,
          ...props.updatedFormValues
        } as Record<string, unknown>
        formValues.value = form

        props.updatedFormValues.clear ? (formValues.value = {}) : false
      }

      props.status === 'unvalidated'
        ? (renderValidationResult.value = true)
        : (renderValidationResult.value = false)
    })

    return {
      excecuteForm,
      formValues,
      mapComponents,
      onClick,
      onInput,
      onBlur,
      onFocus,
      renderValidationResult,
      targetFunction,
      validate
    }
  }
})
</script>
