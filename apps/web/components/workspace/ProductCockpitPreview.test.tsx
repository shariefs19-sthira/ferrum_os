import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductCockpitPreview from './ProductCockpitPreview'

vi.mock('./WorkspaceCockpit', () => ({
  default: ({ onParametersChange, fullscreenControl }: { onParametersChange?: (value: unknown) => void; fullscreenControl?: { label: string; onClick: () => void } }) => <><button type="button" onClick={() => onParametersChange?.({ plotWidthM: 31, plotDepthM: 41, setbackM: 3, floors: 6 })}>Mutate preview</button><button type="button" onClick={fullscreenControl?.onClick}>{fullscreenControl?.label}</button></>,
}))

describe('ProductCockpitPreview state handoff', () => {
  beforeEach(() => window.localStorage.clear())

  it('persists the live preview state before opening the workspace', () => {
    render(<ProductCockpitPreview product="designstudio" label="DesignStudio" />)
    fireEvent.click(screen.getByRole('button', { name: 'Mutate preview' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open in workspace ⛶' }))
    expect(JSON.parse(window.localStorage.getItem('ferrum-cockpit-handoff') ?? '{}')).toEqual({
      version: 1,
      source: 'designstudio',
      parameters: { plotWidthM: 31, plotDepthM: 41, setbackM: 3, floors: 6 },
    })
    expect(window.localStorage.getItem('ferrum-workspace-fullscreen-pending')).toBe('true')
  })
})
