<script setup lang="ts">
import {
  TooltipProvider,
  type TooltipProviderProps,
  useForwardProps,
} from 'reka-ui'

const props = withDefaults(defineProps<TooltipProviderProps>(), {
  disableHoverableContent: false,
  delayDuration: 200,
  skipDelayDuration: 300,
})

const forwardedProps = useForwardProps(props)
</script>

<template>
  <TooltipProvider data-slot="tooltip-provider" v-bind="forwardedProps">
    <slot />
  </TooltipProvider>
</template>
