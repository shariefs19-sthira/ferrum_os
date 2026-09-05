// Resolves the deployed live-edge base URL for audit/battery scripts.
// Precedence: FERRUM_LIVE_BASE_URL env var > docs/FLEET_CONFIG.json's
// liveBaseUrl. Added after a workers.dev subdomain rename (2026-09-05)
// broke every script that had the old URL hardcoded — see
// docs/FLEET_CONFIG.json's own comment for the incident.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function getLiveBaseUrl() {
  if (process.env.FERRUM_LIVE_BASE_URL) return process.env.FERRUM_LIVE_BASE_URL
  const configPath = join(__dirname, '..', 'docs', 'FLEET_CONFIG.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  return config.liveBaseUrl
}
