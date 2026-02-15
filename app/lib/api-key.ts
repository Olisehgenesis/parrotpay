import { createHash, randomBytes } from 'crypto'

const PREFIX = 'pk_live_'
const KEY_BYTES = 24 // 32 chars hex

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = PREFIX + randomBytes(KEY_BYTES).toString('hex')
  const hash = createHash('sha256').update(raw).digest('hex')
  const prefix = raw.slice(0, 16) + '...'
  return { raw, hash, prefix }
}

export function verifyApiKey(raw: string, hash: string): boolean {
  const computed = createHash('sha256').update(raw).digest('hex')
  return computed === hash
}

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export function extractApiKey(req: Request): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) return apiKey.trim()
  return null
}

export function hashFromRaw(raw: string): string | null {
  if (!raw || !raw.startsWith(PREFIX)) return null
  return hashApiKey(raw)
}

export const API_KEY_SIGNATURE_MESSAGE = (timestamp: string) =>
  `Create Tempo API key at ${timestamp}. This request will not trigger a blockchain transaction.`
