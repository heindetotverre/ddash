<template>
  <div class="animate" ref="animateRef">
    <div class="ddash__list" ref="contentRef" :listId="listId">
      <IconList
        :iconGroup="iconSchema"
        :status="status"
        :validated="isFormValidated"
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
          @validate="validateFrom"
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
        <span v-if="status === 'error'">
          <a class="link" @click="pullList">{{ strings.try_again }}</a>
        </span>
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
import { defineComponent, ref, onMounted, watch } from 'vue'
import { listStore } from '@/store/lists'
import { formStore } from '@/store/forms'
import { stringStore } from '@/store/strings'
import {
  List,
  ListContent,
  CrawlData,
  FormEvaluationEvent,
  FormObject,
  DimensionChangePayload
} from '@/types/types'
import { mapping } from '@/maps/mapping'
import Forms from '@/components/factory/forms.vue'
import IconList from '@/components/factory/icons.vue'
import { setDimensionsUtil } from '@/utils/setDimensions'

const fetchTime = 100000 // 200000 = ~ 3 min
const maxHeight = window.innerHeight
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
    const isFormValidated = ref<boolean>(false)
    const ddashList = ref<Array<ListContent>>([])
    const message = ref<string>('')
    const updatedValues = ref()
    const strings = stringStore.get.getStrings

    const iconSchema = ref(mapping('icons', 'ListIcons'))
    const formSchema = ref(mapping('forms', 'CreateList'))

    let crawlData = {} as CrawlData
    let startedInterval = false

    const contentRef = ref()
    const animateRef = ref()

    const setDimensions: (dimensionsPayload: DimensionChangePayload) => void =
      setDimensionsUtil

    const targetFunction = (data: string) => {
      data === 'createList'
        ? createList()
        : data === 'cancelList'
        ? cancelList()
        : data === 'removeList'
        ? removeList()
        : data === 'getList'
        ? getList()
        : false
    }

    const createList = async () => {
      status.value = 'create'
      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        editDimension: 'both'
      })
    }

    const cancelList = () => {
      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        value: initialListHeight,
        editDimension: 'height'
      })
      setTimeout(() => {
        status.value = 'init'
      }, 150)
    }

    const removeList = () => {
      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        editDimension: 'both',
        value: 0
      })
      setTimeout(() => {
        emit('removeList', props.listId)
      }, 150)
    }

    const getList = async () => {
      if (!isFormValidated.value) {
        message.value = strings.unsuccesfull_validation_list as string
        status.value = 'unvalidated'
        setDimensions({
          animateElement: animateRef.value,
          contentElement: contentRef.value,
          editDimension: 'height'
        })
        return
      }
      status.value = 'busy'
      try {
        const result = (await listStore.do.pullListFromUrl(crawlData)) as List
        ddashList.value = result.listContent
        animateRef.value.style.overflowY = 'auto'
        status.value = 'ready'
        setDimensions({
          animateElement: animateRef.value,
          contentElement: contentRef.value,
          editDimension: 'height',
          value: maxHeight
        })
        intervalFetch()
      } catch (error) {
        message.value = error.response ? error.response.data.message : error
        status.value = 'error'
        setDimensions({
          animateElement: animateRef.value,
          contentElement: contentRef.value,
          editDimension: 'height'
        })
      }
    }

    const validateFrom = (data: FormEvaluationEvent) => {
      data.validationStatus
        ? ((isFormValidated.value = data.validationStatus),
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
        : (isFormValidated.value = data.validationStatus)
    }

    const formInput = () => {
      status.value === 'unvalidated'
        ? ((status.value = 'create'),
          setDimensions({
            animateElement: animateRef.value,
            contentElement: contentRef.value,
            editDimension: 'height'
          }))
        : (status.value = 'create')
    }

    const formClick = (data: string) => {
      if (data === 'saveList' && props.user && !props.user.userId) {
        emit('signIn', true)
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

    const intervalFetch = () => {
      if (crawlData && !startedInterval) {
        startedInterval = true
        setInterval(() => {
          getList()
        }, fetchTime)
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
      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        editDimension: 'both'
      })

      if (props.crawlData) {
        crawlData = props.crawlData as CrawlData
        isFormValidated.value = true
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
      validateFrom,
      isFormValidated
    }
  }
})
</script>
