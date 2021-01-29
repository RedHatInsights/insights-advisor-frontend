import './App.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { setSIDs, setSelectedTags, setWorkloads } from './AppActions';

import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import MessageState from './PresentationalComponents/MessageState/MessageState';
import { PERMS } from './AppConstants';
import PropTypes from 'prop-types';
import { Routes } from './Routes';
import messages from './Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const App = (props) => {
    const intl = useIntl();
    const permsViewRecs = usePermissions('advisor', PERMS.viewRecs);
    const [auth, setAuth] = useState(false);
    const dispatch = useDispatch();
    const appNavClick = useMemo(() => ({
        recommendations(redirect) { insights.chrome.appNavClick({ id: 'recommendations', redirect }); },
        systems(redirect) { insights.chrome.appNavClick({ id: 'systems', redirect }); },
        topics(redirect) { insights.chrome.appNavClick({ id: 'topics', redirect }); }
    }), []);

    useEffect(() => {
        insights.chrome.init();
        insights.chrome.auth.getUser().then(() => setAuth(true));
        insights.chrome.identifyApp('advisor');
        insights.chrome?.globalFilterScope?.('insights');
        if (insights.chrome?.globalFilterScope) {
            insights.chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
                const [workloads, SID, selectedTags] = insights.chrome?.mapGlobalFilter?.(data, false, true) || [];
                batch(() => {
                    dispatch(setWorkloads(workloads));
                    dispatch(setSelectedTags(selectedTags));
                    dispatch(setSIDs(SID));
                });
            });
        }

        const baseComponentUrl = props.location.pathname.split('/')[1];
        const unregister = insights.chrome.on('APP_NAVIGATION', event => {
            if (event.domEvent) {
                props.history.push(`/${event.navId}`);
                appNavClick[baseComponentUrl] !== undefined ? appNavClick[baseComponentUrl](true)
                    : appNavClick.recommendations;
            }
        });

        return () => unregister();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const baseComponentUrl = props.location.pathname.split('/')[1];
        insights && insights.chrome && baseComponentUrl && appNavClick[baseComponentUrl] !== undefined && appNavClick[baseComponentUrl](false);
    }, [appNavClick, props.location]);

    return (auth && !permsViewRecs?.isLoading && (permsViewRecs?.hasAccess ? <Routes childProps={props} /> :
        <MessageState variant='large' icon={LockIcon}
            title={intl.formatMessage(messages.permsTitle)} text={intl.formatMessage(messages.permsBody)} />));
};

App.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object
};

export default routerParams(App);
