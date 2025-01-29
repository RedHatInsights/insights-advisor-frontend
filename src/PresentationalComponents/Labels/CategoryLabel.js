import AutomationIcon from '@patternfly/react-icons/dist/esm/icons/automation-icon';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import PortIcon from '@patternfly/react-icons/dist/esm/icons/port-icon';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import LabelIcon from './LabelIcon';
import { LabelGroup } from '@patternfly/react-core';

const CategoryLabel = ({ labelList }) => {
  const intl = useIntl();
  const sortedFrequency = (arr) =>
    Object.entries(
      arr.reduce((acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc), {})
    ).sort((a, b) => b[1] - a[1]);
  const sortedFrequencyList = sortedFrequency(
    labelList.map((label) => label.id)
  );

  const labels = (id) =>
    [
      <LabelIcon
        key={'availability'}
        icon={<AutomationIcon />}
        text={intl.formatMessage(messages.availability)}
      />,
      <LabelIcon
        key={'security'}
        icon={<LockIcon />}
        text={intl.formatMessage(messages.security)}
      />,
      <LabelIcon
        key={'stability'}
        icon={<CubeIcon />}
        text={intl.formatMessage(messages.stability)}
      />,
      <LabelIcon
        key={'performance'}
        icon={<PortIcon />}
        text={intl.formatMessage(messages.performance)}
      />,
    ][id];

  return (
    <LabelGroup numLabels={1} isCompact>
      {sortedFrequencyList.map((id) => labels(Number(id[0] - 1)))}
    </LabelGroup>
  );
};

CategoryLabel.propTypes = {
  labelList: PropTypes.array,
};

export default CategoryLabel;
