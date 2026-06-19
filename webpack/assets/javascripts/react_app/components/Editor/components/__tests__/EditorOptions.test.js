import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import EditorOptions from '../EditorOptions';
import { editorOptions, showBooleans } from '../../Editor.fixtures';

const defaultProps = { ...editorOptions, ...showBooleans, isDiff: true };

describe('EditorOptions', () => {
  it('renders EditorOptions', () => {
    const { container } = render(<EditorOptions {...defaultProps} />);

    expect(container.querySelector('#editor-dropdowns')).toBeInTheDocument();
    expect(container.querySelector('#undo-btn')).toBeInTheDocument();
    expect(container.querySelector('#fullscreen-btn')).toBeInTheDocument();
  });

  describe('simulate onClick', () => {
    it('calls revertChanges and changeTab when undo button is clicked and confirmed', () => {
      const changeTab = jest.fn();
      const revertChanges = jest.fn();
      window.confirm = jest.fn(() => true);

      const { container } = render(
        <EditorOptions
          {...defaultProps}
          changeTab={changeTab}
          revertChanges={revertChanges}
          isDiff
          selectedView="diff"
        />
      );

      fireEvent.click(container.querySelector('#undo-btn'));

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you would like to revert all changes?'
      );
      expect(revertChanges).toHaveBeenCalledTimes(1);
      expect(changeTab).toHaveBeenCalledWith('input');
    });

    it('does not call revertChanges when undo is cancelled', () => {
      const changeTab = jest.fn();
      const revertChanges = jest.fn();
      window.confirm = jest.fn(() => false);

      const { container } = render(
        <EditorOptions
          {...defaultProps}
          changeTab={changeTab}
          revertChanges={revertChanges}
          isDiff
          selectedView="diff"
        />
      );

      fireEvent.click(container.querySelector('#undo-btn'));

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(revertChanges).not.toHaveBeenCalled();
      expect(changeTab).not.toHaveBeenCalled();
    });

    it('triggers file input click when import button is clicked', () => {
      const importFile = jest.fn();

      const { container } = render(
        <EditorOptions
          {...defaultProps}
          importFile={importFile}
          isDiff
          selectedView="input"
        />
      );

      const fileInput = container.querySelector('input[type="file"]');
      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.click(container.querySelector('#import-btn'));

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });
});
