<template>
  <div :class="`group group--icons padded--small fixed`">
    <component
      v-for="(item, index) in iconList"
      :key="index"
      :is="'Icon'"
      :iconType="item.iconType"
      :image="item.image"
      :text="item.text"
      :class="item.class"
      :disabled="disabledState(item)"
      @click="onInput(item.function)"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { IconsContent } from '@/types/types'
import Icon from '@/components/layout/icon.vue'

export default defineComponent({
  name: 'IconList',
  emits: ['targetFunction'],
  components: {
    Icon
  },
  props: {
    iconGroup: {
      type: Object,
      required: true
    },
    status: {
      type: String
    },
    validated: {
      type: Boolean
    }
  },
  setup(props, { emit }) {
    let iconList = ref([])

    const onInput = async (data: string) => {
      emit('targetFunction', data)
    }

    const renderIcons = () => {
      let refreshedIcons = props.iconGroup.iconList

      props.status === 'init'
        ? (refreshedIcons = props.iconGroup.iconList.filter(
            (i: IconsContent) =>
              i.iconName === 'createListIcon' || i.iconName === 'removeListIcon'
          ))
        : props.status === 'create' || props.status === 'unvalidated'
        ? (refreshedIcons = props.iconGroup.iconList.filter(
            (i: IconsContent) =>
              i.iconName === 'getListIcon' || i.iconName === 'cancelListIcon'
          ))
        : props.status === 'ready'
        ? (refreshedIcons = props.iconGroup.iconList.filter(
            (i: IconsContent) => i.iconName === 'removeListIcon'
          ))
        : props.status === 'busy'
        ? (refreshedIcons = props.iconGroup.iconList.filter(
            (i: IconsContent) => i.iconName === 'getLoadingIcon'
          ))
        : props.status === 'error'
        ? (refreshedIcons = props.iconGroup.iconList.filter(
            (i: IconsContent) => i.iconName === 'removeListIcon'
          ))
        : false

      iconList.value = refreshedIcons
    }

    const disabledState = (icon: IconsContent) => {
      return !props.validated && icon.iconName === 'getListIcon'
    }

    watch(props, () => {
      renderIcons()
    })

    onMounted(() => {
      renderIcons()
    })

    return {
      disabledState,
      iconList,
      onInput
    }
  }
})
</script>