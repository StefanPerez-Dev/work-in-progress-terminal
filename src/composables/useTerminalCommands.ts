import { normalizeCommand, isNpmInstall } from '../utils/terminalCommands'
import terminalContent from '../content/terminal.json'
import helpOutput from '../data/terminal-outputs/help.json'
import installOutput from '../data/terminal-outputs/install.json'
import contactOutput from '../data/terminal-outputs/contact.json'
import aboutOutput from '../data/terminal-outputs/about.json'

/**
 * Run a terminal command and append lines via addLine.
 * @param {string} cmd - Raw command string
 * @param {{ addLine: (type: string, content: any, options?: object) => void, outputLines: { value: any[] }, clearOutput: () => void, scrollToBottom: () => void }} deps
 */
export function useTerminalCommands(deps) {
  const { addLine, outputLines, clearOutput, scrollToBottom, nextTick } = deps
  let commandQueue = Promise.resolve()
  const LINE_STAGGER_MS = 60

  type CommandOutputLine = {
    type: string
    content: any
    options?: Record<string, any>
  }

  function instant(type, content, options = {}) {
    return addLine(type, content, { done: true, visibleLength: 1e6, ...options })
  }

  function waitTick() {
    if (typeof nextTick !== 'function') return Promise.resolve()
    return Promise.resolve(nextTick())
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function pushLine(type, content, options: Record<string, any> = {}) {
    instant(type, content, options)
    await waitTick()
    // Force immediate scroll; smooth can lag once output becomes scrollable.
    scrollToBottom('auto')
    await sleep(LINE_STAGGER_MS)
    scrollToBottom('auto')
    const delayAfterMs =
      typeof options.delayAfterMs === 'number' && options.delayAfterMs > 0
        ? options.delayAfterMs
        : LINE_STAGGER_MS
    await sleep(delayAfterMs)
  }

  async function pushLines(lines) {
    for (const line of lines) {
      await pushLine(line.type, line.content, line.options ?? {})
    }
  }

  function cloneLines(lines: CommandOutputLine[]): CommandOutputLine[] {
    if (typeof structuredClone === 'function') {
      return structuredClone(lines)
    }
    return JSON.parse(JSON.stringify(lines))
  }

  function done() {
    const settleScroll = () => {
      scrollToBottom('auto')
      // Extra delayed passes for animated or async-sized content.
      setTimeout(() => scrollToBottom('auto'), 80)
      setTimeout(() => scrollToBottom('auto'), 180)
      setTimeout(() => scrollToBottom('auto'), 320)
    }

    if (typeof nextTick !== 'function') {
      settleScroll()
      return
    }

    nextTick(() => {
      settleScroll()
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            settleScroll()
          })
        })
      }
    })
  }

  async function executeCommand(cmd) {
    const raw = (cmd || '').trim()
    await pushLine('command', [raw])

    if (!raw) {
      await pushLine('muted', '')
      done()
      return
    }

    const n = normalizeCommand(raw)
    let lines: CommandOutputLine[] = []

    if (n === 'help') {
      lines = cloneLines(helpOutput as CommandOutputLine[])
      await pushLines(lines)
      done()
      return
    }

    if (isNpmInstall(raw) || n === 'install') {
      lines = cloneLines(installOutput as CommandOutputLine[])
      await pushLines(lines)
      done()
      return
    }

    if (n === 'contact') {
      lines = cloneLines(contactOutput as CommandOutputLine[])
      await pushLines(lines)
      done()
      return
    }

    if (n === 'about') {
      lines = cloneLines(aboutOutput as CommandOutputLine[])
      await pushLines(lines)
      done()
      return
    }

    if (n === 'clear') {
      clearOutput()
      done()
      return
    }

    lines = [
      { type: 'error', content: `command not found: ${raw}` },
      { type: 'muted', content: terminalContent.init.tipDesktop },
    ]
    await pushLines(lines)
    done()
  }

  function runCommand(cmd) {
    commandQueue = commandQueue.then(() => executeCommand(cmd))
    return commandQueue
  }

  return { runCommand }
}
