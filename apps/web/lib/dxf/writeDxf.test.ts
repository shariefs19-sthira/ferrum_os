import { describe, expect, it } from 'vitest'
import { writeDxf } from './writeDxf'

describe('writeDxf', () => {
  it('keeps room rectangles and emits named opening layers', () => {
    const dxf = writeDxf({ rects: [{ layer: 'PLOT', x: 0, y: 0, width: 20, height: 30 }], lines: [{ layer: 'DOORS', x1: 1, y1: 0, x2: 2, y2: 0 }, { layer: 'WINDOWS', x1: 3, y1: 0, x2: 4, y2: 0 }] })
    expect(dxf).toContain('8\nPLOT')
    expect(dxf).toContain('8\nDOORS')
    expect(dxf).toContain('8\nWINDOWS')
  })
})
