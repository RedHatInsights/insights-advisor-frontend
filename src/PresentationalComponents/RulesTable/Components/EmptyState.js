import React from 'react';
import propTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { FormattedMessage } from 'react-intl';
import { t_global_icon_color_status_success_default } from '@patternfly/react-tokens';
import MessageState from '../../MessageState/MessageState';
import { messageMapping } from '../helpers';

const EmptyState = ({ filters, toggleRulesDisabled }) => {
  const ruleStatus = Array.isArray(filters.rule_status)
    ? filters.rule_status[0]
    : filters.rule_status;

  const message = messageMapping()[ruleStatus] || messageMapping().default;

  return (
    <MessageState
      icon={CheckCircleIcon}
      iconStyle={{ color: t_global_icon_color_status_success_default.value }}
      title={message.title}
      text={message.body}
    >
      {ruleStatus === 'enabled' && (
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
