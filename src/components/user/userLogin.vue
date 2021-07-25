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
import { defineComponent, ref, onMounted } from 'vue'
import { userStore } from '@/store/user'
import { stringStore } from '@/store/strings'
import Forms from '@/components/factory/forms.vue'
import { mapping } from '@/maps/mapping'
import { setDimensionsUtil } from '@/utils/setDimensions'
import {
  FormEvent,
  FormEvaluationEvent,
  AuthLogin,
  AuthCreateUser,
  ApiResponse,
  DimensionChangePayload
} from '@/types/types'

export default defineComponent({
  name: 'ddashUser',
  components: {
    Forms
  },
  emits: ['cancel'],
  setup(props, { emit }) {
    const status = ref<string>('init')
    const strings = stringStore.get.getStrings
    const message = ref(strings.login_prompt)
    const validationMessage = ref(strings.unsuccesfull_validation_login)
    const formValues = ref<Record<string, unknown>>({})
    const updatedValues = ref()
    const authMethod = ref('signIn')

    const formSchemaSignIn = ref(mapping('forms', 'SignIn'))
    const formSchemaSignUp = ref(mapping('forms', 'SignUp'))

    const contentRef = ref()
    const animateRef = ref()

    const setDimensions: (dimensionsPayload: DimensionChangePayload) => void =
      setDimensionsUtil

    const targetFunctionEvaluation = (targetFunction: string) => {
      if (targetFunction === 'cancelSignIn') {
        close()
      }
      authMethod.value === targetFunction
        ? auth()
        : ((authMethod.value = targetFunction), (status.value = 'init'))

      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        editDimension: 'height'
      })
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
        if (result.status === 'success') {
          close()
        }
        if (result.status === 'failed') {
          updatedValues.value =
            authMethod.value === 'signUp'
              ? {
                  ...formValues,
                  email: '',
                  password: '',
                  passwordCheck: ''
                }
              : {
                  password: ''
                }
          validationMessage.value = result.message
          status.value = 'unvalidated'
          setDimensions({
            animateElement: animateRef.value,
            contentElement: contentRef.value,
            editDimension: 'height'
          })
        }
      } else {
        status.value = 'unvalidated'
      }
    }

    const close = () => {
      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        editDimension: 'height',
        value: 0
      })
      setTimeout(() => {
        emit('cancel')
      }, 150)
    }

    const formInput = (formInput: FormEvent) => {
      formValues.value[formInput.field] = formInput.value
      status.value === 'unvalidated' ? (status.value = 'init') : false
      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        editDimension: 'height'
      })
    }

    const validate = (data: FormEvaluationEvent) => {
      data.validationStatus ? (status.value = 'validated') : false
    }

    onMounted(() => {
      setDimensions({
        animateElement: animateRef.value,
        contentElement: contentRef.value,
        editDimension: 'height'
      })
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