import { normalizeCommand, isNpmInstall } from '../utils/terminalCommands'
import { contactContent } from '../content/contact'
import { terminalContent } from '../content/terminal'

/**
 * Run a terminal command and append lines via addLine.
 * @param {string} cmd - Raw command string
 * @param {{ addLine: (type: string, content: any, options?: object) => void, outputLines: { value: any[] }, clearOutput: () => void, scrollToBottom: () => void }} deps
 */
export function useTerminalCommands(deps) {
  const { addLine, outputLines, clearOutput, scrollToBottom, nextTick } = deps
  let commandQueue = Promise.resolve()
  const LINE_STAGGER_MS = 60
  const PROGRESS_ANIMATION_WAIT_MS = 980

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

  async function pushLine(type, content, options = {}) {
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

    if (raw === 'help') {
      await pushLine('section', terminalContent.help.heading)
      await pushLine('text', '')
      await pushLines(
        terminalContent.help.items.map(item => ({
          type: 'help-item',
          content: {
          label: item.label,
          command: item.label,
          description: item.description,
          selected: false,
          },
        }))
      )
      done()
      return
    }

    const n = normalizeCommand(raw)

    if (isNpmInstall(raw) || n === 'install') {
      await pushLines([
        { type: 'error', content: terminalContent.install.npm404Code },
        { type: 'error', content: terminalContent.install.npmNotFound },
        { type: 'text', content: '' },
        { type: 'text', content: terminalContent.install.notPublished },
        { type: 'text', content: '' },
        { type: 'text', content: terminalContent.install.progressHeading },
        {
          type: 'progress',
          content: {
          percent: terminalContent.install.progressPercent,
          width: terminalContent.install.progressWidth,
          },
          options: {
            done: true,
            visibleLength: 1e6,
            delayAfterMs: PROGRESS_ANIMATION_WAIT_MS,
          },
        },
        { type: 'text', content: '' },
        { type: 'text', content: terminalContent.install.tasksHeading },
        { type: 'text', content: terminalContent.install.tasks.join('\n') },
        { type: 'text', content: '' },
        { type: 'text', content: terminalContent.install.contactNudge },
      ])
      done()
      return
    }

    if (n === 'contact') {
      await pushLine('text', contactContent.heading)
      await pushLines(contactContent.links.map(link => ({ type: 'link', content: link })))
      done()
      return
    }

    if (n === 'about') {
      await pushLine('about-tree', {
        lines: terminalContent.about.tree.split('\n'),
        linkText: 'package.json',
        href: terminalContent.about.resumeHref,
      })
      done()
      return
    }

    if (n === 'clear') {
      clearOutput()
      done()
      return
    }

    await pushLine('error', `command not found: ${raw}`)
    await pushLine('muted', terminalContent.init.tipDesktop)
    done()
  }

  function runCommand(cmd) {
    commandQueue = commandQueue.then(() => executeCommand(cmd))
    return commandQueue
  }

  return { runCommand }
}
