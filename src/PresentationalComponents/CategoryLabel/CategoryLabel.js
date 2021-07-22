import AutomationIcon from '@patternfly/react-icons/dist/esm/icons/automation-icon';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import { Label } from '@patternfly/react-core/dist/js/components/Label/index';
import { LabelGroup } from '@patternfly/react-core/dist/js/components/LabelGroup/LabelGroup';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import PortIcon from '@patternfly/react-icons/dist/esm/icons/port-icon';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const CategoryLabel = ({ labelList }) => {
  const intl = useIntl();
  const sortedFrequency = (arr) =>
    Object.entries(
      arr.reduce((acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc), {})
    ).sort((a, b) => b[1] - a[1]);
  const sortedFrequencyList = sortedFrequency(
    labelList.map((label) => label.id)
  );

  const label = (icon, text) => (
    <Label icon={icon} variant="outline" color="blue">
      {text}
    </Label>
  );
  const labels = (id) => {
    if (id === 1) {
      return label(
        <AutomationIcon />,
        intl.formatMessage(messages.availability)
      );
    }
    if (id === 2) {
      return label(<LockIcon />, intl.formatMessage(messages.security));
    }
    if (id === 3) {
      return label(<CubeIcon />, intl.formatMessage(messages.stability));
    }
    if (id === 4) {
      return label(<PortIcon />, intl.formatMessage(messages.performance));
    }
  };
  return (
    <LabelGroup numLabels={1}>
      {sortedFrequencyList.map((id) => labels(Number(id[0])))}
    </LabelGroup>
  );
};

CategoryLabel.propTypes = {
  labelList: PropTypes.array,
};

export default CategoryLabel;
