import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Divider,
  Icon,
} from '@patternfly/react-core';
import { UserAltIcon } from '@patternfly/react-icons';

import { userPropType } from '../../LayoutHelper';
import { translate as __ } from '../../../../common/I18n';

const handleMethodLink = async (url, method) => {
  const csrfToken =
    document.querySelector('meta[name="csrf-token"]')?.content || '';

  await fetch(url, {
    method: method.toUpperCase(),
    headers: {
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
  });

  window.location = '/';
};

const UserDropdowns = ({ user, notificationUrl, instanceTitle, ...props }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const onDropdownSelect = () => {
    setUserDropdownOpen(userDropdownOpen);
  };
  const userInfo = user.current_user;

  const userDropdownItems = user.user_dropdown[0].children.map((item, i) => {
    if (item.type === 'divider') {
      return <Divider component="li" key={i} />;
    }

    const method = item.html_options?.['data-method'];

    if (method) {
      return (
        <DropdownItem
          ouiaId={`user-dropdown-item-${i}`}
          key={i}
          className="user_menuitem"
          onClick={() => handleMethodLink(item.url, method)}
        >
          {__(item.name)}
        </DropdownItem>
      );
    }

    return (
      <DropdownItem
        ouiaId={`user-dropdown-item-${i}`}
        key={i}
        className="user_menuitem"
        to={item.url}
      >
        {__(item.name)}
      </DropdownItem>
    );
  });

  return (
    userInfo && (
      <Dropdown
        ouiaId="user-info-dropdown"
        popperProps={{ position: 'end' }}
        onSelect={onDropdownSelect}
        onOpenChange={setUserDropdownOpen}
        isOpen={userDropdownOpen}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            ouiaId="user-dropdown-toggle"
            variant="plain"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            isExpanded={userDropdownOpen}
          >
            <Icon className="user-icon">
              <UserAltIcon />
            </Icon>
            {userInfo.name}
          </MenuToggle>
        )}
        {...props}
      >
        <DropdownList>
          {userDropdownItems}
        </DropdownList>
      </Dropdown>
    )
  );
};

UserDropdowns.propTypes = {
  /** Additional element css classes */
  className: PropTypes.string,
  /** User Data Array */
  user: userPropType,
  /** notification URL */
  notificationUrl: PropTypes.string,
  instanceTitle: PropTypes.string,
};
UserDropdowns.defaultProps = {
  className: '',
  user: {},
  notificationUrl: '',
  instanceTitle: '',
};
export default UserDropdowns;
