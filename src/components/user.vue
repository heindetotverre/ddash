<template>
  <div class="animate" ref="animateRef">
    <div class="admin admin--signup" ref="contentRef">
      <div class="message">
        {{ message }}
      </div>
      <Forms
        v-if="authMethod === 'signIn'"
        :status="status"
        :form="formSchemaSignIn"
        :updatedFormValues="updatedValues"
        @targetFunction="targetFunctionEvaluation"
        @input="formInput"
        @validate="validate"
      />
      <Forms
        v-if="authMethod === 'signUp'"
        :status="status"
        :form="formSchemaSignUp"
        :updatedFormValues="updatedValues"
        @targetFunction="targetFunctionEvaluation"
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
import {
  FormEvent,
  FormEvaluationEvent,
  AuthLogin,
  AuthCreateUser,
  ApiResponse
} from '@/types/types'

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

    const formSchemaSignIn = ref(mapping('forms', 'SignIn'))
    const formSchemaSignUp = ref(mapping('forms', 'SignUp'))

    const contentRef = ref()
    const animateRef = ref()

    const targetFunctionEvaluation = (targetFunction: string) => {
      if (targetFunction === 'cancelSignIn') {
        close()
      }
      authMethod.value === targetFunction
        ? auth()
        : ((authMethod.value = targetFunction), (status.value = 'init'))
      setHeight()
    }

    const auth = async () => {
      if (status.value === 'validated') {
        const authInfo = formValues.value as
          | unknown
          | AuthLogin
          | AuthCreateUser

        const result = (await userStore.do.auth({
          method: authMethod.value,
          values: authInfo
        })) as ApiResponse
        console.log(result)
        if (result.status === 'success') {
          close()
        }
        if (result.status === 'failed') {
          updatedValues.value = {
            ...formValues,
            email: '',
            password: '',
            passwordCheck: ''
          }
          validationMessage.value = result.message
          status.value = 'unvalidated'
          setHeight()
        }
      } else {
        status.value = 'unvalidated'
      }
    }

    const close = () => {
      setHeight(0)
      setTimeout(() => {
        emit('cancel')
      }, 150)
    }

    const formInput = (formInput: FormEvent) => {
      formValues.value[formInput.field] = formInput.value
      status.value = 'init'
      setHeight()
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
      formSchemaSignIn,
      formSchemaSignUp,
      message,
      targetFunctionEvaluation,
      updatedValues,
      status,
      validate,
      validationMessage
    }
  }
})
</script>