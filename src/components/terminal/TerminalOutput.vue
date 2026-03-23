<script setup>
/**
 * RULE 3: Components only render typed lines.
 * Receives lines prop, no content decisions.
 */
import { useTemplateRef } from 'vue'
import TerminalLine from './TerminalLine.vue'

defineProps({
  lines: { type: Array, default: () => [] },
  getRenderedContent: { type: Function, required: true },
  prompt: { type: String, required: true },
})
const emit = defineEmits(['focus-request'])
const outputRootEl = useTemplateRef('outputRootEl')

function onOutputClick() {
  emit('focus-request')
}

defineExpose({
  el: outputRootEl,
})
</script>

<template>
  <div
    ref="outputRootEl"
    class="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-0.5 min-h-0 break-words"
    style="min-height: 120px"
    role="log"
    aria-live="polite"
    aria-label="Terminal output"
    @click="onOutputClick"
  >
    <TerminalLine
      v-for="line in lines"
      :key="line.id"
      :line="line"
      :get-rendered-content="getRenderedContent"
      :prompt="prompt"
    />
  </div>
</template>
