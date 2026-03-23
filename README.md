# Terminal Portfolio (Work in Progress)

A portfolio experience styled like a terminal, built with Vue 3 + Vite.

The app presents profile content through terminal-style commands (`help`, `install`, `about`, `contact`, `clear`) with:

- animated boot sequence
- line-by-line command output
- animated progress bar in `install`
- mobile tap-based command bar (no typing on mobile)

## Tech Stack

- Vue 3
- Vite
- TypeScript
- Tailwind CSS v4

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run format` - format repository with Prettier
- `npm run check-typescript` - run TypeScript checks with `vue-tsc`

## Commands in the App

Type (desktop) or tap (mobile):

- `help` - show available commands
- `install` - show "coming soon" status, progress, and current tasks
- `about` - show tree-style developer info
- `contact` - show clickable contact links
- `clear` - clear terminal output

## Mobile Behavior

On mobile, typing is replaced by a command chip bar to reduce friction:

- users tap commands instead of typing
- output still renders as terminal command + response
- terminal layout and aesthetic remain intact

## Project Structure

```text
src/
  components/
    Terminal.vue
    terminal/
      TerminalTitleBar.vue
      TerminalOutput.vue
      TerminalInputLine.vue
      TerminalCommandBar.vue
      TerminalLine.vue
  composables/
    useTerminalSession.ts   # Session state + orchestration
    useTerminalPlayer.ts   # Sequence playback only
  terminalApi.ts          # Mocks backend responses from JSON
  content/
    terminal/
      config.json         # prompt, init hints, mobile
      responses/          # boot, about, contact, help, install, unknown, clear, empty
```

## Content-Driven Setup

Static copy is centralized in `src/content/`:

- `profile.ts` - title bar/profile content
- `contact.ts` - contact links
- `terminal.ts` - prompt, boot messages, command copy, mobile hints

This keeps components mostly presentational and makes content updates simple.
