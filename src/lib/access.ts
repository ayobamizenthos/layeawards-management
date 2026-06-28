// Front-end gate to prevent accidental deletes. Not cryptographic security.
// Supplied at build time via VITE_MANAGER_PASSWORD; never stored in the repo.
const managerPassword = import.meta.env.VITE_MANAGER_PASSWORD ?? ''

export function verifyManager(input: string): boolean {
  return managerPassword !== '' && input === managerPassword
}
