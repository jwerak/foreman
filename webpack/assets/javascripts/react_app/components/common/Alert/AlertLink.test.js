import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import AlertLink from './AlertLink';

describe('AlertLink', () => {
  it('should render with href', () => {
    render(<AlertLink href="#">some link</AlertLink>);

    const link = screen.getByRole('link', { name: 'some link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#');
  });

  it('should render with onClick', () => {
    const handleClick = jest.fn();
    render(<AlertLink onClick={handleClick}>some link</AlertLink>);

    const link = screen.getByText('some link');
    expect(link).toBeInTheDocument();

    fireEvent.click(link);

    expect(handleClick).toHaveBeenCalled();
  });
});
