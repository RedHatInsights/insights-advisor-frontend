import React from 'react';
import propTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { useIntl } from 'react-intl';
import MessageState from '../../MessageState/MessageState';
import { messageMapping } from '../newrulestablehelpers';
import messages from '../../../Messages';

const NewEmptyState = ({ filters, toggleRulesDisabled }) => {
  const intl = useIntl();
  const message =
    messageMapping(intl)[filters.rule_status] || messageMapping(intl).default;

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
          {intl.formatMessage(messages.rulesTableNoRuleHitsAddDisabledButton)}
        </Button>
      )}
    </MessageState>
  );
};

NewEmptyState.propTypes = {
  filters: propTypes.object,
  toggleRulesDisabled: propTypes.func,
};

export default NewEmptyState;
