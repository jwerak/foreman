import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CogIcon } from '@patternfly/react-icons';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  MenuToggle,
  Popover,
  PopoverPosition,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';

const SettingsDropdown = ({ id, label, isDisabled, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      id={id}
      isOpen={isOpen}
      onOpenChange={open => setIsOpen(open)}
      onSelect={() => setIsOpen(false)}
      toggle={toggleRef => (
        <MenuToggle
          ref={toggleRef}
          isDisabled={isDisabled}
          onClick={() => setIsOpen(prev => !prev)}
          isExpanded={isOpen}
        >
          {label}
        </MenuToggle>
      )}
    >
      <DropdownList>
        {items.map((item, i) => (
          <DropdownItem key={i} onClick={() => onSelect(item)}>
            {item}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

SettingsDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  items: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

SettingsDropdown.defaultProps = {
  isDisabled: false,
};

const EditorSettings = ({
  selectedView,
  changeSetting,
  keyBinding,
  keyBindings,
  mode,
  modes,
  theme,
  themes,
  autocompletion,
  liveAutocompletion,
}) => (
  <>
    <Popover
      id="cog-popover"
      position={PopoverPosition.bottom}
      enableFlip={false}
      hasAutoWidth
      headerContent={__('Settings')}
      bodyContent={
        <div>
          <div className="cog-popover-dropdown">
            <div className="cog-popover-dropdown-title">{__('Syntax')}</div>
            <SettingsDropdown
              id="mode-dropdown"
              label={mode}
              isDisabled={selectedView === 'preview'}
              items={modes}
              onSelect={aceMode => changeSetting({ mode: aceMode })}
            />
          </div>
          <div className="cog-popover-dropdown">
            <div className="cog-popover-dropdown-title">{__('Keybind')}</div>
            <SettingsDropdown
              id="keybindings-dropdown"
              label={keyBinding}
              isDisabled={selectedView === 'preview'}
              items={keyBindings}
              onSelect={keyBind => changeSetting({ keyBinding: keyBind })}
            />
          </div>
          <div className="cog-popover-dropdown">
            <div className="cog-popover-dropdown-title">{__('Theme')}</div>
            <SettingsDropdown
              id="themes-dropdown"
              label={theme}
              items={themes}
              onSelect={themeKey => changeSetting({ theme: themeKey })}
            />
          </div>
          <div className="cog-popover-dropdown">
            <div className="cog-popover-dropdown-title">
              {__('Autocompletion')}
            </div>
            <div className="dropdown btn-group">
              <input
                id="autocompletion-checkbox"
                name="autocompletion"
                type="checkbox"
                checked={autocompletion}
                onChange={e =>
                  changeSetting({ autocompletion: !autocompletion })
                }
              />
            </div>
          </div>
          <div className="cog-popover-dropdown">
            <div className="cog-popover-dropdown-title">
              {__('Live Autocompletion')}
            </div>
            <div className="dropdown btn-group">
              <input
                id="live-autocompletion-checkbox"
                name="liveAutocompletion"
                type="checkbox"
                checked={liveAutocompletion}
                disabled={!autocompletion}
                onChange={e =>
                  changeSetting({ liveAutocompletion: !liveAutocompletion })
                }
              />
            </div>
          </div>
        </div>
      }
      triggerRef={() => document.getElementById('cog-btn')}
    />
    <Tooltip content={__('Settings')} position={TooltipPosition.top}>
      <Button className="editor-button" id="cog-btn" variant="link">
        <Icon size="md">
          <CogIcon />
        </Icon>
      </Button>
    </Tooltip>
  </>
);

EditorSettings.propTypes = {
  changeSetting: PropTypes.func.isRequired,
  keyBinding: PropTypes.string.isRequired,
  keyBindings: PropTypes.array.isRequired,
  selectedView: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  modes: PropTypes.array.isRequired,
  theme: PropTypes.string.isRequired,
  themes: PropTypes.array.isRequired,
  autocompletion: PropTypes.bool.isRequired,
  liveAutocompletion: PropTypes.bool.isRequired,
};

export default EditorSettings;
