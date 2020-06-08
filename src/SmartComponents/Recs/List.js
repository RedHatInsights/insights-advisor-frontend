import './_List.scss';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Suspense, lazy, useState } from 'react';

import { Alert } from '@patternfly/react-core/dist/js/components/Alert/Alert';
import { AlertActionCloseButton } from '@patternfly/react-core/dist/js/components/Alert/AlertActionCloseButton';
import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import { UI_BASE } from '../../AppConstants';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const RulesTable = lazy(() => import(/* webpackChunkName: "RulesTable" */ '../../PresentationalComponents/RulesTable/RulesTable'));
const TagsToolbar = lazy(() => import(/* webpackChunkName: "TagsToolbar" */ '../../PresentationalComponents/TagsToolbar/TagsToolbar'));

let AdvisorCveAlert = sessionStorage.getItem('AdvisorCveAlert') || false;
const List = () => {
    const [cveAlert, setCveAlert] = useState(AdvisorCveAlert);
    const intl = useIntl();

    return <React.Fragment>
        <Suspense fallback={<Loading />}> <TagsToolbar /> </Suspense>
        <PageHeader>
            <PageHeaderTitle title={intl.formatMessage(messages.recommendations)} />
            <DownloadExecReport />
            {!cveAlert && <Alert
                className='alertOverride'
                variant="warning"
                isInline
                title={intl.formatMessage(messages.cveAlertTitle)}
                action={<AlertActionCloseButton onClose={() => {
                    setCveAlert(true);
                    sessionStorage.setItem('AdvisorCveAlert', 'true');
                }} />}
            >
                {intl.formatMessage(messages.cveAlert)}&nbsp; <a href={`${UI_BASE}/vulnerability/cves?page=1&sort=-public_date`}>View CVEs</a>
            </Alert>}
        </PageHeader>
        <Main><Suspense fallback={<Loading />}><RulesTable /></Suspense></Main>
    </React.Fragment>;

};

List.displayName = 'recommendations-list';

export default List;
