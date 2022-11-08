import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../Messages';
import SystemAdvisor from '../SmartComponents/SystemAdvisor/SystemAdvisor';

const SystemDetail = ({ customItnl, intlProps, store, ...props }) => {
  const Wrapper = customItnl ? IntlProvider : Fragment;
  const ReduxProvider = store ? Provider : Fragment;

  return (
    <Wrapper
      {...(customItnl && {
        locale: navigator.language.slice(0, 2),
        messages,
        ...intlProps,
      })}
    >
      <ReduxProvider store={store}>
        <SystemAdvisor {...props} />
      </ReduxProvider>
    </Wrapper>
  );
};

SystemDetail.propTypes = {
  customItnl: PropTypes.bool,
  intlProps: PropTypes.shape({
    locale: PropTypes.string,
    messages: PropTypes.array,
  }),
  store: PropTypes.object,
};

export default SystemDetail;
