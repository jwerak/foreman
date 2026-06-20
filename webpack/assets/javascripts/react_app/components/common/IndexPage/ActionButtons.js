import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { translate as __ } from '../../../common/I18n';

const IndexPageActionButtons = ({
  creatable,
  canCreate,
  createUrl,
  createLabel,
  exportable,
  exportUrl,
  hasHelpPage,
  documentationUrl,
  customActions,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttons = [
    creatable &&
      canCreate && {
        title: createLabel || __('Create new'),
        action: { href: createUrl },
        isPrimary: true,
      },
    exportable && {
      title: __('Export'),
      action: { href: exportUrl },
    },
    hasHelpPage && {
      title: __('Documentation'),
      action: { href: documentationUrl, target: '_blank' },
      icon: <QuestionCircleIcon />,
    },
    ...customActions,
  ].filter(Boolean);

  if (!buttons.length) return null;

  const firstButton = buttons[0];
  const extraButtons = buttons.slice(1);

  return (
    <>
      <Button
        ouiaId="index-page-create-button"
        variant={firstButton.isPrimary ? 'primary' : 'secondary'}
        component={firstButton.action?.href ? 'a' : undefined}
        {...firstButton.action}
      >
        {firstButton.icon && (
          <span className="pf-v6-u-mr-sm">{firstButton.icon}</span>
        )}
        {firstButton.title}
      </Button>
      {extraButtons.length > 0 && (
        <Dropdown
          ouiaId="index-page-actions-dropdown"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={() => setIsOpen(false)}
          toggle={toggleRef => (
            <MenuToggle
              ref={toggleRef}
              variant="plain"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
              aria-label={__('toggle action dropdown')}
            >
              &#8942;
            </MenuToggle>
          )}
        >
          <DropdownList>
            {extraButtons.map(button => {
              const { href, ...restAction } = button.action || {};
              return (
                <DropdownItem
                  ouiaId={`index-page-${button.title}-dropdown-item`}
                  key={button.title}
                  to={href}
                  {...restAction}
                >
                  {button.icon && (
                    <span className="pf-v6-u-mr-sm">{button.icon}</span>
                  )}
                  {button.title}
                </DropdownItem>
              );
            })}
          </DropdownList>
        </Dropdown>
      )}
    </>
  );
};

IndexPageActionButtons.propTypes = {
  creatable: PropTypes.bool,
  canCreate: PropTypes.bool,
  createUrl: PropTypes.string,
  createLabel: PropTypes.string,
  exportable: PropTypes.bool,
  exportUrl: PropTypes.string,
  hasHelpPage: PropTypes.bool,
  documentationUrl: PropTypes.string,
  customActions: PropTypes.array,
};

IndexPageActionButtons.defaultProps = {
  creatable: true,
  canCreate: false,
  createUrl: '',
  createLabel: null,
  exportable: false,
  exportUrl: '',
  hasHelpPage: false,
  documentationUrl: '',
  customActions: [],
};

export default IndexPageActionButtons;
