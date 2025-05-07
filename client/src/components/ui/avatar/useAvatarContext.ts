import { ref, provide, inject,type Ref } from 'vue'

type AvatarContext = {
  imageLoaded: Ref<boolean>
  onImageLoadingComplete: () => void
}

// Use a symbol as the injection key without type annotation
const AvatarContextKey = Symbol('AvatarContext')

export function provideAvatarContext() {
  const imageLoaded = ref(false)

  function onImageLoadingComplete() {
    imageLoaded.value = true
  }

  const context: AvatarContext = {
    imageLoaded,
    onImageLoadingComplete
  }

  provide(AvatarContextKey, context)
  return context
}

export function useAvatarContext(): AvatarContext | undefined {
  return inject(AvatarContextKey)
}
