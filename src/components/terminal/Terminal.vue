<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTerminalSession } from '../../composables/useTerminalSession'
import terminalConfig from '../../content/terminal/config.json'
import TerminalTitleBar from './TerminalTitleBar.vue'
import TerminalOutput from './TerminalOutput.vue'
import TerminalInputLine from './TerminalInputLine.vue'
import TerminalCommandBar from './TerminalCommandBar.vue'

const {
  lines,
  inputValue,
  inputLineRef,
  outputEl,
  getRenderedContent,
  onSubmit,
  onKey,
  runCommand,
  PROMPT,
} = useTerminalSession()

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
          :lines="lines"
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
          :commands="[...terminalConfig.mobile.commands]"
          :hint="terminalConfig.mobile.hint"
          :ariaLabel="terminalConfig.mobile.ariaLabel"
          @run="runCommand"
        />
      </div>
    </div>

    <p class="sr-only">
      {{ terminalConfig.srOnlyHint }}
    </p>
  </div>
</template>
