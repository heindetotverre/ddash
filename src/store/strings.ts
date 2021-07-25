import { reactive, readonly, computed } from "vue"
import importedStrings from '@/assets/strings.json'

const state = reactive({
  strings: importedStrings as Record<string, unknown>
})

const getStrings = computed((): Record<string, unknown> => {
  return state.strings
})

export const stringStore = readonly({
  state: state,
  get: {
    getStrings
  }
})
