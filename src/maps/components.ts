import Button from '@/components/ui/button.vue'
import Tick from '@/components/ui/tick.vue'
import Input from '@/components/ui/input.vue'
import { Component } from '@vue/runtime-core'

const componentMapping = (data: string): Component => {
  return data === 'Button'
    ? Button
    : data === 'Tick'
      ? Tick
      : Input
}

export {
  componentMapping
}