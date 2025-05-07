<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DialogTrigger, type DialogTriggerProps, useForwardProps } from 'reka-ui'
import { computed } from 'vue'

const props = defineProps<DialogTriggerProps & { class?: string, asChild?: boolean }>()

const delegatedProps = computed(() => {
  const { class: _, asChild: __, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DialogTrigger
    data-slot="dialog-trigger"
    v-bind="forwardedProps"
    :class="cn('', props.class)"
  >
    <slot />
  </DialogTrigger>
</template>
