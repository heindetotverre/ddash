import { reactive, readonly, computed } from "vue"

const initialState = {
  user: {},
  isLoggedIn: false
}

const state = reactive({
  ...initialState
})

const signIn = (payload: unknown) => {
  console.log('signIn', payload)
}

const signUp = (payload: unknown) => {
  console.log('signUp', payload)
}

const isLoggedIn = computed((): boolean => {
  return state.isLoggedIn
})

export const userStore = readonly({
  state: state,
  get: {
    isLoggedIn
  },
  do: {
    signIn,
    signUp
  }
})
