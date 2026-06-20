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

const UserDropdowns = ({ user, notificationUrl, instanceTitle, ...props }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const onDropdownSelect = () => {
    setUserDropdownOpen(userDropdownOpen);
  };
  const userInfo = user.current_user;

  const userDropdownItems = user.user_dropdown[0].children.map((item, i) =>
    item.type === 'divider' ? (
      <Divider component="li" key={i} />
    ) : (
      <DropdownItem
        ouiaId={`user-dropdown-item-${i}`}
        key={i}
        className="user_menuitem"
        href={item.url}
        {...item.html_options}
      >
        {__(item.name)}
      </DropdownItem>
    )
  );

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
