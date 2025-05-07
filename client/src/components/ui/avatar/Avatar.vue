<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { provideAvatarContext } from './useAvatarContext'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

// Provide context to child components
provideAvatarContext()
</script>

<template>
  <div
    data-slot="avatar"
    :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)"
  >
    <slot />
  </div>
</template>
