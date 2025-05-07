<script setup lang="ts">
import type { HTMLAttributes, ImgHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useAvatarContext } from './useAvatarContext'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  src?: ImgHTMLAttributes['src']
  alt?: ImgHTMLAttributes['alt']
  class?: HTMLAttributes['class']
}>()

const context = useAvatarContext()

const imageRef = ref<HTMLImageElement | null>(null)
const loaded = ref(false)

function onImageLoadingComplete() {
  loaded.value = true
  context?.onImageLoadingComplete()
}

onMounted(() => {
  if (imageRef.value?.complete) {
    loaded.value = true
    context?.onImageLoadingComplete()
  }
})

onUnmounted(() => {
  context?.onImageLoadingComplete()
})
</script>

<template>
  <img
    ref="imageRef"
    :src="src"
    :alt="alt"
    @load="onImageLoadingComplete"
    :class="cn('aspect-square h-full w-full', props.class)"
  />
</template>
