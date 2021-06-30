import { reactive, readonly, computed } from "vue"
import {
  FormField,
  FormObject,
  FormFieldUpdate
} from '@/types/types'
import { mapping } from '@/maps/mapping'

const initialState = {
  forms: [] as Array<FormObject>
}

const state = reactive({
  ...initialState
})

const updateFields = (form: FormObject, fields: Array<FormFieldUpdate>) => {
  const editedFields = form.fields.reduce((acc, curr) => {
    const findfieldsToMatch = fields.find(field => field.fieldName === curr.name)
    return curr.name !== findfieldsToMatch?.fieldName
      ? acc
      : [
        ...acc,
        {
          ...curr,
          [findfieldsToMatch?.fieldKey]: findfieldsToMatch?.fieldValue
        }
      ]
  }, [] as Array<FormField>)

  const updatedFields = form.fields.map((originalField) => {
    const findNewField = editedFields.find(newField => newField.name === originalField.name)
    return originalField.name === findNewField?.name
      ? editedFields.find(
        (updatedField: FormField) => updatedField.name === findNewField?.name
      )
      : originalField
  }) as Array<FormField>

  const udatedForm: FormObject = {
    ...form,
    fields: updatedFields
  }

  return udatedForm
}

const getForm = computed((formName: string): FormObject => {
  const form = mapping('forms', formName) as FormObject
  state.forms.push(form)
  return form
})

export const formStore = readonly({
  state: state,
  get: {
    getForm,
    updateFields
  }
})
