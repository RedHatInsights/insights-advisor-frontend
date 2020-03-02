import './_SystemInventory.scss';

import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { Split, SplitItem } from '@patternfly/react-core/dist/js/layouts/Split/index';
import { Stack, StackItem } from '@patternfly/react-core/dist/js/layouts/Stack/index';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const SystemInventory = ({ staleHosts, intl }) => {
    console.error(staleHosts);
    const iconMessage = (icon, message, link) => <Split className='flexAlignOverride' gutter='sm'>
        <SplitItem> {icon} </SplitItem>
        <SplitItem> {link ? <Link className='pf-c-button pf-m-link' to={link}>{message}</Link> : message} </SplitItem>
    </Split>;

    return <Stack className='stackOverride' aria-label='System inventory' widget-type='InsightsSystemInventoryChart'>
        {staleHosts &&  staleHosts.warn_count > 0  || staleHosts.hide_count > 0 ? <React.Fragment>
            <StackItem >
                {iconMessage(<ExclamationTriangleIcon color='var(--pf-global--warning-color--100)' />,
                    intl.formatMessage(messages.overviewSystemInventoryStale, { systems: staleHosts.warn_count }),
                    '/inventory?staleness=stale_warning')}
            </StackItem>
            <StackItem>
                {iconMessage(<ExclamationCircleIcon color='var(--pf-global--danger-color--100)' />,
                    intl.formatMessage(messages.overviewSystemInventoryRemoved, { systems: staleHosts.hide_count }),
                    '/inventory?staleness=stale')}
            </StackItem>
        </React.Fragment>
            : <StackItem>
                {iconMessage(<CheckCircleIcon color='var(--pf-global--success-color--100)' />,
                    intl.formatMessage(messages.overviewSystemInventoryOK))}
            </StackItem>}
    </Stack>;
};

SystemInventory.propTypes = {
    staleHosts: PropTypes.object,
    intl: PropTypes.any
};

export default injectIntl(SystemInventory);
