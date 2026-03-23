/**
 * Response payload for a terminal command.
 * The frontend plays the sequence without command-specific branching.
 */
export type TerminalResponse = {
  command: string
  sequence: TerminalEvent[]
}

/** Line types supported by the terminal renderer. */
export type TerminalLineType =
  | 'system'
  | 'text'
  | 'success'
  | 'error'
  | 'warning'
  | 'note'
  | 'tip'
  | 'section'
  | 'muted'
  | 'help-item'
  | 'about-tree'
  | 'link'
  | 'progress'

/**
 * Discriminated union of terminal playback events.
 * The player iterates over these and plays each in order.
 */
export type TerminalEvent =
  | { kind: 'echo-command'; value: string }
  | {
      kind: 'line'
      lineType: TerminalLineType
      content: unknown
      options?: { delayAfterMs?: number; done?: boolean; visibleLength?: number }
    }
  | { kind: 'spinner'; durationMs: number }
  | { kind: 'wait'; durationMs: number }
  | { kind: 'clear' }
