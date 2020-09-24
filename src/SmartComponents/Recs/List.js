import './List.scss';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Suspense, lazy, useState } from 'react';

import { Alert } from '@patternfly/react-core/dist/esm/components/Alert/Alert';
import { AlertActionCloseButton } from '@patternfly/react-core/dist/esm/components/Alert/AlertActionCloseButton';
import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { isGlobalFilter } from '../../AppConstants';

const RulesTable = lazy(() => import(/* webpackChunkName: "RulesTable" */ '../../PresentationalComponents/RulesTable/RulesTable'));
const TagsToolbar = lazy(() => import(/* webpackChunkName: "TagsToolbar" */ '../../PresentationalComponents/TagsToolbar/TagsToolbar'));

let AdvisorRedHatDisabledRuleAlert = sessionStorage.getItem('AdvisorRedHatDisabledRuleAlert') || true;

const List = () => {
    const intl = useIntl();
    const [redhatDisabledRuleAlert, setRedHatDisabledRuleAlert] = useState(AdvisorRedHatDisabledRuleAlert);

    return <React.Fragment>
        {!isGlobalFilter() && <Suspense fallback={<Loading />}> <TagsToolbar /> </Suspense>}
        <PageHeader className='ins-c-recommendations-header'>
            <PageHeaderTitle title={`${intl.formatMessage(messages.insightsHeader)} ${intl.formatMessage(messages.recommendations).toLowerCase()}`} />
            <DownloadExecReport />
            {redhatDisabledRuleAlert &&
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
