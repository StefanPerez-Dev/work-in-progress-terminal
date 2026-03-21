<script setup>
defineProps({
  line: { type: Object, required: true },
  getRenderedContent: { type: Function, required: true },
  prompt: { type: String, required: true },
})

function formatHelpLabel(label) {
  const raw = String(label ?? '')
  const padded = raw.padEnd(12, ' ')
  return padded
}

function renderedText(getRenderedContent, line) {
  try {
    return String(getRenderedContent(line).join(''))
  } catch {
    return ''
  }
}

function startsWithStatusIcon(text, icons) {
  const t = String(text ?? '').trimStart()
  return icons.some(icon => t.startsWith(icon))
}

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
  <div v-else-if="line.type === 'progress'" class="terminal-line flex flex-wrap items-baseline gap-x-1 whitespace-pre">
    <span class="text-term-text whitespace-pre">[</span>
    <span
      class="progressbar"
      :style="{
        '--progress-scale': Math.max(0, Math.min(1, (line.content?.percent ?? 0) / 100)),
        '--progress-steps': Math.max(1, Number(line.content?.width ?? 18)),
      }"
      role="img"
      :aria-label="`Progress ${line.content?.percent ?? 0}%`"
    >
      <span class="progressbar-base" aria-hidden="true">{{ '░'.repeat(Number(line.content?.width ?? 18)) }}</span>
      <span class="progressbar-fill" aria-hidden="true">{{ '█'.repeat(Number(line.content?.width ?? 18)) }}</span>
    </span>
    <span class="text-term-text whitespace-pre">]</span>
    <span class="text-term-text whitespace-pre"> {{ line.content?.percent ?? 0 }}%</span>
  </div>
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
  <div
    v-else-if="line.type === 'success'"
    class="terminal-line flex flex-wrap items-baseline gap-x-1 my-6">
    <span
      v-if="!startsWithStatusIcon(renderedText(getRenderedContent, line), ['✓', '✔'])"
      class="text-term-success whitespace-pre"
      aria-hidden="true"
      >✓</span
    >
    <span class="text-term-success whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
  <div
    v-else-if="line.type === 'error'"
    class="terminal-line flex flex-wrap items-baseline gap-x-1">
    <span
      v-if="!startsWithStatusIcon(renderedText(getRenderedContent, line), ['×', '✕', '✗'])"
      class="text-term-error whitespace-pre"
      aria-hidden="true"
      >×</span
    >
    <span class="text-term-error whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
  <div
    v-else-if="line.type === 'warning'"
    class="terminal-line flex flex-wrap items-baseline gap-x-1">
    <span
      v-if="!startsWithStatusIcon(renderedText(getRenderedContent, line), ['!', '⚠'])"
      class="text-term-warning whitespace-pre"
      aria-hidden="true"
      >!</span
    >
    <span class="text-term-warning whitespace-pre">{{ getRenderedContent(line).join('') }}</span>
  </div>
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
  <div
    v-else-if="line.type === 'help-item'"
    class="terminal-line grid grid-cols-[14ch_1fr] items-baseline">
    <span
      class="whitespace-pre font-semibold"
      :class="line.content.selected ? 'text-term-text underline' : 'text-term-text'"
      >{{ line.content.label }}</span
    >
    <span class="text-term-muted whitespace-pre">{{ line.content.description }}</span>
  </div>
  <div v-else-if="line.type === 'link'" class="terminal-line grid grid-cols-[10ch_auto_1fr] gap-x-2">
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

.progressbar {
  position: relative;
  display: inline-block;
  line-height: 1;
}

.progressbar-base {
  color: color-mix(in srgb, var(--term-muted) 70%, transparent);
}

.progressbar-fill {
  position: absolute;
  inset: 0;
  color: var(--term-success);
  transform-origin: left center;
  transform: scaleX(0);
  animation: progress-fill 900ms steps(var(--progress-steps)) forwards;
}

@keyframes progress-fill {
  to {
    transform: scaleX(var(--progress-scale));
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
