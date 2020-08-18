import './List.scss';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Suspense, lazy } from 'react';

import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const RulesTable = lazy(() => import(/* webpackChunkName: "RulesTable" */ '../../PresentationalComponents/RulesTable/RulesTable'));
const TagsToolbar = lazy(() => import(/* webpackChunkName: "TagsToolbar" */ '../../PresentationalComponents/TagsToolbar/TagsToolbar'));

const List = () => {
    const intl = useIntl();

    return <React.Fragment>
        <Suspense fallback={<Loading />}> <TagsToolbar /> </Suspense>
        <PageHeader className='ins-c-recommendations-header'>
            <PageHeaderTitle title={`${intl.formatMessage(messages.insightsHeader)} ${intl.formatMessage(messages.recommendations).toLowerCase()}`} />
            <DownloadExecReport />
        </PageHeader>
        <Main><Suspense fallback={<Loading />}><RulesTable /></Suspense></Main>
    </React.Fragment>;

};

List.displayName = 'recommendations-list';

export default List;
