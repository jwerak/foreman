// eslint-disable-next-line import/no-unresolved, import/extensions
import 'core-js/shim';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'regenerator-runtime/runtime';

window.matchMedia = window.matchMedia || (query => ({
  matches: false,
  media: query,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// https://github.com/facebook/jest/issues/6121
// eslint-disable-next-line no-console
const { error } = console;

const SUPPRESSED_WARNINGS = [
  'Support for defaultProps will be removed from function components',
  'Support for defaultProps will be removed from memo components',
  'inside a test was not wrapped in act',
  'not configured to support act',
  'uses the legacy childContextTypes API',
  'uses the legacy contextTypes API',
  'overlapping act() calls',
  'after test environment was torn down',
];

// eslint-disable-next-line no-console
console.error = (message, ...args) => {
  const text = typeof message === 'string' ? message : String(message);
  if (SUPPRESSED_WARNINGS.some(w => text.includes(w))) return;
  error.apply(console, [message, ...args]); // keep default behaviour
  const err = message instanceof Error ? message : new Error(message);
  throw err;
};
