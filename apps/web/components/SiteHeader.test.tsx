import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SiteHeader from './SiteHeader'

describe('SiteHeader Ferrum Projects link', () => {
  it('links to the external sister site with safe external-link semantics', () => {
    render(<SiteHeader />)
    const link = screen.getByRole('link', { name: /ferrum projects/i })
    expect(link.getAttribute('href')).toBe('https://ferrumprojects.in')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })

  it('does not visually outrank the primary Start Free Trial action', () => {
    render(<SiteHeader />)
    const ferrumProjects = screen.getByRole('link', { name: /ferrum projects/i })
    const primaryCta = screen.getByRole('link', { name: 'Start Free Trial' })
    expect(ferrumProjects.className).not.toContain('bg-relume-ink')
    expect(primaryCta.className).toContain('bg-relume-ink')
  })
})
