import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Editor from '../Editor';
import { editorOptions } from '../Editor.fixtures';

const didMountStubs = () => ({
  changeState: jest.fn(),
  importFile: jest.fn(),
  revertChanges: jest.fn(),
  previewTemplate: jest.fn(),
  initializeEditor: jest.fn(),
});

describe('Editor', () => {
  jest.useFakeTimers();

  describe('rendering', () => {
    it('renders editor', async () => {
      const { container } = render(<Editor {...editorOptions} />);
      await act(async () => jest.advanceTimersByTime(1000));
      expect(container.querySelector('#editor-container')).toBeInTheDocument();
    });
  });

  describe('triggering', () => {
    it('should trigger input view', async () => {
      const props = { ...editorOptions, ...didMountStubs() };
      const { container } = render(<Editor {...props} />);
      await act(async () => jest.advanceTimersByTime(1000));
      const inputNavItem = container.querySelector('#input-navitem');
      expect(inputNavItem).toHaveClass('active');
    });

    it('should trigger input view with no template', async () => {
      const props = {
        ...editorOptions,
        ...didMountStubs(),
        data: { ...editorOptions.data, template: null },
      };
      const { container } = render(<Editor {...props} />);
      await act(async () => jest.advanceTimersByTime(1000));
      // The component still renders with the top-level template prop from fixtures
      expect(container.querySelector('#editor-container')).toBeInTheDocument();
    });

    it('should trigger diff view', async () => {
      const props = {
        ...editorOptions,
        ...didMountStubs(),
        selectedView: 'diff',
      };
      const { container } = render(<Editor {...props} />);
      await act(async () => jest.advanceTimersByTime(1000));
      const diffNavItem = container.querySelector('#diff-navitem');
      expect(diffNavItem).toHaveClass('active');
    });

    it('should trigger preview view', async () => {
      const dismissErrorToast = jest.fn();
      const props = {
        ...editorOptions,
        ...didMountStubs(),
        selectedView: 'preview',
        isRendering: true,
        showError: true,
        dismissErrorToast,
      };
      const { container, unmount } = render(<Editor {...props} />);
      const closeButton = container.querySelector('button.close');
      if (closeButton) {
        fireEvent.click(closeButton);
      }
      await act(async () => jest.advanceTimersByTime(1000));
      unmount();

      const { container: container2 } = render(<Editor {...props} />);
      await act(async () => jest.advanceTimersByTime(1000));

      const previewNavItem = container2.querySelector('#preview-navitem');
      expect(previewNavItem).toHaveClass('active');
    });
  });

  it('should trigger hidden value editor', async () => {
    const props = {
      ...editorOptions,
      ...didMountStubs(),
      selectedView: 'preview',
      isRendering: true,
      isMasked: true,
    };
    const { container } = render(<Editor {...props} />);
    await act(async () => jest.advanceTimersByTime(1000));
    expect(container.querySelector('.mask-editor')).toBeInTheDocument();
  });

  it('textarea disappears if readOnly', async () => {
    const props = {
      ...editorOptions,
      ...didMountStubs(),
      selectedView: 'input',
    };
    const { container, rerender } = render(<Editor {...props} />);
    await act(async () => jest.advanceTimersByTime(1000));
    expect(container.querySelector('textarea.hidden')).toBeInTheDocument();
    rerender(<Editor {...props} readOnly />);
    expect(container.querySelector('textarea.hidden')).not.toBeInTheDocument();
  });
});
