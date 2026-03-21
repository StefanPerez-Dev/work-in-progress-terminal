import { ref, nextTick, onUnmounted, type Ref } from 'vue'
import { TYPING_SPEED } from '../constants/terminalBehavior'

type TerminalLine = {
  id: string
  type: string
  content: any
  visibleLength: number
  done: boolean
  // allow arbitrary extra fields via options spread
  [key: string]: any
}

const typingTimeouts: number[] = []

/**
 * Terminal output lines, addLine, typeLine, getRenderedContent, scrollToBottom.
 * Uses outputEl ref for scrolling (set by component via ref binding).
 */
export function useTerminalOutput(
  reducedMotionRef: Ref<boolean>,
  outputElRef: Ref<HTMLElement | any>
) {
  const outputLines = ref<TerminalLine[]>([])

  function getOutputElement(): HTMLElement | null {
    const raw = outputElRef?.value
    if (!raw) return null
    if (raw instanceof HTMLElement) return raw
    if (raw?.el?.value instanceof HTMLElement) return raw.el.value
    if (raw?.el instanceof HTMLElement) return raw.el
    if (raw?.$el instanceof HTMLElement) return raw.$el
    return null
  }

  function scrollToBottom(behaviorOverride?: ScrollBehavior) {
    const el = getOutputElement()
    if (!el) return
    const top = el.scrollHeight
    el.scrollTop = top
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({
        top,
        behavior: behaviorOverride ?? (reducedMotionRef?.value ? 'auto' : 'smooth'),
      })
    }
  }

  function addLine(type: string, content: any, options: Record<string, any> = {}): TerminalLine {
    const normalized =
      type === 'link' ||
      type === 'help-item' ||
      type === 'progress' ||
      type === 'about-tree'
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
    outputLines.value.push(line)
    return line
  }

  function typeLine(line: TerminalLine, speed = TYPING_SPEED): Promise<void> {
    if (reducedMotionRef?.value) {
      const total = line.content.reduce(
        (sum, part) => sum + (typeof part === 'string' ? part.length : 0),
        0
      )
      line.visibleLength = total
      line.done = true
      return Promise.resolve()
    }
    const totalLen = line.content.reduce(
      (sum, part) => sum + (typeof part === 'string' ? part.length : 0),
      0
    )
    if (totalLen === 0) {
      line.done = true
      return Promise.resolve()
    }
    return new Promise<void>(resolve => {
      let current = 0
      const tick = () => {
        current++
        line.visibleLength = current
        if (current >= totalLen) {
          line.done = true
          resolve()
          return
        }
        typingTimeouts.push(setTimeout(tick, speed))
      }
      typingTimeouts.push(setTimeout(tick, speed))
    })
  }

  function getRenderedContent(line: TerminalLine) {
    let count = 0
    return line.content.map(part => {
      if (typeof part !== 'string') return part
      const len = part.length
      const visible = line.done ? part : part.slice(0, Math.max(0, line.visibleLength - count))
      count += len
      return visible
    })
  }

  function clearOutput() {
    outputLines.value = []
    nextTick(scrollToBottom)
  }

  onUnmounted(() => {
    typingTimeouts.forEach(clearTimeout)
    typingTimeouts.length = 0
  })

  return {
    outputLines,
    addLine,
    typeLine,
    getRenderedContent,
    scrollToBottom,
    clearOutput,
  }
}
