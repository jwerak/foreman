import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import TemplateGenerator from '../TemplateGenerator';
import { rtlHelpers } from '../../../common/rtlTestHelpers';

describe('TemplateGenerator', () => {
  it('renders Download button when not polling and no errors', () => {
    rtlHelpers.renderWithStore(
      <TemplateGenerator data={{ templateName: 'template' }} />,
      {
        templates: {
          polling: false,
          dataUrl: '/data/IDENTIFIER.json',
          generatingError: null,
          generatingErrorMessages: null,
        },
      }
    );

    expect(screen.getByText('Generating a report')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Generating of the report template has been completed\./i)
    ).toBeInTheDocument();
  });

  it('renders info alert when polling', () => {
    rtlHelpers.renderWithStore(
      <TemplateGenerator data={{ templateName: 'template' }} />,
      {
        templates: {
          polling: true,
          dataUrl: '/data/IDENTIFIER.json',
          generatingError: null,
          generatingErrorMessages: null,
        },
      }
    );

    expect(screen.getByText('Generating a report')).toBeInTheDocument();
    expect(
      screen.getByText(/Report template is now being generated/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('renders combined errors when present and hides the button', () => {
    rtlHelpers.renderWithStore(
      <TemplateGenerator data={{ templateName: 'template' }} />,
      {
        templates: {
          polling: false,
          dataUrl: null,
          generatingError: '422 unprocessable entity',
          generatingErrorMessages: [
            { message: 'Eh there was no method error during the render :(' },
          ],
        },
      }
    );

    expect(
      screen.getByText(/Eh there was no method error during the render/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('renders nothing when not polling and no dataUrl', () => {
    const { container } = rtlHelpers.renderWithStore(
      <TemplateGenerator data={{ templateName: 'template' }} />,
      {
        templates: {
          polling: false,
          dataUrl: null,
          generatingError: null,
          generatingErrorMessages: null,
        },
      }
    );
    expect(container.firstChild).toBeNull();
  });
});
