import React from 'react';

import { render, screen } from '@testing-library/react';

import Index from '../../pages/index';

describe('Index', () => {
  it('renders a header', () => {
    render(<Index />);

    const header = screen.getByText(/index page/i);

    expect(header).toBeInTheDocument();
  });
});
