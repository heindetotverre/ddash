import forms from '@/maps/formMaps.json'
import { Form } from '@/types/types'

const formMapping = (data: string): Form | void => {
  const form = forms.find(f => {
    return f.name === data
  })
  return form
}

export {
  formMapping
}