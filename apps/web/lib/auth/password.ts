// PBKDF2-over-WebCrypto password hashing (W2-326). No external crypto
// dependency — PBKDF2 is natively available via crypto.subtle in the
// Workers runtime, so there is nothing to add to the dependency
// whitelist for this.

const ITERATIONS = 100_000
const KEY_LENGTH_BITS = 256

export type HashedPassword = {
  hash: string
  salt: string
  iterations: number
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH_BITS,
  )
}

export async function hashPassword(password: string): Promise<HashedPassword> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await deriveBits(password, salt, ITERATIONS)
  return { hash: toHex(bits), salt: toHex(salt.buffer as ArrayBuffer), iterations: ITERATIONS }
}

export async function verifyPassword(password: string, stored: HashedPassword): Promise<boolean> {
  const salt = fromHex(stored.salt)
  const bits = await deriveBits(password, salt, stored.iterations)
  return timingSafeEqualHex(toHex(bits), stored.hash)
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export function generateToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer)
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return toHex(digest)
}
