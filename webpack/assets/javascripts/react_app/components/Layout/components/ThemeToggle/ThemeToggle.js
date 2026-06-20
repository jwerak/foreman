import React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { translate as __ } from '../../../../common/I18n';
import useTheme from './useTheme';

const ThemeToggle = () => {
  const { effectiveTheme, setTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  const label = isDark ? __('Switch to light mode') : __('Switch to dark mode');

  return (
    <Tooltip content={label}>
      <Button
        variant="plain"
        aria-label={label}
        onClick={toggle}
        icon={isDark ? <SunIcon /> : <MoonIcon />}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
