import { reactive, readonly, computed } from "vue"
import { AuthPayload, AuthLogin, AuthCreateUser } from '@/types/types'

const initialState = {
  user: {},
  isLoggedIn: false
}

const state = reactive({
  ...initialState
})

const auth = (payload: AuthPayload) => {
  if (payload.method === 'signIn') {
    const loginInfo = payload.values
    return login(loginInfo)
  }

  if (payload.method === 'signUp') {
    const createUserInfo = payload.values
    return createUser(createUserInfo)
  }

  return {
    status: 'failed'
  }
}

const login = (loginInfo: unknown | AuthLogin) => {
  console.log(loginInfo)
  return {status: 'failed'}
}

const createUser = (createUserInfo: unknown | AuthCreateUser) => {
  console.log(createUserInfo)
  return {status: 'failed'}
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
    auth
  }
})
