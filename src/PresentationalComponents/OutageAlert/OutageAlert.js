import React from 'react';
import { Alert } from '@patternfly/react-core';
import { useFeatureVariant } from '../../Utilities/Hooks';

const OutageAlert = () => {
  const {
    isEnabled,
    body = '',
    variant = 'danger',
    title = 'The Advisor service is currently unavailable. Please check back later.',
  } = useFeatureVariant('hbi.outage-banner');

  if (!isEnabled) {
    return null;
  }

  return (
    <Alert title={title} variant={variant} isInline>
      {body}
    </Alert>
  );
};

export default OutageAlert;
