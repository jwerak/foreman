import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Editor from '../Editor';
import { editor as editorState, editorOptions } from '../Editor.fixtures';
import { rtlHelpers } from '../../../common/rtlTestHelpers';

// Mock initializeEditor to a no-op thunk so mount doesn't reset store state
jest.mock('../EditorActions', () => {
  const actual = jest.requireActual('../EditorActions');
  return {
    ...actual,
    initializeEditor: () => () => {},
  };
});

const { data } = editorOptions;

const renderEditor = (extraState = {}) =>
  rtlHelpers.renderWithStore(
    <Editor data={data} />,
    { editor: { ...editorState, ...extraState } }
  );

describe('Editor', () => {
  jest.useFakeTimers();

  describe('rendering', () => {
    it('renders editor', async () => {
      const { container } = renderEditor();
      await act(async () => jest.advanceTimersByTime(1000));
      expect(container.querySelector('#editor-container')).toBeInTheDocument();
    });
  });

  describe('triggering', () => {
    it('should trigger input view', async () => {
      const { container } = renderEditor();
      await act(async () => jest.advanceTimersByTime(1000));
      const inputNavItem = container.querySelector('#input-navitem');
      expect(inputNavItem).toHaveClass('active');
    });

    it('should trigger input view with no template', async () => {
      const { container } = rtlHelpers.renderWithStore(
        <Editor data={{ ...data, template: null }} />,
        { editor: { ...editorState } }
      );
      await act(async () => jest.advanceTimersByTime(1000));
      expect(container.querySelector('#editor-container')).toBeInTheDocument();
    });

    it('should trigger diff view', async () => {
      const { container } = renderEditor({ selectedView: 'diff' });
      await act(async () => jest.advanceTimersByTime(1000));
      const diffNavItem = container.querySelector('#diff-navitem');
      expect(diffNavItem).toHaveClass('active');
    });

    it('should trigger preview view', async () => {
      const { container, unmount } = renderEditor({
        selectedView: 'preview',
        isRendering: true,
        showError: true,
      });
      const closeButton = container.querySelector('button.close');
      if (closeButton) {
        fireEvent.click(closeButton);
      }
      await act(async () => jest.advanceTimersByTime(1000));
      unmount();

      const { container: container2 } = renderEditor({
        selectedView: 'preview',
        isRendering: true,
        showError: true,
      });
      await act(async () => jest.advanceTimersByTime(1000));

      const previewNavItem = container2.querySelector('#preview-navitem');
      expect(previewNavItem).toHaveClass('active');
    });
  });

  it('should trigger hidden value editor', async () => {
    const { container } = renderEditor({
      selectedView: 'preview',
      isRendering: true,
      isMasked: true,
    });
    await act(async () => jest.advanceTimersByTime(1000));
    expect(container.querySelector('.mask-editor')).toBeInTheDocument();
  });

  it('textarea disappears if readOnly', async () => {
    const { container } = renderEditor({ selectedView: 'input' });
    await act(async () => jest.advanceTimersByTime(1000));
    expect(container.querySelector('textarea.hidden')).toBeInTheDocument();

    // Re-render with readOnly in the store
    const { container: container2 } = renderEditor({
      selectedView: 'input',
      readOnly: true,
    });
    await act(async () => jest.advanceTimersByTime(1000));
    expect(container2.querySelector('textarea.hidden')).not.toBeInTheDocument();
  });
});
