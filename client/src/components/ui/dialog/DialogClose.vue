<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DialogClose, type DialogCloseProps, useForwardProps } from 'reka-ui'
import { computed } from 'vue'

const props = defineProps<DialogCloseProps & { class?: string }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DialogClose
    data-slot="dialog-close"
    v-bind="forwardedProps"
    :class="cn('', props.class)"
  >
    <slot />
  </DialogClose>
</template>
