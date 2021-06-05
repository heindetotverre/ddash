<template>
  <section class="ddash">
    <div class="ddash__core">
      <component
        v-for="(item, index) in ddashLists"
        :key="`list_${index}`"
        :is="item.component"
        :id="item.id"
        @removeList="removeList"
      ></component>
      <div class="ddash__list">
        <div class="group padded--small">
          <Icon
            @click="addList"
            type="link"
            image="add-rounded"
            text="Add list"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ListComponent } from '@/types/types'
import list from '@/components/list.vue'
import Icon from '@/components/ui/icon.vue'

export default defineComponent({
  name: 'ddashCore',
  components: {
    list,
    Icon
  },
  setup() {
    const ddashLists = ref<Array<ListComponent>>([])

    const addList = () => {
      ddashLists.value.push({
        component: 'list',
        id: `list_${ddashLists.value.length}`
      })
    }

    const removeList = (id: string) => {
      const filteredList = ddashLists.value.filter((list) => {
        return list.id !== id
      })
      ddashLists.value = filteredList
    }

    return {
      addList,
      ddashLists,
      removeList
    }
  }
})
</script>