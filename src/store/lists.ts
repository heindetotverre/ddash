import { reactive, readonly, computed } from "vue"
import { CrawlData, List, ListContent } from '@/types/types'
import axios, { AxiosResponse } from 'axios'

const initialState = {
  listsBeingPulled: [] as Array<CrawlData>
}

const state = reactive({
  ...initialState
})

const getListFromUrl = async (payload: CrawlData, newList: boolean | void) => {
  const existingList = state.listsBeingPulled.find(l => l.listId === payload.listId)
  if (!existingList && !newList) {
    state.listsBeingPulled.push({
      ...payload,
      listId: payload.listId
    })
  }
  const url = new URL(window.location.href)
  const endPoint = `http://${url.hostname}:${process.env.VUE_APP_SERVERPORT}/lists/crawl`
  try {
    const result: AxiosResponse = await axios.post(endPoint, payload)
    const constructedResult: List = {
      listName: payload.name,
      listContent: formatLinks(result.data, payload),
      listId: payload.listId
    }
    if (payload.searchParams.saveList) {
      saveList(payload)
    }
    return constructedResult
  } catch (error) {
    return { status: 'failed', message: error }
  }
}

const saveList = async (payload: CrawlData) => {
  const url = new URL(window.location.href)
  const endPoint = `http://${url.hostname}:${process.env.VUE_APP_SERVERPORT}/lists/save`
  try {
    await axios.post(endPoint, payload)
  } catch (error) {
    return { status: 'failed', message: error }
  }
}

const deleteList = async (payload: string) => {
  const url = new URL(window.location.href)
  const endPoint = `http://${url.hostname}:${process.env.VUE_APP_SERVERPORT}/lists/delete`
  try {
    await axios.post(endPoint, payload)
  } catch (error) {
    return { status: 'failed', message: error }
  }
}

const getAllLists = async (payload: string) => {
  const url = new URL(window.location.href)
  const endPoint = `http://${url.hostname}:${process.env.VUE_APP_SERVERPORT}/lists/get`
  try {
    const getListsResult = await axios.post(endPoint, { payload }) as AxiosResponse
    if (getListsResult.data.lists.length) {
      const lists = getListsResult.data.lists as Array<CrawlData>
      lists.forEach(l => {
        getListFromUrl({
          ...l,
          searchParams: {
            ...l.searchParams,
            saveList: false
          }
        })
      })
    }
  } catch (error) {
    return { status: 'failed', message: error }
  }
}

const listsBeingPulled = computed((): Array<CrawlData> => {
  return state.listsBeingPulled
})

const reset = () => {
  Object.assign(state, initialState)
}

export const listStore = readonly({
  state: state,
  get: {
    listsBeingPulled
  },
  do: {
    getAllLists,
    getListFromUrl,
    deleteList,
    reset
  }
})

const formatLinks = (list: Array<ListContent>, crawlData: CrawlData) => {
  const splitUrl = crawlData.url.split('/')
  const newLink = splitUrl.filter((u) => {
    return u !== splitUrl[splitUrl.length - 1]
  }).join('/')
  return list.map(l => {
    return {
      title: l.title,
      link: !l.link.includes('http') ? newLink + l.link : l.link
    }
  })
}