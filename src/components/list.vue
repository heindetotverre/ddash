<template>
  <div class="animate" ref="animateRef">
    <div class="ddash__list" ref="listRef" :id="id">
      <div class="group group--icons padded--small fixed">
        <Icon
          v-if="status === 'init'"
          @click="createList"
          type="link"
          image="add-rounded"
          text="Create list"
        />
        <Icon
          v-if="status !== 'init' && status !== 'ready'"
          :disabled="!validated || status === 'busy' || status === 'ready'"
          @click="pullList"
          type="link"
          image="add-rounded"
          text="Get list"
        />
        <Icon v-if="status === 'busy'" image="loading" class="rotating" />
        <Icon
          v-if="status !== 'create' && status !== 'unvalidated'"
          @click="removeList($event)"
          type="link"
          image="cancel"
          text="Remove list"
        />
        <Icon
          v-if="status === 'create' || status === 'unvalidated'"
          @click="cancelList"
          type="link"
          image="cancel"
          text="Cancel"
        />
      </div>
      <div
        v-if="status === 'create' || status === 'unvalidated'"
        class="form__create-list padded--small"
      >
        <Forms :form="formSchema" @validate="validate" />
      </div>
      <div
        v-if="status === 'unvalidated' || status === 'error'"
        class="message padded--small"
      >
        {{ message }}.
        <span v-if="status === 'error'"
          >Click <a class="link" @click="pullList">here</a> to try again</span
        >
      </div>
      <div class="ddash__content">
        <div
          v-for="item in ddashList"
          :key="item"
          class="ddash__item padded--small"
        >
          <h2>{{ item.title }}</h2>
          <a :href="item.link">{{ item.link }}</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, nextTick, onMounted } from 'vue'
import { listStore as list } from '@/store/lists'
import {
  List,
  ListContent,
  CrawlData,
  FormEvaluationEvent
} from '@/types/types'
import { formMapping } from '@/maps/mapping'
import Forms from '@/components/factory/forms.vue'
import Icon from '@/components/ui/icon.vue'

const maxHeight = 500

export default defineComponent({
  name: 'ddashList',
  emits: ['removeList'],
  components: {
    Forms,
    Icon
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const status = ref<string>('init')
    const validated = ref<boolean>(false)
    const ddashList = ref<Array<ListContent>>([])
    const message = ref<string>('')
    const formSchema = ref(formMapping('CreateList'))

    let crawlData = {} as CrawlData

    const listRef = ref()
    const animateRef = ref()

    const pullList = async () => {
      if (!validated.value) {
        message.value = 'Please enter selectors'
        status.value = 'unvalidated'
        setHeight()
        return
      }
      status.value = 'busy'
      setHeight()
      try {
        const result: List = await list.do.getListFromUrl(crawlData)
        if (result) {
          ddashList.value = result.listContent
          status.value = 'ready'
          setHeight()
        } else {
          message.value = 'Something went wrong'
          status.value = 'error'
          setHeight()
        }
      } catch (error) {
        message.value = error.response ? error.response.data.message : error
        status.value = 'error'
        setHeight()
      }
    }

    const validate = (data: FormEvaluationEvent) => {
      validated.value = data.validationStatus
      crawlData = {
        name: data.formValues.listName,
        url: data.formValues.listUrl,
        searchParams: {
          listSelector: data.formValues.listSelector,
          itemSelector: data.formValues.itemSelector,
          titleSelector: data.formValues.titleSelector,
          linkSelector: data.formValues.linkSelector,
          cookieWallAcceptSelector: data.formValues.cookieWallAcceptSelector
            ? data.formValues.cookieWallAcceptSelector
            : ''
        }
      }
    }

    const createList = async () => {
      validated.value = false
      status.value = 'create'
      setHeight()
    }

    const cancelList = () => {
      setHeight(37)
      setTimeout(() => {
        status.value = 'init'
      }, 150)
    }

    const removeList = () => {
      emit('removeList', props.id)
    }

    const setHeight = async (data: number | void) => {
      await nextTick()
      if (typeof data === 'number') {
        animateRef.value.style.height = data + 'px'
      } else {
        listRef.value.clientHeight > maxHeight
          ? (animateRef.value.style.height = maxHeight + 'px')
          : (animateRef.value.style.height = listRef.value.clientHeight + 'px')
      }
    }

    onMounted(() => {
      setHeight()
    })

    return {
      animateRef,
      cancelList,
      createList,
      ddashList,
      formSchema,
      listRef,
      message,
      pullList,
      removeList,
      status,
      validate,
      validated
    }
  }
})
</script>
