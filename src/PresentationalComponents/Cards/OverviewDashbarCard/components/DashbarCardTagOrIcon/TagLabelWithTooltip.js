import React from 'react';
import propTypes from 'prop-types';

import { Tooltip } from '@patternfly/react-core';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { TOTAL_RISK_LABEL_LOWER } from '../../../../../AppConstants';

export const TagLabelWithTooltip = ({ typeOfTag }) => {
  return (
    <Tooltip
      key={`${typeOfTag}-tooltip`}
      position="bottom"
      content={
        <>
          The total risk of this remediation is
          <strong> {TOTAL_RISK_LABEL_LOWER[typeOfTag]}</strong>, based on the
          combination of likelihood and impact to remediate.
        </>
      }
    >
      <InsightsLabel value={typeOfTag} isCompact />
    </Tooltip>
  );
};

TagLabelWithTooltip.propTypes = {
  typeOfTag: propTypes.number,
};
