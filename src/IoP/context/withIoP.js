import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { EnvironmentContext } from '../../App';
import messages from '../../../locales/translations.json';
import { initStore } from '../../Store';
import { IOP_ENVIRONMENT_CONTEXT } from '../constants';

/**
 * Higher-Order Component that wraps a component with IoP environment context.
 * Provides the following context layers:
 * 1. IntlProvider - Internationalization with English locale
 * 2. EnvironmentContext - IoP-specific environment configuration
 * 3. Redux Provider - Application state management
 *
 * This HOC ensures that components have access to all necessary context
 * and configuration for the IoP (Insights on Premise) environment.
 *
 * @function
 * @param {React.ComponentType} Component - The component to wrap with IoP context
 * @returns {React.ComponentType} Wrapped component with IoP context providers
 *
 * @example
 * // Wrap a component with IoP context
 * const MyIoPComponent = withIoP(MyComponent);
 *
 * // The wrapped component will have access to:
 * // - useIntl() hook for translations
 * // - useContext(EnvironmentContext) for IoP config
 * // - useSelector/useDispatch for Redux
 *
 * @example
 * // Usage in IoP index.js
 * export const IoP = {
 *   ListIop: withIoP(ListIop),
 *   IopRecommendationDetails: withIoP(IopRecommendationDetails),
 * };
 */
export const withIoP = (Component) => {
  const Wrapped = (props) => (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
        <Provider store={initStore()}>
          <Component {...props} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );

  Wrapped.displayName = `withIoP(${Component.displayName || Component.name})`;
  return Wrapped;
};
