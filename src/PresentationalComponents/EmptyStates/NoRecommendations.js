import React from 'react';
import { CheckIcon } from '@patternfly/react-icons';
import { Bullseye } from '@patternfly/react-core';
import MessageState from '../MessageState/MessageState';

export const NoRecommendations = () => (
  <Bullseye>
    <MessageState
      icon={CheckIcon}
      iconClass="ins-c-insights__check"
      title="No recommendations"
      text={`No known recommendations affect this system`}
    />
  </Bullseye>
);
