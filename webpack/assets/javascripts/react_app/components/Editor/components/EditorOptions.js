/* eslint-disable no-alert */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { ArrowsAltIcon, UndoIcon, UploadIcon } from '@patternfly/react-icons';

import { Button, Tooltip, TooltipPosition, Icon } from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';
import DiffToggle from '../../DiffView/DiffToggle';
import EditorSettings from './EditorSettings';

const EditorOptions = ({
  changeDiffViewType,
  changeSetting,
  changeTab,
  diffViewType,
  importFile,
  isDiff,
  keyBinding,
  keyBindings,
  mode,
  modes,
  revertChanges,
  selectedView,
  showImport,
  template,
  theme,
  themes,
  autocompletion,
  liveAutocompletion,
  toggleModal,
}) => {
  const fileInputRef = useRef(null);

  const fileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div id="editor-dropdowns">
      {selectedView === 'diff' && (
        <DiffToggle
          stateView={diffViewType}
          changeState={viewType => changeDiffViewType(viewType)}
        />
      )}

      <h4 id="divider">|</h4>
      {isDiff ? ( // fixing tooltip showing sometimes for disabled icon
        <Tooltip
          content={__('Revert Local Changes')}
          position={TooltipPosition.top}
        >
          <Button icon={<Icon size="md">
              <UndoIcon />
            </Icon>}
            className="editor-button"
            id="undo-btn"
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you would like to revert all changes?'
                )
              ) {
                revertChanges(template);
                if (selectedView !== 'input') changeTab('input');
              }
            }}
            variant="link"
          >
            
          </Button>
        </Tooltip>
      ) : (
        <Button icon={<Icon size="md">
            <UndoIcon />
          </Icon>}
          isDisabled
          className="editor-button"
          id="undo-btn"
          variant="link"
        >
          
        </Button>
      )}
      {showImport && (
        <Tooltip content={__('Import File')} position={TooltipPosition.top}>
          <Button icon={<Icon size="md">
              <UploadIcon />
            </Icon>}
            isDisabled={selectedView !== 'input'}
            className="import-button"
            id="import-btn"
            variant="link"
            onClick={fileDialog}
          >
            
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              onChange={importFile}
            />
          </Button>
        </Tooltip>
      )}
      <EditorSettings
        changeSetting={changeSetting}
        selectedView={selectedView}
        modes={modes}
        mode={mode}
        keyBindings={keyBindings}
        keyBinding={keyBinding}
        theme={theme}
        themes={themes}
        autocompletion={autocompletion}
        liveAutocompletion={liveAutocompletion}
      />
      <Tooltip content={__('Maximize')} position={TooltipPosition.top}>
        <Button icon={<Icon size="md">
            <ArrowsAltIcon />
          </Icon>}
          className="editor-button"
          id="fullscreen-btn"
          onClick={toggleModal}
          variant="link"
        >
          
        </Button>
      </Tooltip>
    </div>
  );
};

EditorOptions.propTypes = {
  changeDiffViewType: PropTypes.func.isRequired,
  changeSetting: PropTypes.func.isRequired,
  changeTab: PropTypes.func.isRequired,
  diffViewType: PropTypes.string.isRequired,
  importFile: PropTypes.func.isRequired,
  isDiff: PropTypes.bool.isRequired,
  keyBinding: PropTypes.string.isRequired,
  keyBindings: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  modes: PropTypes.array.isRequired,
  revertChanges: PropTypes.func.isRequired,
  selectedView: PropTypes.string.isRequired,
  showImport: PropTypes.bool.isRequired,
  template: PropTypes.string,
  theme: PropTypes.string.isRequired,
  themes: PropTypes.array.isRequired,
  autocompletion: PropTypes.bool.isRequired,
  liveAutocompletion: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

EditorOptions.defaultProps = {
  template: '',
};

export default EditorOptions;
