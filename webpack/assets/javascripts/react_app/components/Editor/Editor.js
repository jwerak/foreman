import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';

import { noop } from '../../common/helpers';
import DiffView from '../DiffView/DiffView';
import EditorView from './components/EditorView';
import EditorNavbar from './components/EditorNavbar';
import EditorModal from './components/EditorModal';
import {
  EDITOR_THEMES,
  EDITOR_KEYBINDINGS,
  EDITOR_MODES,
} from './EditorConstants';
import {
  navFilteredHostsSelector,
  navHostsSelector,
  selectChosenHost,
  selectChosenView,
  selectDiffType,
  selectEditorName,
  selectErrorText,
  selectIsFetchingHosts,
  selectIsLoading,
  selectIsMasked,
  selectIsMaximized,
  selectIsReadOnly,
  selectIsRendering,
  selectIsSearchingHosts,
  selectIsSelectOpen,
  selectKeyBind,
  selectMode,
  selectPreviewResult,
  selectRenderedEditorValue,
  selectSearchQuery,
  selectShowError,
  selectTheme,
  selectAutocompletion,
  selectLiveAutocompletion,
  selectValue,
  selectTemplateKindId,
} from './EditorSelectors';
import * as editorActions from './EditorActions';
import './editor.scss';

const Editor = ({ data }) => {
  const dispatch = useDispatch();

  // Redux state
  const diffViewType = useSelector(selectDiffType);
  const editorName = useSelector(selectEditorName);
  const errorText = useSelector(selectErrorText);
  const filteredHosts = useSelector(navFilteredHostsSelector);
  const hosts = useSelector(navHostsSelector);
  const isFetchingHosts = useSelector(selectIsFetchingHosts);
  const isLoading = useSelector(selectIsLoading);
  const isMasked = useSelector(selectIsMasked);
  const isMaximized = useSelector(selectIsMaximized);
  const isRendering = useSelector(selectIsRendering);
  const isSearchingHosts = useSelector(selectIsSearchingHosts);
  const isSelectOpen = useSelector(selectIsSelectOpen);
  const keyBinding = useSelector(selectKeyBind);
  const mode = useSelector(selectMode);
  const previewResult = useSelector(selectPreviewResult);
  const renderedEditorValue = useSelector(selectRenderedEditorValue);
  const readOnly = useSelector(selectIsReadOnly);
  const searchQuery = useSelector(selectSearchQuery);
  const selectedHost = useSelector(selectChosenHost);
  const selectedView = useSelector(selectChosenView);
  const showError = useSelector(selectShowError);
  const theme = useSelector(selectTheme);
  const autocompletion = useSelector(selectAutocompletion);
  const liveAutocompletion = useSelector(selectLiveAutocompletion);
  const value = useSelector(selectValue);
  const templateKindId = useSelector(selectTemplateKindId);

  // Redux actions
  const changeDiffViewType = viewType => dispatch(editorActions.changeDiffViewType(viewType));
  const changeEditorValue = val => dispatch(editorActions.changeEditorValue(val));
  const changeSetting = setting => dispatch(editorActions.changeSetting(setting));
  const changeTab = view => dispatch(editorActions.changeTab(view));
  const dismissErrorToast = () => dispatch(editorActions.dismissErrorToast());
  const fetchAndPreview = (renderPath, kindId, skip) => dispatch(editorActions.fetchAndPreview(renderPath, kindId, skip));
  const importFile = e => dispatch(editorActions.importFile(e));
  const initializeEditor = initData => dispatch(editorActions.initializeEditor(initData));
  const onHostSearch = e => dispatch(editorActions.onHostSearch(e));
  const onHostSelectToggle = () => dispatch(editorActions.onHostSelectToggle());
  const onSearchClear = () => dispatch(editorActions.onSearchClear());
  const previewTemplate = params => dispatch(editorActions.previewTemplate(params));
  const revertChanges = tmpl => dispatch(editorActions.revertChanges(tmpl));
  const toggleModal = () => dispatch(editorActions.toggleModal());
  const toggleRenderView = rendering => dispatch(editorActions.toggleRenderView(rendering));

  const {
    name,
    isSafemodeEnabled,
    renderPath,
    safemodeRenderPath,
    showImport,
    showPreview,
    showHostSelector,
    template,
    title,
  } = data;

  useEffect(() => {
    const {
      hosts: dataHosts,
      templateClass,
      locked,
      template: dataTemplate,
      type,
      dslCache,
    } = data;

    const initializeData = {
      hosts: dataHosts,
      isMasked,
      templateClass,
      isRendering,
      locked,
      readOnly,
      previewResult,
      selectedView,
      showError,
      template: dataTemplate,
      type,
      dslCache,
    };
    initializeEditor(initializeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editorViewProps = {
    value: isRendering ? previewResult : value,
    mode: isRendering ? 'Text' : mode,
    theme,
    autocompletion,
    liveAutocompletion,
    keyBinding,
    onChange: isRendering ? noop : changeEditorValue,
    readOnly: readOnly || isRendering,
    isMasked,
  };
  const editorNameTab = {
    input: `${editorName}Code`,
    preview: `${editorName}Preview`,
  };

  return (
    <div id="editor-container">
      <Alert
        id="preview_error_toast"
        ouiaId="preview_error_toast"
        variant="danger"
        className={showError ? '' : 'hidden'}
        actionClose={
          <AlertActionCloseButton
            className="close"
            onClose={() => dismissErrorToast()}
          />
        }
        title={errorText}
      />
      <EditorNavbar
        changeDiffViewType={changeDiffViewType}
        changeTab={changeTab}
        changeSetting={changeSetting}
        modes={EDITOR_MODES}
        themes={EDITOR_THEMES}
        keyBindings={EDITOR_KEYBINDINGS}
        mode={isRendering ? 'Text' : mode}
        theme={theme}
        keyBinding={keyBinding}
        autocompletion={autocompletion}
        liveAutocompletion={liveAutocompletion}
        value={value}
        templateKindId={templateKindId}
        renderedEditorValue={renderedEditorValue}
        diffViewType={diffViewType}
        template={template}
        selectedView={selectedView}
        isDiff={template ? value !== template : false}
        isRendering={isRendering}
        isLoading={isLoading}
        isFetchingHosts={isFetchingHosts}
        isSearchingHosts={isSearchingHosts}
        importFile={importFile}
        showImport={showImport}
        showPreview={showPreview}
        showHostSelector={showHostSelector}
        revertChanges={revertChanges}
        previewTemplate={previewTemplate}
        hosts={hosts}
        filteredHosts={filteredHosts}
        selectedHost={selectedHost}
        isSafemodeEnabled={isSafemodeEnabled}
        renderPath={renderPath}
        safemodeRenderPath={safemodeRenderPath}
        toggleRenderView={toggleRenderView}
        toggleModal={toggleModal}
        previewResult={previewResult}
        searchQuery={searchQuery}
        onHostSelectToggle={onHostSelectToggle}
        onHostSearch={onHostSearch}
        onSearchClear={onSearchClear}
        isSelectOpen={isSelectOpen}
        showError={showError}
        fetchAndPreview={fetchAndPreview}
      />
      <EditorView
        {...editorViewProps}
        key="editorPreview"
        name={editorNameTab.preview}
        isSelected={selectedView === 'preview'}
        className="ace_editor_form ace_preview"
      />
      <EditorView
        {...editorViewProps}
        key="editorCode"
        name={editorNameTab.input}
        isSelected={selectedView === 'input'}
        className="ace_editor_form ace_input"
      />
      <div
        id="diff-table"
        className={selectedView === 'diff' ? '' : 'hidden'}
      >
        <DiffView
          oldText={template || ''}
          newText={value}
          viewType={diffViewType}
        />
      </div>
      <EditorModal
        key="editorModal"
        changeEditorValue={changeEditorValue}
        changeDiffViewType={changeDiffViewType}
        name={editorName}
        title={title}
        toggleModal={toggleModal}
        diffViewType={diffViewType}
        mode={mode}
        theme={theme}
        autocompletion={autocompletion}
        liveAutocompletion={liveAutocompletion}
        keyBinding={keyBinding}
        readOnly={readOnly}
        isMaximized={isMaximized}
        template={template || ''}
        editorValue={value}
        previewValue={previewResult}
        selectedView={selectedView}
        isMasked={isMasked}
        isRendering={isRendering}
      />
      {!readOnly && (
        <textarea className="hidden" name={name} value={value} readOnly />
      )}
    </div>
  );
};

Editor.propTypes = {
  data: PropTypes.shape({
    showImport: PropTypes.bool,
    showPreview: PropTypes.bool,
    showHostSelector: PropTypes.bool,
    template: PropTypes.string,
    templateClass: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    isSafemodeEnabled: PropTypes.bool,
    renderPath: PropTypes.string,
    safemodeRenderPath: PropTypes.string,
    hosts: PropTypes.array,
    locked: PropTypes.bool,
    type: PropTypes.string,
    dslCache: PropTypes.string,
  }).isRequired,
};

export default Editor;
