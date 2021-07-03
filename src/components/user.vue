<template>
  <div class="animate" ref="animateRef">
    <div class="admin admin--signup" ref="contentRef">
      <div class="message">
        {{ message }}
      </div>
      <Forms
        :status="status"
        :form="formSchema"
        :updatedFormValues="updatedValues"
        @targetFunction="targetFunction"
        @input="formInput"
        @validate="validate"
      />
      <div v-if="status === 'unvalidated'" class="message message--error">
        {{ validationMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, onMounted } from 'vue'
import { userStore } from '@/store/user'
import Forms from '@/components/factory/forms.vue'
import { mapping } from '@/maps/mapping'
import { FormEvent, FormEvaluationEvent, LoginResult } from '@/types/types'

const maxHeight = 600

export default defineComponent({
  name: 'ddashUser',
  components: {
    Forms
  },
  emits: ['cancel'],
  setup(props, { emit }) {
    const status = ref<string>('init')
    const message = ref('To save your list you have to login')
    const validationMessage = ref('Please enter your credentials')
    const formValues = ref<Record<string, unknown>>({})
    const updatedValues = ref()
    const authMethod = ref('signIn')

    let formSchema = ref(mapping('forms', 'SignIn'))

    const contentRef = ref()
    const animateRef = ref()

    const targetFunction = (data: string) => {
      data === 'signIn'
        ? ((formSchema.value = mapping('forms', 'SignIn')),
          setHeight(),
          (updatedValues.value = { clear: true }),
          (status.value = 'init'))
        : data === 'signUp'
        ? ((formSchema.value = mapping('forms', 'SignUp')),
          setHeight(),
          (updatedValues.value = { clear: true }),
          (status.value = 'init'))
        : data === 'cancelSignIn'
        ? close()
        : false

      if (authMethod.value === data) {
        auth()
      }

      authMethod.value = data
    }

    const auth = async () => {
      if (status.value === 'validated') {
        const result = (await userStore.do.signIn({
          method: authMethod,
          values: formValues.value
        })) as LoginResult
        result.status === 'succes' ? close() : (status.value = 'loginFailed')
      } else {
        status.value = 'unvalidated'
      }

      setHeight()
    }

    const close = () => {
      setHeight(0)
      setTimeout(() => {
        emit('cancel')
      }, 150)
    }

    const formInput = (formInput: FormEvent) => {
      formValues.value[formInput.field] = formInput.value
      setHeight()
      status.value = 'init'
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

    const validate = (data: FormEvaluationEvent) => {
      data.validationStatus ? (status.value = 'validated') : false
    }

    onMounted(() => {
      setHeight()
    })

    return {
      authMethod,
      animateRef,
      contentRef,
      formInput,
      formSchema,
      message,
      targetFunction,
      updatedValues,
      status,
      validate,
      validationMessage
    }
  }
})
</script>