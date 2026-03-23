import { ref, nextTick } from 'vue'
import { TYPING_SPEED_READY } from '../constants/terminalBehavior'
import terminalContent from '../content/terminal.json'

/**
 * Initial boot sequence and hint. Uses addLine, typeLine, outputLines from useTerminalOutput.
 */
export function useTerminalInit(deps) {
  const { addLine, typeLine, outputLines, scrollToBottom, nextTick: nextTickVue } = deps

  function prefersReducedMotion() {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  }

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms))
  }

  function startSpinner() {
    return addLine('spinner', '', { done: true, visibleLength: 1e6 })
  }

  function stopSpinner(line: any) {
    if (!line) return
    const idx = outputLines.value.findIndex(l => l.id === line.id)
    if (idx !== -1) outputLines.value.splice(idx, 1)
  }

  function scrollAfterUpdate() {
    if (typeof nextTickVue === 'function' && typeof scrollToBottom === 'function') {
      nextTickVue(() => {
        scrollToBottom()
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => scrollToBottom())
        }
      })
    }
  }

  const hintShown = ref(false)

  async function runInitSequence(detectReducedMotion) {
    if (typeof detectReducedMotion === 'function') detectReducedMotion()

    const reduced = prefersReducedMotion()
    const gap = reduced ? 0 : 280
    const spinnerDelay = reduced ? 0 : 520
    let spinnerLine: any = null

    addLine('system', terminalContent.init.steps[0])
    await nextTick()
    const l1 = outputLines.value[outputLines.value.length - 1]
    await typeLine(l1)
    scrollAfterUpdate()
    if (gap) await sleep(gap)
    spinnerLine = startSpinner()
    scrollAfterUpdate()
    if (spinnerDelay) await sleep(spinnerDelay)
    stopSpinner(spinnerLine)

    addLine('system', terminalContent.init.steps[1])
    await nextTick()
    const l2 = outputLines.value[outputLines.value.length - 1]
    await typeLine(l2)
    scrollAfterUpdate()
    if (gap) await sleep(gap)
    spinnerLine = startSpinner()
    scrollAfterUpdate()
    if (spinnerDelay) await sleep(spinnerDelay)
    stopSpinner(spinnerLine)

    addLine('system', terminalContent.init.steps[2])
    await nextTick()
    const l3 = outputLines.value[outputLines.value.length - 1]
    await typeLine(l3, TYPING_SPEED_READY)
    scrollAfterUpdate()
    if (gap) await sleep(gap)
    spinnerLine = startSpinner()
    scrollAfterUpdate()
    if (spinnerDelay) await sleep(spinnerDelay)
    stopSpinner(spinnerLine)

    // Extra padded success line (spacing handled by renderer)
    addLine('success', terminalContent.init.ready, { done: true, visibleLength: 1e6 })
    await nextTick()
    scrollAfterUpdate()
    showHint()
  }

  function showHint() {
    if (hintShown.value) return
    hintShown.value = true
    const isMobile =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(max-width: 768px), (pointer: coarse)')?.matches)
    const tip = isMobile ? terminalContent.init.tipMobile : terminalContent.init.tipDesktop
    addLine('text', '', { done: true, visibleLength: 1e6 })
    addLine('note', terminalContent.init.note, {
      done: true,
      visibleLength: 1e6,
    })
    addLine('tip', tip, { done: true, visibleLength: 1e6 })
    scrollAfterUpdate()
  }

  return { runInitSequence, showHint }
}
