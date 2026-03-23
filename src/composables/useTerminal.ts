import { ref, onMounted, nextTick } from 'vue'
import terminalContent from '../content/terminal.json'
import { useReducedMotion } from './useReducedMotion'
import { useTerminalOutput } from './useTerminalOutput'
import { useTerminalCommands } from './useTerminalCommands'
import { useTerminalInput } from './useTerminalInput'
import { useTerminalInit } from './useTerminalInit'

type HelpItemContent = {
  selected: boolean
  [key: string]: unknown
}

type HelpItemLine = {
  type: 'help-item'
  content: HelpItemContent
}

function isHelpItemLine(line: unknown): line is HelpItemLine {
  return Boolean(
    line &&
      typeof line === 'object' &&
      'type' in line &&
      'content' in line &&
      (line as { type?: unknown }).type === 'help-item'
  )
}

/**
 * Wires all terminal composables together and exposes the state
 * and actions needed by the Terminal component.
 */
export function useTerminal() {
  const outputEl = ref<HTMLElement | null>(null)
  const terminalRef = ref<HTMLElement | null>(null)
  const isBooting = ref(true)
  const queuedCommands = ref<string[]>([])
  const helpSelectionIndex = ref<number | null>(null)

  const { reducedMotion, detectReducedMotion } = useReducedMotion()

  const {
    outputLines,
    addLine,
    typeLine,
    getRenderedContent,
    scrollToBottom,
    clearOutput,
  } = useTerminalOutput(reducedMotion, outputEl)

  const { runCommand } = useTerminalCommands({
    addLine,
    outputLines,
    clearOutput,
    scrollToBottom,
    nextTick,
  })

  const { inputValue, inputLineRef, focusInput, onSubmit } = useTerminalInput(runCommandOrQueue)

  const { runInitSequence } = useTerminalInit({
    addLine,
    typeLine,
    outputLines,
    scrollToBottom,
    nextTick,
  })

  function getHelpItems() {
    return outputLines.value.filter(isHelpItemLine)
  }

  function clearHelpSelection() {
    helpSelectionIndex.value = null
    getHelpItems().forEach(item => {
      item.content.selected = false
    })
  }

  function syncHelpSelection() {
    const helpItems = getHelpItems()

    helpItems.forEach((item, index) => {
      item.content.selected = index === helpSelectionIndex.value
    })
  }

  function runCommandOrQueue(command: string) {
    clearHelpSelection()

    if (isBooting.value) {
      queuedCommands.value.push(command)
      return
    }

    runCommand(command)
  }

  function moveHelpSelection(direction: 'up' | 'down') {
    const helpItems = getHelpItems()
    if (!helpItems.length) return

    const lastIndex = helpItems.length - 1

    if (helpSelectionIndex.value == null) {
      helpSelectionIndex.value = 0
    } else if (direction === 'down') {
      helpSelectionIndex.value =
        helpSelectionIndex.value >= lastIndex ? 0 : helpSelectionIndex.value + 1
    } else {
      helpSelectionIndex.value =
        helpSelectionIndex.value <= 0 ? lastIndex : helpSelectionIndex.value - 1
    }

    syncHelpSelection()
  }

  function onKey(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    if (!getHelpItems().length) return

    event.preventDefault()
    moveHelpSelection(event.key === 'ArrowDown' ? 'down' : 'up')
  }

  async function initializeTerminal() {
    detectReducedMotion()
    await runInitSequence(detectReducedMotion)

    isBooting.value = false

    if (queuedCommands.value.length) {
      const queuedCommandsToRun = queuedCommands.value.slice()
      queuedCommands.value = []
      queuedCommandsToRun.forEach(runCommandOrQueue)
    }

    focusInput()
  }

  onMounted(initializeTerminal)

  return {
    outputEl,
    terminalRef,
    inputLineRef,
    inputValue,
    outputLines,
    getRenderedContent,
    onSubmit,
    onKey,
    focusInput,
    runCommand: runCommandOrQueue,
    PROMPT: terminalContent.prompt,
  }
}