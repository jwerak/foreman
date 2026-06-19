import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { testComponentSnapshotsWithFixtures } from '../../../../common/testHelpers';

import EditorNavbar from '../EditorNavbar';
import { editorOptions, showBooleans } from '../../Editor.fixtures';

const { data: editorOptionsData, ...restEditorOptions } = editorOptions;

const props = {
  ...editorOptionsData,
  ...restEditorOptions,
  ...showBooleans,
  isDiff: true,
};

const fixtures = {
  'renders EditorNavbar': props,
};

describe('EditorNavbar', () => {
  describe('rendring', () =>
    testComponentSnapshotsWithFixtures(EditorNavbar, fixtures));

  describe('simulate onClick', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call changeTab on tab clicks', () => {
      const changeTab = jest.fn();

      let wrapper;
      act(() => {
        wrapper = mount(
          <EditorNavbar
            {...props}
            changeTab={changeTab}
            isDiff
            isRendering
            selectedView="preview"
          />
        );
        jest.runAllTimers();
      });

      act(() => {
        wrapper
          .find('#input-navitem')
          .first()
          .find('button')
          .first()
          .simulate('click');
        jest.runAllTimers();
      });

      act(() => {
        wrapper
          .find('#diff-navitem')
          .first()
          .find('button')
          .first()
          .simulate('click');
        jest.runAllTimers();
      });

      act(() => {
        wrapper.setProps({
          ...props,
          isRendering: false,
          selectedView: 'input',
        });
        wrapper.update();
        jest.runAllTimers();
      });

      act(() => {
        wrapper
          .find('#preview-navitem')
          .first()
          .find('button')
          .first()
          .simulate('click');
        jest.runAllTimers();
      });

      expect(changeTab).toHaveBeenCalledTimes(2);
    });
  });
});
