import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductCockpitPreview from './ProductCockpitPreview'

vi.mock('./WorkspaceCockpit', () => ({
  default: ({ onParametersChange }: { onParametersChange?: (value: unknown) => void }) => (
    <button type="button" onClick={() => onParametersChange?.({ plotWidthM: 31, plotDepthM: 41, setbackM: 3, floors: 6 })}>Mutate preview</button>
  ),
}))

describe('ProductCockpitPreview state handoff', () => {
  beforeEach(() => window.localStorage.clear())

  it('persists the live preview state before opening the workspace', () => {
    render(<ProductCockpitPreview product="designstudio" label="DesignStudio" />)
    fireEvent.click(screen.getByRole('button', { name: 'Mutate preview' }))
    const link = screen.getByRole('link', { name: 'Continue in workspace' })
    link.addEventListener('click', event => event.preventDefault())
    fireEvent.click(link)
    expect(link.getAttribute('href')).toBe('/project-workspace?source=designstudio')
    expect(JSON.parse(window.localStorage.getItem('ferrum-cockpit-handoff') ?? '{}')).toEqual({
      version: 1,
      source: 'designstudio',
      parameters: { plotWidthM: 31, plotDepthM: 41, setbackM: 3, floors: 6 },
    })
  })
})
