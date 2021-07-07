<template>
  <div class="animate" ref="animateRef">
    <div class="ddash__list" ref="contentRef" :id="id">
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
          <a :href="item.link">{{ item.link }}</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, nextTick, onMounted, watch } from 'vue'
import { listStore } from '@/store/lists'
import { formStore } from '@/store/forms'
import { userStore } from '@/store/user'
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
import IconList from '@/components/layout/iconList.vue'

const maxHeight = 600
const initialListHeight = 37

export default defineComponent({
  name: 'ddashList',
  emits: ['removeList', 'signIn'],
  components: {
    Forms,
    IconList
  },
  props: {
    id: {
      type: String,
      required: true
    },
    user: {
      type: Object,
      userId: {
        type: String
      }
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
        ? getList()
        : false
    }

    const createList = async () => {
      validated.value = false
      status.value = 'create'
      setHeight()
    }

    const cancelList = () => {
      setHeight(initialListHeight)
      setTimeout(() => {
        status.value = 'init'
      }, 150)
    }

    const removeList = () => {
      setHeight(0)
      setTimeout(() => {
        emit('removeList', props.id)
      }, 150)
    }

    const getList = async () => {
      if (!validated.value) {
        message.value = 'Please enter selectors'
        status.value = 'unvalidated'
        setHeight()
        return
      }
      status.value = 'busy'
      setHeight()
      try {
        const result: List = await listStore.do.getListFromUrl(crawlData)
        ddashList.value = result.listContent
        status.value = 'ready'
        setHeight()
      } catch (error) {
        message.value = error.response ? error.response.data.message : error
        status.value = 'error'
        setHeight()
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
            }
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
      } else {
        formSchema.value = mapping('forms', 'CreateList')
      }
    }

    watch(props, () => {
      updateSaveList()
    })

    onMounted(() => {
      updateSaveList()
      setHeight()
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
