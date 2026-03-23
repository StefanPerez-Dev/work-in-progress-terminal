<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTerminal } from '../composables/useTerminal'
import terminalContent from '../content/terminal.json'
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
const isMobileDevice = ref(false)

const mobileMediaQuery = '(max-width: 768px), (pointer: coarse)'
let mobileViewportQueryList: MediaQueryList | null = null

function syncMobileState() {
  isMobileDevice.value = Boolean(
    mobileViewportQueryList?.matches ?? window.matchMedia?.(mobileMediaQuery).matches
  )
}

function handleMobileViewportChange() {
  syncMobileState()
}

function onInputFocus() {
  isInputFocused.value = true
}

onMounted(() => {
  mobileViewportQueryList = window.matchMedia?.(mobileMediaQuery) ?? null
  syncMobileState()

  if (!mobileViewportQueryList) return
  mobileViewportQueryList.addEventListener?.('change', handleMobileViewportChange)
})

onUnmounted(() => {
  if (!mobileViewportQueryList) return
  mobileViewportQueryList.removeEventListener?.('change', handleMobileViewportChange)
  mobileViewportQueryList = null
})
</script>

<template>
  <div class="relative z-10 min-h-screen flex flex-col text-sm md:text-base overflow-x-hidden min-w-0">
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
          v-if="!isMobileDevice"
          ref="inputLineRef"
          v-model="inputValue"
          :prompt="PROMPT"
          @submit="onSubmit"
          @key="onKey"
          @focus="onInputFocus" />
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
