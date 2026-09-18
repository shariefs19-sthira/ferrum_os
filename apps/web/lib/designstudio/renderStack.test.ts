import { describe, expect, it } from 'vitest'
import { designStudioRenderStack } from './renderStack'

describe('DesignStudio rendering authority boundary', () => {
  it('uses open engines as the primary stack and keeps proprietary tools plugin-only', () => {
    expect(designStudioRenderStack.find((item) => item.id === 'three')?.status).toBe('ACTIVE')
    expect(designStudioRenderStack.find((item) => item.id === 'three-path')?.runtime).toBe('BROWSER')
    expect(designStudioRenderStack.filter((item) => ['d5-plugin', 'vray-plugin'].includes(item.id)).every((item) => item.status === 'PLUGIN ONLY')).toBe(true)
    expect(designStudioRenderStack.every((item) => item.projectWriteAccess === false)).toBe(true)
  })
})
