import React, { useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { intl } from './I18n';
import { getDisplayName } from './helpers';

const i18nProviderWrapperFactory = (
  initialNow,
  timezone
) => WrappedComponent => {
  const wrappedName = getDisplayName(WrappedComponent);

  const I18nProviderWrapper = props => {
    const [i18nLoaded, setI18nLoaded] = useState(false);

    useEffect(() => {
      // eslint-disable-next-line promise/prefer-await-to-then
      intl.ready.then(() => {
        setI18nLoaded(true);
      });
    }, []);

    if (!i18nLoaded) {
      return <span />;
    }
    return (
      <IntlProvider
        locale={intl.locale}
        initialNow={initialNow}
        timeZone={timezone || intl.timezone}
      >
        <WrappedComponent {...props} />
      </IntlProvider>
    );
  };
  I18nProviderWrapper.displayName = `I18nProviderWrapper(${wrappedName})`;

  return I18nProviderWrapper;
};

export { i18nProviderWrapperFactory };
