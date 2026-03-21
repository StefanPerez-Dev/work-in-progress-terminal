export type ContactLink = {
  label: string
  href: string
  display?: string
}

export const contactContent = {
  heading: 'Get in touch:',
  links: [
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/stefanperez',
      display: 'linkedin.com/in/stefanperez',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/stefanperez',
      display: 'github.com/stefanperez',
    },
    {
      label: 'Email',
      href: 'mailto:development@stefanperez.nl',
      display: 'development@stefanperez.nl',
    },
  ] satisfies ContactLink[],
} as const

