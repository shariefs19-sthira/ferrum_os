import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(<HomePage />);

    // Simply check if the main heading is present
    expect(screen.getByText(/Ferrum OS - AI-Native Construction Platform/i)).toBeInTheDocument();
  });
});