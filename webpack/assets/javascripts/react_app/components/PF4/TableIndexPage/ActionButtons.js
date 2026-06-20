import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';

/**
 * Generate a button or a dropdown of buttons
 * @param  {String} title The title of the button for the title and text inside the button
 * @param  {String} ouiaId If included, use this as the ouiaId
 * @param  {Object} action action to preform when the button is click can be href with data-method or Onclick
 * @return {Function} button component or splitbutton component
 */
export const ActionButtons = ({ buttons: originalButtons }) => {
  const buttons = [...originalButtons];
  const [isOpen, setIsOpen] = useState(false);
  if (!buttons.length) return null;
  const firstButton = buttons.shift();
  return (
    <>
      <Button
        ouiaId={firstButton.ouiaId || 'action-buttons-button'}
        component={firstButton.action?.href ? 'a' : undefined}
        {...firstButton.action}
      >
        {firstButton.title}
      </Button>
      {buttons.length > 0 && (
        <Dropdown
          ouiaId="action-buttons-dropdown"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={() => setIsOpen(false)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              variant="plain"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
              aria-label="toggle action dropdown"
            >
              <EllipsisVIcon />
            </MenuToggle>
          )}
        >
          <DropdownList>
            {buttons.map(button => {
              const { href, ...restAction } = button.action || {};
              return (
                <DropdownItem
                  ouiaId={`${button.title}-dropdown-item`}
                  key={button.title}
                  title={button.title}
                  to={href}
                  {...restAction}
                >
                  {button.icon} {button.title}
                </DropdownItem>
              );
            })}
          </DropdownList>
        </Dropdown>
      )}
    </>
  );
};

ActionButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      action: PropTypes.object,
      title: PropTypes.string,
      icon: PropTypes.node,
    })
  ),
};

ActionButtons.defaultProps = {
  buttons: [],
};
