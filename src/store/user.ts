import { reactive, readonly, computed } from "vue"
import { AuthPayload, AuthLogin, AuthCreateUser } from '@/types/types'
import { listStore } from '@/store/lists'
import axios, { AxiosResponse } from 'axios'

const initialState = {
  user: {},
  url: new URL(window.location.href),
  settings: {}
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

  if (payload.method === 'signOut') {
    return signOut()
  }

  return {
    status: 'failed'
  }
}

const authCheck = async () => {
  const endPoint = `http://${state.url.hostname}:${process.env.VUE_APP_SERVERPORT}/auth/check`
  const result: AxiosResponse = await axios.get(endPoint)
  state.user = result.data.status === 'success' ? result.data.session : {}
  return result.data.session
}

const login = async (loginInfo: unknown | AuthLogin) => {
  try {
    const endPoint = `http://${state.url.hostname}:${process.env.VUE_APP_SERVERPORT}/auth/login`
    const result: AxiosResponse = await axios.post(endPoint, loginInfo)
    if (result.data.session) {
      state.user = result.data.session
      listStore.do.getAllLists(result.data.session.userId)
      return result.data
    } else {
      return { status: 'failed', message: 'Login has failed', reason: 'securityForbidsReason' }
    }
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
    const endPoint = `http://${state.url.hostname}:${process.env.VUE_APP_SERVERPORT}/auth/creatUser`
    const result: AxiosResponse = await axios.post(endPoint, createUserInfo)
    return result
  } catch (error) {
    return { status: 'failed', message: error }
  }
}

const signOut = async () => {
  try {
    const endPoint = `http://${state.url.hostname}:${process.env.VUE_APP_SERVERPORT}/auth/signOut`
    const result: AxiosResponse = await axios.post(endPoint)
    if (result.data.status === 'success') {
      state.user = {}
    }
  } catch (error) {
    return { status: 'failed', message: error }
  }
}

const user = computed(() => {
  return state.user
})

const reset = () => {
  Object.assign(state, initialState)
}

export const userStore = readonly({
  state: state,
  get: {
    user
  },
  do: {
    auth,
    authCheck,
    reset
  }
})
