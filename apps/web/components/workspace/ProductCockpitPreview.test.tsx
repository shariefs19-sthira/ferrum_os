import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductCockpitPreview from './ProductCockpitPreview'

vi.mock('./WorkspaceCockpit', () => ({
  default: ({ onParametersChange, fullscreenControl }: { onParametersChange?: (value: unknown) => void; fullscreenControl?: { label: string; onClick: () => void } }) => <><button type="button" onClick={() => onParametersChange?.({ plotWidthM: 31, plotDepthM: 41, setbackM: 3, floors: 6 })}>Mutate preview</button><button type="button" onClick={fullscreenControl?.onClick}>{fullscreenControl?.label}</button></>,
}))

vi.mock('./FullscreenController', () => ({
  default: ({ children }: { children: (state: { active: boolean; toggle: () => void }) => ReactNode }) => children({
    active: false,
    toggle: () => window.localStorage.setItem('ferrum-workspace-fullscreen-pending', 'true'),
  }),
}))

describe('ProductCockpitPreview state handoff', () => {
  beforeEach(() => window.localStorage.clear())

  it('persists the live preview state before opening the workspace', () => {
    render(<ProductCockpitPreview product="designstudio" label="DesignStudio" />)
    fireEvent.click(screen.getByRole('button', { name: 'Mutate preview' }))
    expect(document.querySelector('[data-cross-product-live="designstudio"]')?.getAttribute('data-shared-floors')).toBe('6')
    fireEvent.click(screen.getByRole('button', { name: 'Open in workspace ⛶' }))
    expect(JSON.parse(window.localStorage.getItem('ferrum-cockpit-handoff') ?? '{}')).toEqual({
      version: 1,
      source: 'designstudio',
      parameters: { plotWidthM: 31, plotDepthM: 41, setbackM: 3, floors: 6 },
    })
    expect(window.localStorage.getItem('ferrum-workspace-fullscreen-pending')).toBe('true')
  })

  it('contains a product tool inside its host column when requested', () => {
    const { container } = render(<ProductCockpitPreview product="landintel" label="LandIntel" contained><div>Lookup</div></ProductCockpitPreview>)
    const cockpit = container.querySelector('[data-product-cockpit="landintel"]')
    expect(cockpit?.getAttribute('data-cockpit-layout')).toBe('contained')
    expect(cockpit?.classList.contains('max-w-full')).toBe(true)
    expect(cockpit?.classList.contains('w-screen')).toBe(false)
  })

  it('uses the section width for a product-page cockpit rather than a viewport breakout', () => {
    const { container } = render(<ProductCockpitPreview product="landintel" label="LandIntel" layout="product-page" />)
    const cockpit = container.querySelector('[data-product-cockpit="landintel"]')
    expect(cockpit?.getAttribute('data-cockpit-layout')).toBe('product-page')
    expect(cockpit?.classList.contains('w-full')).toBe(true)
    expect(cockpit?.classList.contains('w-screen')).toBe(false)
  })
})
