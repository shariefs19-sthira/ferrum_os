import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EvidenceStateBadge from './EvidenceStateBadge'

describe('EvidenceStateBadge', () => {
  it.each(['LIVE', 'INDICATIVE', 'SOURCE-VERIFIED', 'GAP', 'ROADMAP'] as const)(
    'renders the %s state as visible text (never color alone)',
    (state) => {
      render(<EvidenceStateBadge state={state} />)
      expect(screen.getByText(state)).toBeTruthy()
      expect(screen.getByRole('status').textContent).toBe(state)
    },
  )

  it('never uses relume-accent as the text color (fails WCAG AA on white)', () => {
    render(<EvidenceStateBadge state="INDICATIVE" />)
    const badge = screen.getByRole('status')
    expect(badge.className).not.toMatch(/text-relume-accent/)
    expect(badge.className).toMatch(/border-relume-accent/)
  })
})
