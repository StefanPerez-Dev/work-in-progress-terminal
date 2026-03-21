export type HelpItem = {
  label: string
  description: string
}

export const terminalContent = {
  prompt: 'visitor@portfolio:~$ ',
  srOnlyHint:
    'Terminal. On desktop, type help and press Enter to see commands. On mobile, tap commands below. Try npm install stefan.perez for the main interaction.',
  init: {
    steps: [
      'Initializing portfolio environment...',
      'Resolving dependencies...',
      'Starting dev server...',
    ],
    ready: '✔ Environment ready',
    note: 'Note: My portfolio is still under construction...',
    tipDesktop: 'Tip: Try "install" or type "help".',
    tipMobile: 'Tip: Tap a command below to explore.',
  },
  help: {
    heading: 'Available commands',
    items: [
      { label: 'install', description: 'Try installing the portfolio (recommended)' },
      { label: 'about', description: 'About the developer' },
      { label: 'contact', description: 'Get in touch' },
      { label: 'clear', description: 'Clear the terminal' },
    ] satisfies HelpItem[],
  },
  install: {
    npm404Code: 'npm ERR! code E404',
    npmNotFound: 'npm ERR! package stefan.perez not found',
    notPublished: "This portfolio hasn't been published yet.",
    progressHeading: 'Progress:',
    progressPercent: 70,
    progressWidth: 18,
    tasksHeading: 'Current tasks:',
    tasks: ['• polishing UI', '• fixing bugs', '• preparing release'],
    contactNudge: 'Try "contact" to get in touch.',
  },
  about: {
    heading: 'Stefan Perez',
    role: 'Front-end Developer',
    focus: ['performance', 'accessibility'],
    stack: ['Vue', 'React', 'TypeScript'],
    status: 'under construction',
    resumeHref: '/cv.pdf',
    tree: `src/stefan-perez
├── role
│   └── Front-end Developer
├── stack
│   ├── Vue
│   ├── React
│   └── TypeScript
│   └── NuxtJS
│   └── NextJS
│   └── ....
└── More Information
    └── see package.json`,
  },
  mobile: {
    hint: 'Tap a command below to explore.',
    commands: ['install', 'about', 'contact', 'help', 'clear'],
    ariaLabel: 'Quick commands',
  },
} as const

