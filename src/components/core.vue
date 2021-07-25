<template>
  <section class="ddash">
    <div class="ddash__core">
      <div v-for="crawlData in listFromDB" :key="crawlData" class="ddash__list">
        <List
          :crawlData="crawlData"
          :listId="crawlData.listId"
          @removeList="removeList"
        />
      </div>
      <component
        v-for="item in newLists"
        :key="item.id"
        :is="item.component"
        :listId="item.listId"
        :user="user"
        @removeList="removeList"
        @signIn="signIn"
      ></component>
      <div class="ddash__list ddash__list--add">
        <div class="group padded--small">
          <Icon
            @click="addList"
            iconType="link"
            image="add-rounded"
            :text="strings.add_list"
          />
        </div>
      </div>
    </div>
    <div class="ddash__user user">
      <div v-if="user.userId" class="user user--present">
        <Icon
          @click="signOut"
          iconType="link"
          image="sign-out"
          :text="strings.log_out"
        />
        <div class="user__info">
          <Icon
            iconType="link"
            image="user"
            :text="`${user.firstName} ${user.lastName}`"
          />
          <span></span>
        </div>
      </div>
      <Icon
        v-else
        @click="signIn"
        iconType="link"
        image="add-rounded"
        :text="strings.log_in"
      />
    </div>
    <Modal v-if="showLogin">
      <UserLogin @cancel="cancelLogin" />
    </Modal>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { ListComponent, User } from '@/types/types'
import { listStore } from '@/store/lists'
import { userStore } from '@/store/user'
import { stringStore } from '@/store/strings'
import List from '@/components/list/list.vue'
import Icon from '@/components/layout/icon.vue'
import UserLogin from '@/components/user/userLogin.vue'
import Modal from '@/components/layout/modal.vue'

export default defineComponent({
  name: 'ddashCore',
  components: {
    Icon,
    List,
    UserLogin,
    Modal
  },
  setup() {
    const newLists = ref<Array<ListComponent>>([])
    const showLogin = ref(false)
    const userInfo = userStore.get.user as User
    const strings = stringStore.get.getStrings

    const addList = () => {
      newLists.value.push({
        component: 'List',
        listId: `list_${newLists.value.length}`
      })
    }

    const removeList = (id: string) => {
      const filteredList = newLists.value.filter((list) => {
        return list.listId !== id
      })
      newLists.value = filteredList
      listStore.do.deleteList(id)
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

    const listFromDB = computed(() => {
      return listStore.get.listsBeingPulled
    })

    onMounted(async () => {
      const user = await userStore.do.authCheck()
      user ? listStore.do.getAllLists(user.userId) : false
    })

    return {
      addList,
      cancelLogin,
      newLists,
      listFromDB,
      removeList,
      showLogin,
      signIn,
      signOut,
      strings,
      user
    }
  }
})
</script>