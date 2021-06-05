<template>
  <section class="ddash">
    <p>{{ user.get.getName }}</p>
    <p>{{ user.get.getAge }}</p>
    <button @click="change" class="button">Change</button>
    <button @click="reset" class="button">Reset</button>
    <button @click="getList" class="button">getList</button>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { userStore as user } from '@/store/user'
import { listStore as list } from '@/store/lists'

export default defineComponent({
  name: 'example',
  setup() {
    const change = () => {
      user.do.setName('Matthias')
      user.do.setAge(33)
    }

    const reset = () => {
      user.do.reset()
    }

    const getList = () => {
      list.do.getListFromUrl('http://news.ycombinator.com/')
    }

    return {
      user,
      change,
      reset,
      getList
    }
  }
})
</script>

<style lang="scss">
@import './src/assets/ddash.scss';
</style>
