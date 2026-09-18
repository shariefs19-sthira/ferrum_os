import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GovernedOrchestrationChain from './GovernedOrchestrationChain'
import { governedAiQuestions, governedOrchestrationStages } from '../../lib/governedOrchestration'

describe('GovernedOrchestrationChain', () => {
  it('shows the complete cross-functional chain without claiming execution', () => {
    const { container } = render(<GovernedOrchestrationChain />)
    expect(container.querySelectorAll('[data-orchestration-stage]')).toHaveLength(governedOrchestrationStages.length)
    expect(screen.getByText(/end-to-end execution not built/i)).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(governedOrchestrationStages.length + governedAiQuestions.length)
  })
})
