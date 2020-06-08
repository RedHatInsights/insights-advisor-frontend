import './InsightsTabs.scss';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Tab, TabsVariant } from '@patternfly/react-core/dist/js/components/Tabs/index';

import { Alert } from '@patternfly/react-core/dist/js/components/Alert/Alert';
import { AlertActionCloseButton } from '@patternfly/react-core/dist/js/components/Alert/AlertActionCloseButton';
import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import PropTypes from 'prop-types';
import { Tabs } from '@patternfly/react-core/dist/js/components/Tabs/Tabs';
import { UI_BASE } from '../../AppConstants';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const RulesTable = lazy(() => import(/* webpackChunkName: "RulesTable" */ '../../PresentationalComponents/RulesTable/RulesTable'));
const SystemsTable = lazy(() => import(/* webpackChunkName: "SystemsTable" */ '../../PresentationalComponents/SystemsTable/SystemsTable'));
const TagsToolbar = lazy(() => import(/* webpackChunkName: "TagsToolbar" */ '../../PresentationalComponents/TagsToolbar/TagsToolbar'));

let AdvisorCveAlert = sessionStorage.getItem('AdvisorCveAlert') || false;

const InsightsTabs = ({ intl, history }) => {
    const [activeTab, setActiveTab] = useState({});
    const [cveAlert, setCveAlert] = useState(AdvisorCveAlert);
    const tabs = {
        recommendations: {
            title: intl.formatMessage(messages.recommendations), to: '/recommendations',
            component: <Suspense fallback={<Loading />}><RulesTable /></Suspense>
        },
        systems: {
            title: intl.formatMessage(messages.systems), to: '/recommendations/systems',
            component: <Suspense fallback={<Loading />}><SystemsTable /></Suspense>
        }
    };

    useEffect(() => {
        const tabType = location.pathname.slice(location.pathname.indexOf('advisor/')).split('/')[2] === 'systems' ? 'systems' : 'recommendations';
        const activeTab = tabs[tabType];
        setActiveTab(activeTab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTabClick = (event, tabKey) => {
        const activeTab = tabs[tabKey];
        setActiveTab(activeTab);
        history.push(activeTab.to);
    };

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
        {activeTab.title && <Tabs mountOnEnter unmountOnExit
            className='insights-tabs'
            activeKey={activeTab.title.toLowerCase()}
            onSelect={handleTabClick}
            aria-label="Insights Tabs"
            variant={TabsVariant.nav}
        >
            {Object.entries(tabs).map((item) =>
                <Tab key={item[0]} eventKey={item[0]} title={item[1].title}>
                    <Main>
                        {activeTab.title === item[1].title && item[1].component}
                    </Main>
                </Tab>)
            }
        </Tabs>
        }
    </React.Fragment>;

};

InsightsTabs.displayName = 'insights-tabs';
InsightsTabs.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    intl: PropTypes.any
};

export default injectIntl(routerParams(InsightsTabs));
