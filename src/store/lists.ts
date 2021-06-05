import { reactive, readonly, computed } from "vue"
import { CrawlData, List } from '@/types/types'
import axios, { AxiosResponse } from 'axios'

const initialState = {
  lists: [] as Array<List>
}

const state = reactive({
  ...initialState
})

const getListFromUrl = async (payload: CrawlData): Promise<List> => {
  const url = new URL(window.location.href)
  const endPoint = `http://${url.hostname}:${process.env.VUE_APP_SERVERPORT}/`
  const result: AxiosResponse = await axios.post(endPoint, payload)
  const constructedResult: List = {
    listName: payload.name,
    listContent: result.data,
    listId: `list_${payload.name}_${state.lists.length}`
  }
  state.lists.push(constructedResult)
  return constructedResult
}

const getList = computed((): Array<List> => {
  return state.lists
})

const reset = () => {
  Object.assign(state, initialState)
}

export const listStore = readonly({
  state: state,
  get: {
    getList
  },
  do: {
    getListFromUrl,
    reset
  }
})
