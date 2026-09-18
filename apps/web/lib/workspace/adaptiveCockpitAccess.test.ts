import { describe, expect, it } from 'vitest'
import { adaptiveCockpitAccess } from './adaptiveCockpitAccess'

describe('adaptive cockpit feature parity matrix', () => {
  it('maps every major cockpit task to compact and wide access without a default canvas obstruction', () => {
    const required = ['model-view', 'building-library', 'parameters', 'guided-options', 'evidence', 'render-mode', 'product-switching', 'workspace-tools', 'sutra', 'territory', 'data-extract', 'permalink', 'fullscreen']
    expect(adaptiveCockpitAccess.map((entry) => entry.feature)).toEqual(required)
    expect(new Set(adaptiveCockpitAccess.map((entry) => entry.feature)).size).toBe(adaptiveCockpitAccess.length)
    expect(adaptiveCockpitAccess.every((entry) => entry.compactAccess && entry.wideAccess && entry.blocksCanvasByDefault === false)).toBe(true)
  })
})
