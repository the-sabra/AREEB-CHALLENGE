<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useAvatarContext } from './useAvatarContext'
import { computed } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
  delayMs?: number
}>()

const context = useAvatarContext()
const show = computed(() => !context?.imageLoaded.value)
</script>

<template>
  <div
    v-if="show"
    data-slot="avatar-fallback"
    :class="cn('flex h-full w-full items-center justify-center rounded-full bg-muted', props.class)"
  >
    <slot />
  </div>
</template>
