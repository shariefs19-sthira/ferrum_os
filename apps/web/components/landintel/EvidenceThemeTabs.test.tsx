import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EvidenceThemeTabs from './EvidenceThemeTabs'

const themes = [
  { id: 'land', label: 'Land', description: 'Land evidence', content: <p>Land panel</p> },
  { id: 'access', label: 'Access', description: 'Access evidence', content: <p>Access panel</p> },
  { id: 'market', label: 'Market', description: 'Market evidence', content: <p>Market panel</p> },
]

describe('LandIntel evidence theme tabs', () => {
  it('starts on land and exposes every analytical theme as an accessible tab', () => {
    render(<EvidenceThemeTabs themes={themes} />)

    expect(screen.getByRole('tab', { name: 'Land' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Access' }).getAttribute('aria-selected')).toBe('false')
    expect(screen.getByRole('tabpanel', { name: 'Land' })).toBeTruthy()
    expect(screen.queryByRole('tabpanel', { name: 'Access' })).toBeNull()
  })

  it('switches themes by click and keyboard without hiding unsupported themes', () => {
    render(<EvidenceThemeTabs themes={themes} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Access' }))
    expect(screen.getByRole('tabpanel', { name: 'Access' })).toBeTruthy()

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Access' }), { key: 'End' })
    expect(screen.getByRole('tab', { name: 'Market' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel', { name: 'Market' })).toBeTruthy()
  })
})
