import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import React from 'react';

const MessageState = ({
  className,
  children,
  icon = CubesIcon,
  iconStyle,
  text,
  title = '',
  variant = EmptyStateVariant.full,
}) => (
  <EmptyState
    headingLevel="h5"
    titleText={<>{title}</>}
    className={className}
    variant={variant}
    icon={icon}
    style={{
      '--pf-v6-c-empty-state__icon--Color': iconStyle?.color || 'inherit',
    }}
  >
    <EmptyStateBody
      style={{
        marginBottom: '16px',
        overflowWrap: 'anywhere',
      }}
    >
      {text}
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>{children}</EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

MessageState.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  icon: PropTypes.any,
  iconStyle: PropTypes.any,
  text: PropTypes.any,
  title: PropTypes.string,
  variant: PropTypes.any,
};

export default MessageState;
