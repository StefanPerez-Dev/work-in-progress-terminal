/**
 * Mocks backend responses from JSON files.
 * Replace with real API calls when backend exists.
 *
 * RULE 1: Every response comes from JSON through terminalApi.ts.
 * All response JSON files share the same contract: { id, sequence }.
 * See content/terminal/responses.schema.json for the schema.
 *
 * Only this module knows: raw input normalization, alias resolution,
 * when empty/unknown/clear is returned, and which response file maps to which command.
 */
import type { TerminalResponse, TerminalEvent } from '../types/terminal'
import terminalConfig from '../content/terminal/config.json'
import bootResponse from '../content/terminal/responses/boot.json'
import helpResponse from '../content/terminal/responses/help.json'
import aboutResponse from '../content/terminal/responses/about.json'
import contactResponse from '../content/terminal/responses/contact.json'
import installResponse from '../content/terminal/responses/install.json'
import unknownResponse from '../content/terminal/responses/unknown.json'
import clearResponse from '../content/terminal/responses/clear.json'
import emptyResponse from '../content/terminal/responses/empty.json'
import hintResponse from '../content/terminal/responses/hint.json'

function normalizeCommand(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isNpmInstall(cmd: string): boolean {
  const n = normalizeCommand(cmd)
  return (
    n === 'npm install stefan.perez' ||
    n === 'npm i stefan.perez' ||
    n.startsWith('npm install stefan.perez ') ||
    n.startsWith('npm i stefan.perez ')
  )
}

/** Maps any raw input to a response id (empty, clear, help, install, unknown, etc.). */
function getResponseKey(rawCommand: string): string {
  const raw = (rawCommand || '').trim()
  if (!raw) return 'empty'
  const n = normalizeCommand(raw)
  if (n === 'clear') return 'clear'
  if (n === 'install' || isNpmInstall(raw)) return 'install'
  return responses.has(n) ? n : 'unknown'
}

function clone<T>(obj: T): T {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj))
}

function substitute(content: unknown, vars: Record<string, string>): unknown {
  if (typeof content !== 'string') return content
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

function substituteInSequence(
  seq: TerminalEvent[],
  vars: Record<string, string>
): TerminalEvent[] {
  return seq.map(ev => {
    if (ev.kind === 'echo-command') return { ...ev, value: vars.command ?? ev.value }
    if (ev.kind === 'line') return { ...ev, content: substitute(ev.content, vars) }
    return ev
  })
}

type ResponseShape = { id: string; sequence: TerminalEvent[] }

const responses = new Map<string, ResponseShape>([
  ['boot', bootResponse as ResponseShape],
  ['help', helpResponse as ResponseShape],
  ['about', aboutResponse as ResponseShape],
  ['contact', contactResponse as ResponseShape],
  ['install', installResponse as ResponseShape],
  ['unknown', unknownResponse as ResponseShape],
  ['clear', clearResponse as ResponseShape],
  ['empty', emptyResponse as ResponseShape],
  ['hint', hintResponse as ResponseShape],
])

function withCommand(raw: string, template: ResponseShape): TerminalResponse {
  const vars = {
    command: raw,
    tipDesktop: (terminalConfig.init as { tipDesktop?: string }).tipDesktop ?? '',
  }
  return {
    id: template.id,
    sequence: substituteInSequence(clone(template.sequence), vars),
  }
}

/** Boot response from content/terminal/responses/boot.json. */
export function getBootResponse(): TerminalResponse {
  return clone(responses.get('boot')!) as TerminalResponse
}

/** Resolve raw command to response (mocks backend). */
export function resolveCommand(rawCommand: string): TerminalResponse {
  const raw = (rawCommand || '').trim()
  const key = getResponseKey(rawCommand)
  const template = responses.get(key)!
  return withCommand(raw, template)
}

/** Hint response shown after boot (note + tip). */
export function getHintResponse(isMobile: boolean): TerminalResponse {
  const init = terminalConfig.init as { note?: string; tipDesktop?: string; tipMobile?: string }
  const vars = {
    note: init.note ?? '',
    tip: isMobile ? (init.tipMobile ?? '') : (init.tipDesktop ?? ''),
  }
  const template = responses.get('hint')!
  return {
    id: template.id,
    sequence: substituteInSequence(clone(template.sequence), vars),
  }
}

export const PROMPT = (terminalConfig as { prompt?: string }).prompt ?? 'visitor@portfolio:~$ '
