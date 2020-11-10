import './List.scss';

import { PERMS, RULES_FETCH_URL } from '../../AppConstants';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Suspense, lazy, useEffect, useState } from 'react';

import API from '../../Utilities/Api';
import { Alert } from '@patternfly/react-core/dist/esm/components/Alert/Alert';
import { AlertActionCloseButton } from '@patternfly/react-core/dist/esm/components/Alert/AlertActionCloseButton';
import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/files/RBACHook';

const RulesTable = lazy(() => import(/* webpackChunkName: "RulesTable" */ '../../PresentationalComponents/RulesTable/RulesTable'));

const List = () => {
    const intl = useIntl();
    const permsExport = usePermissions('advisor', PERMS.export);
    const AdvisorRedHatDisabledRuleAlert = JSON.parse(sessionStorage.getItem('AdvisorRedHatDisabledRuleAlert') || 'true');
    const [redhatDisabledRuleAlert, setRedHatDisabledRuleAlert] = useState(AdvisorRedHatDisabledRuleAlert);
    const [redHatDisabledRuleCount, setRedHatDisabledRuleCount] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const response = (await API.get(`${RULES_FETCH_URL}?rule_status=rhdisabled`)).data;
                setRedHatDisabledRuleCount(response.meta.count);
            } catch (error) {
                setRedHatDisabledRuleCount(0);
            }
        })();
    }, []);

    return <React.Fragment>
        <PageHeader className='ins-c-recommendations-header'>
            <PageHeaderTitle title={`${intl.formatMessage(messages.insightsHeader)} ${intl.formatMessage(messages.recommendations).toLowerCase()}`} />
            {!permsExport.isLoading &&
                <Tooltip trigger={!permsExport.hasAccess ? 'mouseenter' : ''} content={intl.formatMessage(messages.permsAction)}>
                    <DownloadExecReport isDisabled={!permsExport.hasAccess} />
                </Tooltip>
            }
            {redhatDisabledRuleAlert && redHatDisabledRuleCount > 0 &&
                <Alert
                    className='alertOverride'
                    variant="warning"
                    isInline
                    title={intl.formatMessage(messages.redhatDisabledRuleAlertTitle)}
                    actionClose={<AlertActionCloseButton onClose={() => {
                        setRedHatDisabledRuleAlert(false);
                        sessionStorage.setItem('AdvisorRedHatDisabledRuleAlert', 'false');
                    }} />}
                >
                    {intl.formatMessage(messages.redhatDisabledRuleAlert)}
                </Alert>
            }
        </PageHeader>
        <Main><Suspense fallback={<Loading />}><RulesTable /></Suspense></Main>
    </React.Fragment>;

};

List.displayName = 'recommendations-list';

export default List;
