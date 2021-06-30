<template>
  <div v-if="status === 'init'" :class="`message`">
    {{ message }}
  </div>
  <div class="admin admin--signup">
    <Forms
      :status="status"
      :form="formSchema"
      @targetFunction="targetFunction"
      @validate="validate"
      @input="formInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { userStore } from '@/store/user'
import Forms from '@/components/factory/forms.vue'
import { mapping } from '@/maps/mapping'
import { FormEvaluationEvent } from '@/types/types'

export default defineComponent({
  name: 'ddashUser',
  components: {
    Forms
  },
  emits: ['cancel'],
  setup(props, { emit }) {
    const status = ref<string>('init')
    const message = ref('To save your list you have to login')
    let formSchema = ref(mapping('forms', 'SignIn'))

    const targetFunction = (data: string, payload: unknown) => {
      data === 'signIn'
        ? signIn(payload)
        : data === 'signUp'
        ? signUp()
        : data === 'cancelSignIn'
        ? cancel()
        : false
    }

    const signIn = (payload: unknown) => {
      status.value !== 'unvalidated'
        ? userStore.do.signIn(payload)
        : (status.value = 'unvalidated')
    }

    const signUp = () => {
      formSchema.value = mapping('forms', 'SignUp')
    }

    const cancel = () => {
      emit('cancel')
    }

    const validate = (data: FormEvaluationEvent) => {
      data.validationStatus ? (status.value = 'unvalidated') : false
    }

    const formInput = async () => {
      status.value = 'init'
    }

    return {
      formInput,
      formSchema,
      message,
      targetFunction,
      status,
      validate
    }
  }
})
</script>