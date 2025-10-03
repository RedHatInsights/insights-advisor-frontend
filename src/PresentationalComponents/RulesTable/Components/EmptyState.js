import React from 'react'; // FIXED: Removed the duplicate 'from 'react'
import propTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { FormattedMessage } from 'react-intl';
import MessageState from '../../MessageState/MessageState';
import { messageMapping } from '../helpers';

const EmptyState = ({ filters, toggleRulesDisabled }) => {
  const message =
    messageMapping()[filters.rule_status] || messageMapping().default;

  return (
    <MessageState
      icon={CheckCircleIcon}
      iconStyle={{ color: '#3e8635' }}
      title={message.title}
      text={message.body}
    >
      {filters.rule_status === 'enabled' && (
        <Button
          variant="link"
          style={{ paddingTop: 24 }}
          onClick={() => toggleRulesDisabled('rhdisabled')}
        >
          <FormattedMessage id="rulestable.norulehits.adddisabledbutton" />
        </Button>
      )}
    </MessageState>
  );
};

EmptyState.propTypes = {
  filters: propTypes.object,
  toggleRulesDisabled: propTypes.func,
};

export default EmptyState;
