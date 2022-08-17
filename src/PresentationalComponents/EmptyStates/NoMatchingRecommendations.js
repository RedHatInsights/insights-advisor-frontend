import React from 'react';
import { Bullseye } from '@patternfly/react-core';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';

export const NoMatchingRecommendations = () => (
  <Bullseye>
    <MessageState
      title="No matching recommendations found"
      text={`To continue, edit your filter settings and search again.`}
    />
  </Bullseye>
);
