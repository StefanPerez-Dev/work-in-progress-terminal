import type { TerminalEvent } from '../types/terminalResponse'
import { LINE_STAGGER_MS } from '../constants/terminalBehavior'

type PlayerDeps = {
  addLine: (type: string, content: unknown, options?: Record<string, unknown>) => unknown
  outputLines: { value: unknown[] }
  clearOutput: () => void
  scrollToBottom: (behavior?: ScrollBehavior) => void
  nextTick: () => Promise<void> | void
}

export type PlayOptions = { reducedMotion?: boolean }

/**
 * Only knows how to play a sequence: TerminalEvent[].
 * No state, no API — pure playback.
 */
export function useTerminalPlayer(deps: PlayerDeps) {
  const { addLine, outputLines, clearOutput, scrollToBottom, nextTick } = deps

  function waitTick(): Promise<void> {
    const r = nextTick()
    return r && typeof (r as Promise<unknown>).then === 'function' ? (r as Promise<void>) : Promise.resolve()
  }

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms))
  }

  function settleScroll() {
    scrollToBottom('auto')
    setTimeout(() => scrollToBottom('auto'), 80)
    setTimeout(() => scrollToBottom('auto'), 180)
    setTimeout(() => scrollToBottom('auto'), 320)
  }

  function resolveDuration(ms: number, opts?: PlayOptions): number {
    return opts?.reducedMotion ? 0 : ms
  }

  async function playEvent(event: TerminalEvent, opts?: PlayOptions): Promise<void> {
    switch (event.kind) {
      case 'echo-command':
        addLine('command', [event.value], { done: true, visibleLength: 1e6 })
        await waitTick()
        scrollToBottom('auto')
        await sleep(LINE_STAGGER_MS)
        break

      case 'line': {
        const options = event.options ?? {}
        addLine(event.lineType, event.content, { done: true, visibleLength: 1e6, ...options })
        await waitTick()
        scrollToBottom('auto')
        await sleep(LINE_STAGGER_MS)
        const delay = typeof options.delayAfterMs === 'number' && options.delayAfterMs > 0 ? options.delayAfterMs : LINE_STAGGER_MS
        await sleep(delay)
        scrollToBottom('auto')
        break
      }

      case 'spinner': {
        const line = addLine('spinner', '', { done: true, visibleLength: 1e6 }) as { id?: string }
        await waitTick()
        scrollToBottom('auto')
        await sleep(resolveDuration(event.durationMs, opts))
        const idx = outputLines.value.findIndex((l: unknown) => (l as { id?: string })?.id === line?.id)
        if (idx >= 0) outputLines.value.splice(idx, 1)
        await waitTick()
        scrollToBottom('auto')
        break
      }

      case 'wait':
        await sleep(resolveDuration(event.durationMs, opts))
        break

      case 'clear':
        clearOutput()
        await waitTick()
        break
    }
  }

  async function playSequence(sequence: TerminalEvent[], opts?: PlayOptions): Promise<void> {
    for (const event of sequence) await playEvent(event, opts)
    const r = nextTick()
    if (r && typeof (r as Promise<unknown>).then === 'function') await (r as Promise<void>)
    settleScroll()
    requestAnimationFrame?.(() => requestAnimationFrame?.(settleScroll))
  }

  return { playSequence }
}
