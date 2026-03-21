<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTerminal } from '../composables/useTerminal'
import { terminalContent } from '../content/terminal'
import TerminalTitleBar from './terminal/TerminalTitleBar.vue'
import TerminalOutput from './terminal/TerminalOutput.vue'
import TerminalInputLine from './terminal/TerminalInputLine.vue'
import TerminalCommandBar from './terminal/TerminalCommandBar.vue'

const {
  inputValue,
  outputLines,
  getRenderedContent,
  onSubmit,
  onKey,
  runCommand,
  PROMPT,
} = useTerminal()

const isInputFocused = ref(false)
const isMobile = ref(false)

function updateIsMobile() {
  if (typeof window === 'undefined') return
  const mq = window.matchMedia?.('(max-width: 768px), (pointer: coarse)')
  isMobile.value = Boolean(mq?.matches)
}

let mq: MediaQueryList | null = null

onMounted(() => {
  updateIsMobile()
  mq = window.matchMedia?.('(max-width: 768px), (pointer: coarse)') ?? null
  if (!mq) return
  const handler = () => updateIsMobile()
  mq.addEventListener?.('change', handler)
  // Safari <14 fallback
  mq.addListener?.(handler as any)
})

onUnmounted(() => {
  if (!mq) return
  const handler = () => updateIsMobile()
  mq.removeEventListener?.('change', handler)
  mq.removeListener?.(handler as any)
  mq = null
})

function onInputFocus() {
  isInputFocused.value = true
}

function onInputBlur() {
  isInputFocused.value = false
}
</script>

<template>
  <div
    class="relative z-10 min-h-screen flex flex-col text-sm md:text-base overflow-x-hidden min-w-0"
    role="application"
    aria-label="Terminal">
    <div class="flex-1 flex px-4 pt-10 pb-24 min-w-0 items-center justify-center">
      <div
        ref="terminalRef"
        class="flex flex-col w-full max-w-4xl min-h-[420px] max-h-[80vh] mx-auto rounded-lg border bg-term-surface overflow-hidden transition-all duration-200">
        <TerminalTitleBar />
        <TerminalOutput
          ref="outputEl"
          :lines="outputLines"
          :get-rendered-content="getRenderedContent"
          :prompt="PROMPT"/>
        <TerminalInputLine
          v-if="!isMobile"
          ref="inputLineRef"
          v-model="inputValue"
          :prompt="PROMPT"
          @submit="onSubmit"
          @key="onKey"
          @focus="onInputFocus"
          @blur="onInputBlur" />
        <TerminalCommandBar
          v-else
          :commands="[...terminalContent.mobile.commands]"
          :hint="terminalContent.mobile.hint"
          :ariaLabel="terminalContent.mobile.ariaLabel"
          @run="runCommand"
        />
      </div>
    </div>

    <p class="sr-only">
      {{ terminalContent.srOnlyHint }}
    </p>
  </div>
</template>
