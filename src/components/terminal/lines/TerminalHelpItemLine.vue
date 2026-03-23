<script setup lang="ts">
defineProps({
  line: { type: Object, required: true },
})
</script>

<template>
  <div class="terminal-line grid grid-cols-[14ch_1fr] items-baseline">
    <span
      class="whitespace-pre font-semibold"
      :class="line.content.selected ? 'text-term-text underline' : 'text-term-text'"
      >{{ line.content.label }}</span
    >
    <span class="text-term-muted whitespace-pre">{{ line.content.description }}</span>
  </div>
</template>

