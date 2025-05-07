<script setup lang="ts">
import { TooltipRoot, type TooltipRootEmits, type TooltipRootProps, useForwardPropsEmits } from 'reka-ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<TooltipRootProps>(), {
  delayDuration: 700,
})
const emits = defineEmits<TooltipRootEmits>()

const delegatedProps = computed(() => {
  return props
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <TooltipRoot data-slot="tooltip" v-bind="forwarded">
    <slot />
  </TooltipRoot>
</template>
