import React from 'react';
import { EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { CubesIcon } from '@patternfly/react-icons';

const MessageState = ({ children, icon, text, title })  => (
    <EmptyState variant={ EmptyStateVariant.full }>
        <EmptyStateIcon icon={ icon } />
        <Title headingLevel="h5" size="lg">
            { title }
        </Title>
        <EmptyStateBody>
            { text }
        </EmptyStateBody>
        { children }
    </EmptyState>
);

MessageState.propTypes = {
    children: PropTypes.any,
    icon: PropTypes.any,
    text: PropTypes.string,
    title: PropTypes.string
};

MessageState.defaultProps = {
    icon: CubesIcon,
    title: '',
    text: ''
};

export default MessageState;
