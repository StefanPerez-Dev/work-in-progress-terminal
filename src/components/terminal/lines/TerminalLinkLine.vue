<script setup lang="ts">
defineProps({
  line: { type: Object, required: true },
})
</script>

<template>
  <div class="terminal-line grid grid-cols-[10ch_auto_1fr] gap-x-2">
    <span class="text-term-text whitespace-pre truncate">{{ line.content.label }}</span>
    <span class="text-term-text whitespace-pre" aria-hidden="true">→</span>
    <a
      :href="line.content.href"
      :target="String(line.content.href || '').startsWith('mailto:') ? undefined : '_blank'"
      :rel="String(line.content.href || '').startsWith('mailto:') ? undefined : 'noopener noreferrer'"
      class="text-term-prompt/90 hover:text-term-prompt hover:underline focus:ring-2 focus:ring-term-prompt focus:ring-offset-2 focus:ring-offset-term-surface rounded outline-none whitespace-pre truncate"
      >{{ line.content.display ?? line.content.href }}</a
    >
  </div>
</template>

