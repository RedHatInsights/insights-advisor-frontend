import * as AppActions from '../../AppActions';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { useEffect } from 'react';

import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import PropTypes from 'prop-types';
import TopicsTable from '../../PresentationalComponents/TopicsTable/TopicsTable';
import asyncComponent from '../../Utilities/asyncComponent';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const TagsToolbar = asyncComponent(() => import(/* webpackChunkName: "TagsToolbar" */ '../../PresentationalComponents/TagsToolbar/TagsToolbar'));

const List = ({ fetchTopics, intl, selectedTags }) => {
    useEffect(() => {
        const options = selectedTags !== null && selectedTags.length && ({ tags: selectedTags.join() });
        fetchTopics(options);
    }, [fetchTopics, selectedTags]);

    return <React.Fragment>
        <TagsToolbar />
        <PageHeader>
            <PageHeaderTitle title={`${intl.formatMessage(messages.insightsHeader)} ${intl.formatMessage(messages.topics).toLowerCase()}`} />
        </PageHeader>
        <Main>
            <TopicsTable />
        </Main>
    </React.Fragment>;
};

List.displayName = 'list-topics';
List.propTypes = { fetchTopics: PropTypes.func, intl: PropTypes.any, selectedTags: PropTypes.array };
const mapStateToProps = (state, ownProps) => ({
    selectedTags: state.AdvisorStore.selectedTags,
    ...ownProps
});
const mapDispatchToProps = dispatch => ({ fetchTopics: (options) => dispatch(AppActions.fetchTopics(options)) });

export default injectIntl(routerParams(connect(mapStateToProps, mapDispatchToProps)(List)));
