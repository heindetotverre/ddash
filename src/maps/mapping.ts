import forms from '@/maps/forms.json'
import icons from '@/maps/icons.json'
import { FormObject, IconGroup } from '@/types/types'

const mapping = (resourceKind: string, resourceToMap: string): FormObject | IconGroup | void => {
  if (resourceKind === 'forms') {
    const mappedForm = forms.find(f => {
      return f.name === resourceToMap
    })

    return mappedForm
  }

  if (resourceKind === 'icons') {
    const mappedIconGroup = icons.find(f => {
      return f.name === resourceToMap
    })

    return mappedIconGroup
  }
}

export {
  mapping
}