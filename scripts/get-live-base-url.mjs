// Resolves the deployed live-edge base URL for audit/battery scripts.
// Precedence: FERRUM_LIVE_BASE_URL env var > docs/FLEET_SEATS.json's
// deployment.liveUrl. Added after a workers.dev subdomain rename
// (2026-09-05) broke every script that had the old URL hardcoded.
// Originally read from docs/FLEET_CONFIG.json; consolidated 2026-09-06
// into docs/FLEET_SEATS.json's deployment block (the same single
// source of truth every seat/battery already reads for W-64) after
// the two files were found duplicating the same fact.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function getLiveBaseUrl() {
  if (process.env.FERRUM_LIVE_BASE_URL) return process.env.FERRUM_LIVE_BASE_URL
  const configPath = join(__dirname, '..', 'docs', 'FLEET_SEATS.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  return config.deployment.liveUrl
}
