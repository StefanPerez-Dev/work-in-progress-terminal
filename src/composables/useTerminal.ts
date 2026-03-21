import { ref, onMounted, nextTick } from 'vue'
import { terminalContent } from '../content/terminal'
import { useReducedMotion } from './useReducedMotion'
import { useTerminalOutput } from './useTerminalOutput'
import { useTerminalCommands } from './useTerminalCommands'
import { useTerminalInput } from './useTerminalInput'
import { useTerminalInit } from './useTerminalInit'

/**
 * Single composable that wires all terminal composables and returns
 * everything the Terminal component needs. Call boot() in onMounted.
 */
export function useTerminal() {
  const outputEl = ref(null)
  const terminalRef = ref(null)
  const isBooting = ref(true)
  const queuedCommands = ref<string[]>([])
  const helpSelectionIndex = ref<number | null>(null)

  const { reducedMotion, detectReducedMotion } = useReducedMotion()
  const { outputLines, addLine, typeLine, getRenderedContent, scrollToBottom, clearOutput } =
    useTerminalOutput(reducedMotion, outputEl)

  const { runCommand } = useTerminalCommands({
    addLine,
    outputLines,
    clearOutput,
    scrollToBottom,
    nextTick,
  })

  function runCommandWhenReady(cmd: string) {
    // any new command clears existing help selection
    helpSelectionIndex.value = null
    outputLines.value.forEach(line => {
      if (line.type === 'help-item' && (line as any).content) {
        ;(line as any).content.selected = false
      }
    })

    if (isBooting.value) {
      queuedCommands.value.push(cmd)
      return
    }
    runCommand(cmd)
  }

  const { inputValue, inputLineRef, focusInput, onSubmit } = useTerminalInput(runCommandWhenReady)

  const { runInitSequence } = useTerminalInit({
    addLine,
    typeLine,
    outputLines,
    scrollToBottom,
    nextTick,
  })

  function onKey(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const items = outputLines.value.filter(line => line.type === 'help-item')
    if (!items.length) return

    event.preventDefault()

    const max = items.length - 1
    if (helpSelectionIndex.value == null) {
      helpSelectionIndex.value = 0
    } else if (event.key === 'ArrowDown') {
      helpSelectionIndex.value =
        helpSelectionIndex.value >= max ? 0 : helpSelectionIndex.value + 1
    } else if (event.key === 'ArrowUp') {
      helpSelectionIndex.value =
        helpSelectionIndex.value <= 0 ? max : helpSelectionIndex.value - 1
    }

    items.forEach((line, index) => {
      if (!(line as any).content) return
      ;(line as any).content.selected = index === helpSelectionIndex.value
    })
  }

  async function boot() {
    detectReducedMotion()
    await runInitSequence(detectReducedMotion)
    isBooting.value = false

    if (queuedCommands.value.length) {
      // drain queue in order once init finishes
      const toRun = queuedCommands.value.slice()
      queuedCommands.value = []
      toRun.forEach(c => runCommand(c))
    }
    focusInput()
  }

  onMounted(boot)

  return {
    // Refs for template bindings
    outputEl,
    terminalRef,
    inputLineRef,
    // State
    inputValue,
    outputLines,
    getRenderedContent,
    // Actions
    onSubmit,
    onKey,
    focusInput,
    runCommand: runCommandWhenReady,
    // Constants
    PROMPT: terminalContent.prompt,
  }
}
