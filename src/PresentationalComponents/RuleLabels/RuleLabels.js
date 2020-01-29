import './_RuleLabels.scss';

import { Label, Tooltip, TooltipPosition } from '@patternfly/react-core';

import { BellSlashIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const RuleLabels = ({ intl, rule }) => <React.Fragment >
    {rule.tags.search('incident') !== -1 && <Tooltip content={intl.formatMessage(messages.incidentTooltip)} position={TooltipPosition.right}>
        <Label isCompact className='incidentLabel'>{intl.formatMessage(messages.incident)}</Label>
    </Tooltip>}
    {!rule.reports_shown && <Tooltip content={intl.formatMessage(messages.ruleIsDisabledTooltip)} position={TooltipPosition.right}>
        <Label isCompact className='disabledLabel'><BellSlashIcon size='sm' />&nbsp;{intl.formatMessage(messages.disabled)}</Label>
    </Tooltip>}
</React.Fragment>;

RuleLabels.propTypes = {
    intl: PropTypes.any,
    rule: PropTypes.object
};

export default injectIntl(RuleLabels);
