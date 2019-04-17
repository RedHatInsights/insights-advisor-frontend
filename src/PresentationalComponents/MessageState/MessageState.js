import React from 'react';
import { EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { CubesIcon } from '@patternfly/react-icons';

const MessageState = ({ children, icon, iconStyle, text, title, variant })  => (
    <EmptyState variant={ variant }>
        <EmptyStateIcon style={ iconStyle } icon={ icon } size="lg" />
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
    iconStyle: PropTypes.any,
    text: PropTypes.string,
    title: PropTypes.string,
    variant: PropTypes.any
};

MessageState.defaultProps = {
    icon: CubesIcon,
    title: '',
    text: '',
    variant: EmptyStateVariant.full
};

export default MessageState;
