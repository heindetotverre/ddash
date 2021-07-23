<template>
  <div class="animate" ref="animateRef">
    <div class="ddash__list" ref="contentRef" :listId="listId">
      <IconList
        :iconGroup="iconSchema"
        :status="status"
        :validated="validated"
        @targetFunction="targetFunction"
      />
      <div
        v-if="status === 'create' || status === 'unvalidated'"
        class="form__create-list padded--small"
      >
        <Forms
          :form="formSchema"
          :updatedFormValues="updatedValues"
          :status="status"
          @validate="validate"
          @input="formInput"
          @click="formClick"
        />
      </div>
      <div
        v-if="status === 'unvalidated' || status === 'error'"
        :class="`message ${
          status === 'unvalidated' || status === 'error' ? 'message--error' : ''
        } padded--small`"
      >
        {{ message }}
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
          <a :href="item.link" target="_blank">{{ item.link }}</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, nextTick, onMounted, watch } from 'vue'
import { listStore } from '@/store/lists'
import { formStore } from '@/store/forms'
import {
  List,
  ListContent,
  CrawlData,
  FormEvaluationEvent,
  FormEvent,
  FormObject
} from '@/types/types'
import { mapping } from '@/maps/mapping'
import Forms from '@/components/factory/forms.vue'
import IconList from '@/components/factory/icons.vue'

const width = 300
const maxHeight = 800
const initialListHeight = 37

export default defineComponent({
  name: 'ddashList',
  emits: ['removeList', 'signIn'],
  components: {
    Forms,
    IconList
  },
  props: {
    listId: {
      type: String,
      required: true
    },
    user: {
      type: Object,
      userId: {
        type: String
      }
    },
    crawlData: {
      type: Object
    }
  },
  setup(props, { emit }) {
    const status = ref<string>('init')
    const validated = ref<boolean>(false)
    const ddashList = ref<Array<ListContent>>([])
    const message = ref<string>('')
    const updatedValues = ref()

    const iconSchema = ref(mapping('icons', 'ListIcons'))
    const formSchema = ref(mapping('forms', 'CreateList'))

    let crawlData = {} as CrawlData

    const contentRef = ref()
    const animateRef = ref()

    const targetFunction = (data: string) => {
      data === 'createList'
        ? createList()
        : data === 'cancelList'
        ? cancelList()
        : data === 'removeList'
        ? removeList()
        : data === 'getList'
        ? getList(true)
        : false
    }

    const createList = async () => {
      validated.value = false
      status.value = 'create'
      setHeight()
      setWidth(width)
    }

    const cancelList = () => {
      setHeight(initialListHeight)
      setTimeout(() => {
        status.value = 'init'
      }, 150)
    }

    const removeList = () => {
      setHeight(0)
      setWidth(0)
      setTimeout(() => {
        emit('removeList', props.listId)
      }, 150)
    }

    const getList = async (newList: boolean | void) => {
      if (!validated.value) {
        message.value = 'Please enter selectors'
        status.value = 'unvalidated'
        setHeight()
        setWidth(width)
        return
      }
      status.value = 'busy'
      setHeight()
      try {
        const result = (await listStore.do.getListFromUrl(
          crawlData,
          newList
        )) as List
        ddashList.value = result.listContent
        animateRef.value.style.overflowY = 'auto'
        status.value = 'ready'
        setHeight()
        setWidth(width)
      } catch (error) {
        message.value = error.response ? error.response.data.message : error
        status.value = 'error'
        setHeight()
        setWidth(width)
      }
    }

    const validate = (data: FormEvaluationEvent) => {
      data.validationStatus
        ? ((validated.value = data.validationStatus),
          (crawlData = {
            name: data.formValues.listName,
            url: data.formValues.listUrl,
            searchParams: {
              ...data.formValues
            },
            userId: props.user ? props.user.userId : false,
            listId: props.listId
          }),
          (status.value = 'create'))
        : (validated.value = data.validationStatus)
    }

    const formInput = (formInput: FormEvent) => {
      status.value = 'create'
      setHeight()
    }

    const formClick = (data: string) => {
      if (data === 'saveList' && props.user && !props.user.userId) {
        emit('signIn', true)
      }
    }

    const setHeight = async (data: number | void) => {
      await nextTick()
      if (typeof data === 'number') {
        animateRef.value.style.height = data + 'px'
      } else {
        contentRef.value.clientHeight > maxHeight
          ? (animateRef.value.style.height = maxHeight + 'px')
          : (animateRef.value.style.height =
              contentRef.value.clientHeight + 'px')
      }
    }

    const setWidth = async (data: number | void) => {
      await nextTick()
      if (typeof data === 'number') {
        animateRef.value.style.width = data + 'px'
      } else {
        animateRef.value.style.width = contentRef.value.clientWidth + 'px'
      }
    }

    const updateSaveList = async () => {
      if (props.user && props.user.userId) {
        const form = formSchema.value as FormObject
        const updatedForm = formStore.do.updateFields(form, [
          {
            fieldName: 'saveList',
            fieldKey: 'disabled',
            fieldValue: false
          }
        ])
        formSchema.value = updatedForm
        updatedValues.value = {
          ...formSchema.value,
          saveList: true
        }
      } else {
        formSchema.value = mapping('forms', 'CreateList')
        updatedValues.value = {
          ...formSchema.value,
          saveList: false
        }
      }
    }

    watch(props, () => {
      updateSaveList()

      if (props.crawlData) {
        crawlData = props.crawlData as CrawlData
        getList()
      }
    })

    onMounted(() => {
      updateSaveList()
      setHeight()
      setWidth(width)

      if (props.crawlData) {
        crawlData = props.crawlData as CrawlData
        validated.value = true
        getList()
      }
    })

    return {
      animateRef,
      cancelList,
      contentRef,
      createList,
      ddashList,
      formClick,
      formInput,
      formSchema,
      getList,
      iconSchema,
      message,
      removeList,
      status,
      targetFunction,
      updatedValues,
      validate,
      validated
    }
  }
})
</script>
