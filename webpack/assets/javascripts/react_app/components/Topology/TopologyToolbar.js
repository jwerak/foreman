import React, { useState } from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  Select,
  SelectOption,
  MenuToggle,
  ToggleGroup,
  ToggleGroupItem,
  Switch,
  Label,
} from '@patternfly/react-core';
import { translate as __ } from '../../common/I18n';
import { PERSPECTIVES, LAYOUTS } from './topologyConstants';

const TopologyToolbar = ({
  perspective,
  onPerspectiveChange,
  layout,
  onLayoutChange,
  showHosts,
  onShowHostsChange,
  errorsOnly,
  onErrorsOnlyChange,
  meta,
}) => {
  const [perspectiveOpen, setPerspectiveOpen] = useState(false);

  const onPerspectiveSelect = (_event, value) => {
    onPerspectiveChange(value);
    setPerspectiveOpen(false);
  };

  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup>
          <ToolbarItem>
            <Select
              isOpen={perspectiveOpen}
              selected={perspective}
              onSelect={onPerspectiveSelect}
              onOpenChange={setPerspectiveOpen}
              toggle={toggleRef => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setPerspectiveOpen(!perspectiveOpen)}
                  isExpanded={perspectiveOpen}
                >
                  {PERSPECTIVES[perspective].label}
                </MenuToggle>
              )}
            >
              {Object.values(PERSPECTIVES).map(p => (
                <SelectOption key={p.key} value={p.key}>
                  {p.label}
                </SelectOption>
              ))}
            </Select>
          </ToolbarItem>

          <ToolbarItem>
            <ToggleGroup aria-label={__('Layout selection')}>
              {Object.values(LAYOUTS).map(l => (
                <ToggleGroupItem
                  key={l}
                  text={l === 'Dagre' ? __('Hierarchical') : __('Force')}
                  buttonId={`layout-${l}`}
                  isSelected={layout === l}
                  onChange={() => onLayoutChange(l)}
                />
              ))}
            </ToggleGroup>
          </ToolbarItem>
        </ToolbarGroup>

        <ToolbarGroup align={{ default: 'alignEnd' }}>
          <ToolbarItem>
            <Switch
              id="show-hosts-toggle"
              label={__('Show Hosts')}
              isChecked={showHosts}
              onChange={(_event, checked) => onShowHostsChange(checked)}
            />
          </ToolbarItem>

          <ToolbarItem>
            <Label
              color={errorsOnly ? 'red' : 'grey'}
              onClick={() => onErrorsOnlyChange(!errorsOnly)}
              style={{ cursor: 'pointer' }}
            >
              {__('Show Errors Only')}
            </Label>
          </ToolbarItem>

          {meta && (
            <ToolbarItem>
              <span className="pf-v6-u-color-200 pf-v6-u-font-size-sm">
                {meta.total_hosts != null &&
                  `${meta.total_hosts} ${__('hosts')}`}
              </span>
            </ToolbarItem>
          )}
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TopologyToolbar;
