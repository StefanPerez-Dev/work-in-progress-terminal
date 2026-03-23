import { ref, nextTick, onMounted } from 'vue'
import { resolveCommand, getBootResponse, getHintResponse, PROMPT } from '../api/terminalApi'
import { useTerminalPlayer } from './useTerminalPlayer'

type TerminalLine = {
  id: string
  type: string
  content: unknown
  visibleLength: number
  done: boolean
  [key: string]: unknown
}

/**
 * Owns session state: lines, inputValue, booting, focus, queued commands.
 * Orchestrates boot, commands, and input. Always delegates to terminalApi for responses.
 */
export function useTerminalSession() {
  const outputElRef = ref<HTMLElement | Record<string, unknown> | null>(null)
  const lines = ref<TerminalLine[]>([])
  const inputValue = ref('')
  const inputLineRef = ref<{ focusInput?: () => void } | null>(null)
  const booting = ref(true)
  const queuedCommands = ref<string[]>([])
  const reducedMotion = ref(false)
  const helpSelectionIndex = ref<number | null>(null)
  const hintShown = ref(false)

  function getOutputElement(): HTMLElement | null {
    const raw = outputElRef?.value
    if (!raw) return null
    if (raw instanceof HTMLElement) return raw
    if ((raw as { el?: { value?: HTMLElement } })?.el?.value instanceof HTMLElement) return (raw as { el: { value: HTMLElement } }).el.value
    if ((raw as { el?: HTMLElement })?.el instanceof HTMLElement) return (raw as { el: HTMLElement }).el
    if ((raw as { $el?: HTMLElement })?.$el instanceof HTMLElement) return (raw as { $el: HTMLElement }).$el
    return null
  }

  function scrollToBottom(behavior?: ScrollBehavior) {
    const el = getOutputElement()
    if (!el) return
    el.scrollTop = el.scrollHeight
    el.scrollTo?.({ top: el.scrollHeight, behavior: behavior ?? (reducedMotion.value ? 'auto' : 'smooth') })
  }

  function addLine(type: string, content: unknown, options: Record<string, unknown> = {}): TerminalLine {
    const normalized =
      type === 'link' || type === 'help-item' || type === 'progress' || type === 'about-tree'
        ? content
        : Array.isArray(content)
          ? content
          : [content]
    const line: TerminalLine = {
      id: Math.random().toString(36).slice(2),
      type,
      content: normalized,
      visibleLength: 0,
      done: false,
      ...options,
    }
    lines.value.push(line)
    return line
  }

  function getRenderedContent(line: TerminalLine) {
    const content = Array.isArray(line.content) ? line.content : [line.content]
    let count = 0
    return content.map((part: unknown) => {
      if (typeof part !== 'string') return part
      const len = part.length
      const visible = line.done ? part : part.slice(0, Math.max(0, (line.visibleLength as number) - count))
      count += len
      return visible
    })
  }

  function clearOutput() {
    lines.value = []
    nextTick(scrollToBottom)
  }

  const { playResponse } = useTerminalPlayer({
    addLine,
    outputLines: lines,
    clearOutput,
    scrollToBottom,
    nextTick: () => nextTick(),
  })

  function focusInput() {
    inputLineRef.value?.focusInput?.()
  }

  function getHelpItems() {
    return lines.value.filter((l): l is TerminalLine & { content: { selected?: boolean } } => l.type === 'help-item')
  }

  function clearHelpSelection() {
    helpSelectionIndex.value = null
    getHelpItems().forEach(item => {
      if (item.content && typeof item.content === 'object') item.content.selected = false
    })
  }

  function syncHelpSelection() {
    const items = getHelpItems()
    items.forEach((item, index) => {
      if (item.content && typeof item.content === 'object') {
        item.content.selected = index === helpSelectionIndex.value
      }
    })
  }

  let commandQueue = Promise.resolve()

  function runCommand(cmd: string) {
    clearHelpSelection()
    if (booting.value) {
      queuedCommands.value.push(cmd)
      return
    }
    commandQueue = commandQueue.then(async () => {
      const response = resolveCommand(cmd)
      await playResponse(response, { reducedMotion: reducedMotion.value })
    })
  }

  function onSubmit() {
    const cmd = inputValue.value?.trim() ?? ''
    runCommand(cmd)
    inputValue.value = ''
    nextTick(focusInput)
  }

  function moveHelpSelection(direction: 'up' | 'down') {
    const items = getHelpItems()
    if (!items.length) return
    const last = items.length - 1
    if (helpSelectionIndex.value == null) helpSelectionIndex.value = 0
    else if (direction === 'down') helpSelectionIndex.value = helpSelectionIndex.value >= last ? 0 : helpSelectionIndex.value + 1
    else helpSelectionIndex.value = helpSelectionIndex.value <= 0 ? last : helpSelectionIndex.value - 1
    syncHelpSelection()
  }

  function onKey(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    if (!getHelpItems().length) return
    event.preventDefault()
    moveHelpSelection(event.key === 'ArrowDown' ? 'down' : 'up')
  }

  async function showHint() {
    if (hintShown.value) return
    hintShown.value = true
    const isMobile = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(max-width: 768px), (pointer: coarse)')?.matches)
    const hint = getHintResponse(isMobile)
    await playResponse(hint, { reducedMotion: reducedMotion.value })
  }

  async function initialize() {
    reducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    const boot = getBootResponse()
    await playResponse(boot, { reducedMotion: reducedMotion.value })
    await showHint()
    booting.value = false
    const queued = queuedCommands.value.splice(0)
    queued.forEach(runCommand)
    focusInput()
  }

  onMounted(initialize)

  return {
    lines,
    inputValue,
    inputLineRef,
    outputEl: outputElRef,
    getRenderedContent,
    onSubmit,
    onKey,
    focusInput,
    runCommand,
    PROMPT,
  }
}
