import { reactive, readonly, computed } from "vue"
import { AuthPayload, AuthLogin, AuthCreateUser } from '@/types/types'
import axios, { AxiosResponse } from 'axios'

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

const login = async (loginInfo: unknown | AuthLogin) => {
  try {
    const url = new URL(window.location.href)
    const endPoint = `http://${url.hostname}:${process.env.VUE_APP_SERVERPORT}/auth/login`
    const result: AxiosResponse = await axios.post(endPoint, loginInfo)
    return result
  } catch (error) {
    return { status: 'failed', message: error }
  }
}

const createUser = async (createUserInfo: unknown | AuthCreateUser) => {
  const userInfo = createUserInfo as AuthCreateUser
  if (userInfo.password !== userInfo.passwordCheck) {
    return { data: { status: 'failed', message: 'Password don\'t match', reason: 'passwordsNotSame' } }
  }

  try {
    const url = new URL(window.location.href)
    const endPoint = `http://${url.hostname}:${process.env.VUE_APP_SERVERPORT}/auth/creatUser`
    const result: AxiosResponse = await axios.post(endPoint, createUserInfo)
    return result
  } catch (error) {
    return { status: 'failed', message: error }
  }
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
