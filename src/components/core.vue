<template>
  <section class="ddash">
    <div class="ddash__core">
      <component
        v-for="item in componentList"
        :key="item.id"
        :is="item.component"
        :id="item.id"
        :user="user"
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
    <div v-if="user.userId" class="ddash__user">
      <Icon
        @click="signOut"
        iconType="link"
        image="add-rounded"
        text="Log out"
      />
      {{ user }}
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
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
    const userInfo = userStore.get.user as Record<string, unknown>

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
      !userInfo.userId ? (showLogin.value = data) : false
    }

    const signOut = () => {
      userStore.do.auth({
        method: 'signOut',
        values: {}
      })
    }

    const cancelLogin = () => {
      showLogin.value = false
    }

    const user = computed(() => {
      return userStore.get.user
    })

    return {
      addList,
      cancelLogin,
      componentList,
      ddashLists,
      removeList,
      showLogin,
      signIn,
      signOut,
      user
    }
  }
})
</script>