/**
 * Mocks backend responses from JSON files.
 * Replace with real API calls when backend exists.
 */
import type { TerminalResponse, TerminalEvent, TerminalLineType } from './types/terminalResponse'
import { normalizeCommand, isNpmInstall } from './utils/terminalCommands'
import terminalConfig from './content/terminal/config.json'
import bootSequence from './content/terminal/boot.json'
import helpResponse from './content/terminal/responses/help.json'
import aboutResponse from './content/terminal/responses/about.json'
import contactResponse from './content/terminal/responses/contact.json'
import installResponse from './content/terminal/responses/install.json'

type JsonLine = { type: string; content: unknown; options?: Record<string, unknown> }

function jsonLinesToEvents(lines: JsonLine[]): TerminalEvent[] {
  return lines.map(line => ({
    kind: 'line' as const,
    lineType: line.type as TerminalLineType,
    content: line.content,
    options: line.options,
  }))
}

function clone<T>(obj: T): T {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj))
}

const responseTemplates = new Map<string, { sequence: TerminalEvent[] }>([
  ['help', { sequence: [{ kind: 'echo-command', value: '' }, ...jsonLinesToEvents(clone(helpResponse) as JsonLine[])] }],
  ['about', { sequence: [{ kind: 'echo-command', value: '' }, ...jsonLinesToEvents(clone(aboutResponse) as JsonLine[])] }],
  ['contact', { sequence: [{ kind: 'echo-command', value: '' }, ...jsonLinesToEvents(clone(contactResponse) as JsonLine[])] }],
  ['install', { sequence: [{ kind: 'echo-command', value: '' }, ...jsonLinesToEvents(clone(installResponse) as JsonLine[])] }],
])

function withCommand(raw: string, template: { sequence: TerminalEvent[] }): TerminalResponse {
  const sequence = template.sequence.map(ev =>
    ev.kind === 'echo-command' ? { ...ev, value: raw } : ev
  ) as TerminalEvent[]
  return { command: raw, sequence }
}

/** Resolve raw command to response (mocks backend). */
export function resolveCommand(rawCommand: string): TerminalResponse {
  const raw = (rawCommand || '').trim()
  if (!raw) {
    return { command: '', sequence: [{ kind: 'echo-command', value: '' }, { kind: 'line', lineType: 'muted', content: '' }] }
  }
  const n = normalizeCommand(raw)
  if (n === 'clear') {
    return { command: raw, sequence: [{ kind: 'echo-command', value: raw }, { kind: 'clear' }] }
  }
  const template = n === 'install' || isNpmInstall(raw) ? responseTemplates.get('install') : responseTemplates.get(n)
  if (template) return withCommand(raw, template)
  const init = terminalConfig.init as { tipDesktop?: string }
  return {
    command: raw,
    sequence: [
      { kind: 'echo-command', value: raw },
      { kind: 'line', lineType: 'error', content: `command not found: ${raw}` },
      { kind: 'line', lineType: 'muted', content: init.tipDesktop ?? '' },
    ],
  }
}

/** Boot sequence from content/terminal/boot.json. */
export function getBootSequence(): TerminalEvent[] {
  return (bootSequence as TerminalEvent[]).slice()
}

/** Hint content (note + tip) after boot. */
export function getHintContent(): { note: string; tipDesktop: string; tipMobile: string } {
  const init = terminalConfig.init as { note?: string; tipDesktop?: string; tipMobile?: string }
  return {
    note: init.note ?? '',
    tipDesktop: init.tipDesktop ?? '',
    tipMobile: init.tipMobile ?? '',
  }
}

export const PROMPT = (terminalConfig as { prompt?: string }).prompt ?? 'visitor@portfolio:~$ '
