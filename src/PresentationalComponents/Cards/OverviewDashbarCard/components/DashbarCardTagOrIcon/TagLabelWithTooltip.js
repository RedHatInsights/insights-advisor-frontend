import React from 'react';
import { useIntl } from 'react-intl';
import propTypes from 'prop-types';

import { Tooltip } from '@patternfly/react-core';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { strong } from '../../../../../Utilities/intlHelper';
import messages from '../../../../../Messages';
import { TOTAL_RISK_LABEL_LOWER } from '../../../../../AppConstants';

export const TagLabelWithTooltip = ({ typeOfTag }) => {
  const { formatMessage } = useIntl();

  return (
    <Tooltip
      key={`${typeOfTag}-tooltip`}
      position="bottom"
      content={formatMessage(messages.rulesDetailsTotalRiskBody, {
        risk:
          TOTAL_RISK_LABEL_LOWER[typeOfTag] ||
          messages.undefined.defaultMessage,
        strong: (str) => strong(str),
      })}
    >
      <InsightsLabel value={typeOfTag} isCompact />
    </Tooltip>
  );
};

TagLabelWithTooltip.propTypes = {
  typeOfTag: propTypes.number,
};
