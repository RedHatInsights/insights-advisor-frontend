import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import { Alert } from '@patternfly/react-core';
import messages from '../../Messages';
import { AccountStatContext } from '../../ZeroStateWrapper';

const EdgeSystemsBanner = () => {
  const intl = useIntl();
  const { hasEdgeDevices } = useContext(AccountStatContext);

  return !hasEdgeDevices ? null : (
    <Alert
      variant="info"
      isInline
      style={{ marginBottom: '1.5rem' }}
      title={intl.formatMessage(messages.edgeWarning)}
    />
  );
};

export default EdgeSystemsBanner;
