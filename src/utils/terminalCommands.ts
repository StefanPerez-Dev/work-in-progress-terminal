/**
 * Normalize raw command string for comparison (trim, lowercase, collapse spaces).
 * @param {string} raw
 * @returns {string}
 */
export function normalizeCommand(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Check if the command is an npm install for stefan.perez.
 * @param {string} cmd
 * @returns {boolean}
 */
export function isNpmInstall(cmd) {
  const n = normalizeCommand(cmd)
  return (
    n === 'npm install stefan.perez' ||
    n === 'npm i stefan.perez' ||
    n.startsWith('npm install stefan.perez ') ||
    n.startsWith('npm i stefan.perez ')
  )
}
