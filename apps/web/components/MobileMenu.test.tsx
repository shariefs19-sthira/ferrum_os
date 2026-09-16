import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MobileMenu from './MobileMenu'

describe('MobileMenu Ferrum Projects link', () => {
  it('exposes an external, safely-attributed Ferrum Projects link when open', () => {
    render(<MobileMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const link = screen.getByRole('link', { name: /ferrum projects/i })
    expect(link.getAttribute('href')).toBe('https://ferrumprojects.in')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })
})
