import React from 'react';
import { fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import IntegrationTestHelper from '../../../common/IntegrationTestHelper';

import { editorOptions, serverRenderResponse } from '../Editor.fixtures';
import Editor, { reducers } from '../index';
import * as EditorActions from '../EditorActions'

jest.mock('../../../redux/API');

describe('Editor integration test', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clear pending timers before cleanup to prevent react-ace's
    // onChange timer from firing after unmount
    jest.clearAllTimers();
    cleanup();
    jest.useRealTimers();
  });

  it('should flow', async () => {
    jest
      .spyOn(EditorActions, 'fetchTemplatePreview')
      .mockImplementation(async () => serverRenderResponse);

    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const { container } = integrationTestHelper.mount(
      <Editor {...editorOptions} />
    );
    integrationTestHelper.takeStoreSnapshot('initial state');

    const previewBtn = container.querySelector('#preview-navitem button');
    fireEvent.click(previewBtn);

    integrationTestHelper.takeStoreAndLastActionSnapshot(
      'switched to preview view'
    );
    const navItems = container.querySelectorAll('li');
    // The preview tab is the 3rd li (index 2)
    expect(navItems[2]).toHaveClass('active');

    await act(async () => {
      await IntegrationTestHelper.flushAllPromises();
    });

    const maximizeBtn = container.querySelector('#fullscreen-btn');
    fireEvent.click(maximizeBtn);

    integrationTestHelper.takeStoreAndLastActionSnapshot('entered fullscreen');
    // PF Modal renders via a portal into document.body, not the container
    expect(document.body.querySelectorAll('.editor-modal').length).toBeGreaterThan(0);
  });
});
