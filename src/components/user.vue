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
import { FormEvent, FormEvaluationEvent, AuthResult, AuthLogin, AuthCreateUser } from '@/types/types'

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

    let authMethod = 'signIn'
    let formSchema = ref(mapping('forms', 'SignIn'))

    const contentRef = ref()
    const animateRef = ref()

    const targetFunctionEvaluation = (targetFunction: string) => {
      if (targetFunction === 'cancel') {
        close()
      }

      authMethod === targetFunction
        ? auth()
        : switchAuth(targetFunction)

      setHeight()
    }

    const auth = async () => {
      console.log('auth', 'status: ' + status.value)
      if (status.value === 'validated') {
        const authInfo = formValues.value as unknown | AuthLogin | AuthCreateUser

        const result = (await userStore.do.auth({
          method: authMethod,
          values: authInfo
        })) as AuthResult
        result.status === 'succes' ? close() : (status.value = 'loginFailed')
      } else {
        status.value = 'unvalidated'
      }
    }

    const switchAuth = (targetFunction: string) => {
      console.log('switch', 'status: ' + status.value)
      if (targetFunction === 'signIn') {
        formSchema.value = mapping('forms', 'SignIn')
      }

      if (targetFunction === 'signUp') {
        formSchema.value = mapping('forms', 'SignUp')
      }

      authMethod = targetFunction
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
      animateRef,
      contentRef,
      formInput,
      formSchema,
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