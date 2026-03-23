<script setup lang="ts">
import TerminalProgressLine from './lines/TerminalProgressLine.vue'
import TerminalStatusLine from './lines/TerminalStatusLine.vue'
import TerminalHelpItemLine from './lines/TerminalHelpItemLine.vue'
import TerminalLinkLine from './lines/TerminalLinkLine.vue'

defineProps({
  line: { type: Object, required: true },
  getRenderedContent: { type: Function, required: true },
  prompt: { type: String, required: true },
})

function splitPrefix(text) {
  const s = String(text ?? '')
  const idx = s.indexOf(':')
  if (idx === -1) return { prefix: '', rest: s }
  return { prefix: s.slice(0, idx + 1), rest: s.slice(idx + 1).replace(/^[ \t]+/, '') }
}
</script>

<template>
  <div v-if="line.type === 'command'" class="terminal-line flex flex-wrap items-baseline gap-x-1">
    <span class="text-term-prompt font-bold shrink-0 whitespace-pre">{{ prompt }}</span>
    <span class="whitespace-pre" aria-hidden="true"> </span>
    <span class="text-term-text whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
  <div
    v-else-if="line.type === 'system'"
    class="terminal-line flex flex-wrap items-baseline gap-x-1">
    <span class="text-term-muted whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
  <div v-else-if="line.type === 'section'" class="terminal-line flex flex-wrap items-baseline gap-x-1">
    <span class="text-term-text font-semibold whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
  <TerminalProgressLine v-else-if="line.type === 'progress'" :line="line" />
  <div v-else-if="line.type === 'about-tree'" class="terminal-line whitespace-pre-wrap">
    <div
      v-for="(treeLine, idx) in line.content?.lines ?? []"
      :key="`${line.id}-tree-${idx}`"
    >
      <template v-if="String(treeLine ?? '').includes(line.content?.linkText)">
        {{ String(treeLine ?? '').split(line.content?.linkText)[0] }}
        <a
          :href="line.content?.href"
          target="_blank"
          rel="noopener noreferrer"
          class="text-term-prompt hover:underline focus:ring-2 focus:ring-term-prompt focus:ring-offset-2 focus:ring-offset-term-surface rounded outline-none whitespace-pre"
        >
          {{ line.content?.linkText }}
        </a>
        {{ String(treeLine ?? '').split(line.content?.linkText).slice(1).join(line.content?.linkText) }}
      </template>
      <template v-else>
        {{ treeLine }}
      </template>
    </div>
  </div>
  <div v-else-if="line.type === 'spinner'" class="terminal-line flex items-center gap-2">
    <span class="text-term-muted">Working</span>
    <span class="dots" aria-hidden="true">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
    <span class="sr-only">Loading</span>
  </div>
  <TerminalStatusLine
    v-else-if="line.type === 'success' || line.type === 'error' || line.type === 'warning'"
    :line="line"
    :get-rendered-content="getRenderedContent"
  />
  <div
    v-else-if="line.type === 'muted'"
    class="terminal-line flex flex-wrap items-baseline gap-x-1">
    <span class="text-term-text whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
  <div
    v-else-if="line.type === 'note'"
    class="terminal-line grid grid-cols-[6ch_1fr] items-baseline mb-1 md:grid-cols-[auto_1fr]">
    <span class="text-term-text font-bold whitespace-nowrap pr-1">{{
      splitPrefix(getRenderedContent(line).join('')).prefix
    }}</span>
    <span class="text-term-text whitespace-pre">{{
      splitPrefix(getRenderedContent(line).join('')).rest
    }}</span>
  </div>
  <div
    v-else-if="line.type === 'tip'"
    class="terminal-line grid grid-cols-[6ch_1fr] items-baseline mt-1 md:grid-cols-[auto_1fr]">
    <span class="text-term-prompt font-semibold whitespace-nowrap pr-1">{{
      splitPrefix(getRenderedContent(line).join('')).prefix
    }}</span>
    <span class="text-term-text whitespace-pre">{{
      splitPrefix(getRenderedContent(line).join('')).rest
    }}</span>
  </div>
  <TerminalHelpItemLine v-else-if="line.type === 'help-item'" :line="line" />
  <TerminalLinkLine v-else-if="line.type === 'link'" :line="line" />
  <div v-else class="terminal-line flex flex-wrap items-baseline gap-x-1">
    <span class="text-term-text whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
</template>

<style scoped>
.terminal-line {
  animation: terminal-line-in 0.2s ease-out forwards;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Tailwind's `whitespace-pre` prevents wrapping (mobile would clip with overflow-x-hidden).
   Switch it to `pre-wrap` so terminal lines always fit the available width. */
:deep(.whitespace-pre) {
  white-space: pre-wrap;
}
@media (prefers-reduced-motion: reduce) {
  .terminal-line {
    animation: none;
  }
}
@keyframes terminal-line-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dots {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--term-muted) 75%, transparent);
  animation: dot-bounce 0.9s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}
.dot:nth-child(3) {
  animation-delay: 0.3s;
}

@media (prefers-reduced-motion: reduce) {
  .dot {
    animation: none;
  }
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  40% {
    transform: translateY(-3px);
    opacity: 1;
  }
}
</style>
