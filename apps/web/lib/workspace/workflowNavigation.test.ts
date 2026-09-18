import { describe, expect, it } from 'vitest'
import { withWorkspaceProduct, workspaceProductFromParam, workflowStageForProduct } from './workflowNavigation'

describe('workflow navigation', () => {
  it('maps lifecycle stages onto the existing products', () => {
    expect(workflowStageForProduct('Structure')?.label).toBe('Engineering')
    expect(workflowStageForProduct('Cost')?.label).toBe('Quantities & cost')
  })

  it('falls back safely when a bookmark contains an unknown product', () => {
    expect(workspaceProductFromParam('not-a-product')).toBe('Land')
    expect(workspaceProductFromParam('Design')).toBe('Design')
  })

  it('preserves project, camera/view and revision context when switching workflow', () => {
    const source = 'https://ferrum.test/project-workspace/cockpit?project=alpha&workspaceView=camera-state&revision=7'
    const result = new URL(withWorkspaceProduct(source, 'Cost'))
    expect(result.searchParams.get('project')).toBe('alpha')
    expect(result.searchParams.get('workspaceView')).toBe('camera-state')
    expect(result.searchParams.get('revision')).toBe('7')
    expect(result.searchParams.get('product')).toBe('Cost')
  })
})
