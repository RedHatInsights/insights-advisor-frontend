import { Label } from '@patternfly/react-core';
import React from 'react';
import PropTypes from 'prop-types';

const LabelIcon = ({ icon, text }) => (
  <Label icon={icon} variant="outline" color="blue" isCompact>
    {text}
  </Label>
);

LabelIcon.propTypes = {
  icon: PropTypes.object,
  text: PropTypes.bool,
};

export default LabelIcon;
