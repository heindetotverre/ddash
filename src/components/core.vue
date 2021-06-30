<template>
  <section class="ddash">
    <div class="ddash__core">
      <component
        v-for="item in componentList"
        :key="item.id"
        :is="item.component"
        :id="item.id"
        @removeList="removeList"
        @signIn="signIn"
      ></component>
      <div class="ddash__list">
        <div class="group padded--small">
          <Icon
            @click="addList"
            iconType="link"
            image="add-rounded"
            text="Add list"
          />
        </div>
      </div>
    </div>
    <Modal v-if="showLogin">
      <User @cancel="cancelLogin" />
    </Modal>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { ListComponent } from '@/types/types'
import { userStore } from '@/store/user'
import list from '@/components/list.vue'
import Icon from '@/components/layout/icon.vue'
import User from '@/components/user.vue'
import Modal from '@/components/layout/modal.vue'

export default defineComponent({
  name: 'ddashCore',
  components: {
    list,
    Icon,
    User,
    Modal
  },
  setup() {
    const ddashLists = ref<Array<ListComponent>>([])
    const showLogin = ref(false)

    const addList = () => {
      ddashLists.value.push({
        component: 'list',
        id: `list_${ddashLists.value.length}`
      })
    }

    const componentList = computed(() => {
      return ddashLists.value
    })

    const removeList = (id: string) => {
      const filteredList = ddashLists.value.filter((list) => {
        return list.id !== id
      })
      ddashLists.value = filteredList
    }

    const signIn = (data: boolean) => {
      !userStore.get.isLoggedIn ? (showLogin.value = data) : false
    }

    const cancelLogin = () => {
      showLogin.value = false
    }

    return {
      addList,
      cancelLogin,
      componentList,
      ddashLists,
      removeList,
      showLogin,
      signIn
    }
  }
})
</script>