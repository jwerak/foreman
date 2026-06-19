import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import EditorNavbar from '../EditorNavbar';
import { editorOptions, showBooleans } from '../../Editor.fixtures';

const { data: editorOptionsData, ...restEditorOptions } = editorOptions;

const props = {
  ...editorOptionsData,
  ...restEditorOptions,
  ...showBooleans,
  isDiff: true,
};

describe('EditorNavbar', () => {
  it('renders EditorNavbar', () => {
    const { container } = render(<EditorNavbar {...props} />);
    expect(container).toMatchSnapshot();
  });

  describe('simulate onClick', () => {
    it('should call changeTab on tab clicks', () => {
      const changeTab = jest.fn();
      const toggleRenderView = jest.fn();

      const { rerender } = render(
        <EditorNavbar
          {...props}
          changeTab={changeTab}
          toggleRenderView={toggleRenderView}
          isDiff
          isRendering
          selectedView="preview"
        />
      );

      // Click "Editor" tab - selectedView is "preview", so changeTab should fire
      fireEvent.click(screen.getByText('Editor'));

      // Click "Changes" tab - selectedView is still "preview" (prop-driven), so changeTab should fire
      fireEvent.click(screen.getByText('Changes'));

      // Re-render with updated props
      rerender(
        <EditorNavbar
          {...props}
          changeTab={changeTab}
          toggleRenderView={toggleRenderView}
          isDiff
          isRendering={false}
          selectedView="input"
        />
      );

      // Click "Preview" tab - selectedView is now "input", so changeTab should fire
      fireEvent.click(screen.getByText('Preview'));

      expect(changeTab).toHaveBeenCalledTimes(3);
      expect(changeTab).toHaveBeenCalledWith('input');
      expect(changeTab).toHaveBeenCalledWith('diff');
      expect(changeTab).toHaveBeenCalledWith('preview');
    });
  });
});
