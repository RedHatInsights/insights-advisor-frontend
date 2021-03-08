import './App.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { setSIDs, setSelectedTags, setWorkloads } from './AppActions';

import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import MessageState from './PresentationalComponents/MessageState/MessageState';
import { PERMS } from './AppConstants';
import { Routes } from './Routes';
import messages from './Messages';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { useHistory, useLocation } from 'react-router-dom';

console.log('KURVA ZASRANY ADVISOR');

const App = () => {
    const intl = useIntl();
    const { push } = useHistory();
    const { pathname } = useLocation();
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
                setTimeout(() => {
                    batch(() => {
                        dispatch(setWorkloads(workloads));
                        dispatch(setSelectedTags(selectedTags));
                        dispatch(setSIDs(SID));
                    });
                });
            });
        }

        const baseComponentUrl = pathname.split('/')[1];
        const unregister = insights.chrome.on('APP_NAVIGATION', event => {
            if (event.domEvent) {
                push(`/${event.navId}`);
                appNavClick[baseComponentUrl] !== undefined ? appNavClick[baseComponentUrl](true)
                    : appNavClick.recommendations;
            }
        });

        return () => unregister();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const baseComponentUrl = pathname.split('/')[1];
        insights && insights.chrome && baseComponentUrl && appNavClick[baseComponentUrl] !== undefined && appNavClick[baseComponentUrl](false);
    }, [appNavClick, pathname]);

    return (auth && !permsViewRecs?.isLoading && (permsViewRecs?.hasAccess ? <Routes /> :
        <MessageState variant='large' icon={LockIcon}
            title={intl.formatMessage(messages.permsTitle)} text={intl.formatMessage(messages.permsBody)} />));
};

export default App;
