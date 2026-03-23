<script setup lang="ts">
const props = defineProps({
  line: { type: Object, required: true },
  getRenderedContent: { type: Function, required: true },
})

function renderedText(getRenderedContent: Function, line: any) {
  try {
    return String(getRenderedContent(line).join(''))
  } catch {
    return ''
  }
}

const statusConfig: Record<string, { icon: string; className: string; icons: string[]; extra?: string }> = {
  success: { icon: '✓', className: 'text-term-success', icons: ['✓', '✔'], extra: 'my-6' },
  error: { icon: '×', className: 'text-term-error', icons: ['×', '✕', '✗'] },
  warning: { icon: '!', className: 'text-term-warning', icons: ['!', '⚠'] },
}

function startsWithStatusIcon(text: string, icons: string[]) {
  const t = String(text ?? '').trimStart()
  return icons.some(icon => t.startsWith(icon))
}
</script>

<template>
  <div
    class="terminal-line flex flex-wrap items-baseline gap-x-1"
    :class="statusConfig[line.type]?.extra"
  >
    <span
      v-if="!startsWithStatusIcon(renderedText(props.getRenderedContent, line), statusConfig[line.type].icons)"
      :class="`${statusConfig[line.type].className} whitespace-pre`"
      aria-hidden="true"
      >{{ statusConfig[line.type].icon }}</span
    >
    <span :class="`${statusConfig[line.type].className} whitespace-pre`">{{
      props.getRenderedContent(line).join('')
    }}</span>
  </div>
</template>

