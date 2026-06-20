import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'foreman-theme-preference';
const DARK_CLASS = 'pf-v6-theme-dark';

const getSystemPreference = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const resolveTheme = (preference) =>
  preference === 'system' ? getSystemPreference() : preference;

const applyTheme = (effective) => {
  if (effective === 'dark') {
    document.documentElement.classList.add(DARK_CLASS);
  } else {
    document.documentElement.classList.remove(DARK_CLASS);
  }
};

const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const effectiveTheme = resolveTheme(theme);

  const setTheme = useCallback((newTheme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage unavailable
    }
    setThemeState(newTheme);
  }, []);

  useEffect(() => {
    applyTheme(effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    if (theme !== 'system') return undefined;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setThemeState('system');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [theme]);

  return { theme, effectiveTheme, setTheme };
};

export default useTheme;
