import React, { useEffect } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import { Gallery } from '@patternfly/react-core';
import { Main } from '@redhat-cloud-services/frontend-components';
import { groupBy, sortBy, reverse } from 'lodash';
import { TimesCircleIcon } from '@patternfly/react-icons';

import * as AppActions from '../../AppActions';
import TopicCard from '../../PresentationalComponents/TopicCard/TopicCard';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';

const List = (props) => {
    const { topics, topicsFetchStatus, fetchTopics, setBreadcrumbs } = props;

    useEffect(() => {
        setBreadcrumbs([{ title: 'Topics', navigate: '/topics' }]);
        fetchTopics();
    }, [fetchTopics, setBreadcrumbs]);

    const buildTopicList = () => {
        const groupedTopics = groupBy(topics, 'featured');
        const sortedTopics = reverse(sortBy(groupedTopics.false, ['impacted_systems_count']));
        const sortedRecommenedTopics = reverse(sortBy(groupedTopics.true, (topic) => topic.impacted_systems_count));
        const combinedTopics = [...sortedRecommenedTopics, ...sortedTopics];

        return combinedTopics.map(topic => <TopicCard key={topic.name} topic={topic} />);
    };

    const renderTopics = () => <>
        {topicsFetchStatus === '' || topicsFetchStatus === 'pending' && <Loading />}
        {topicsFetchStatus === 'fulfilled' && topics.length > 0 &&
            <Gallery gutter="lg">
                {buildTopicList()}
            </Gallery>
        }
        {topicsFetchStatus === 'failed' || topicsFetchStatus === 'rejected' || (topicsFetchStatus === 'fulfilled' && topics.length === 0) &&
            <MessageState icon={TimesCircleIcon} title='There was an issue fetching topics'
                text={`Either no topics presently exist or there is an issue presenting them.`} />
        }
    </>;

    return <>
        <PageHeader>
            <PageHeaderTitle title='Topics' />
        </PageHeader>
        <Main>
            {renderTopics()}
        </Main>
    </>;
};

List.displayName = 'list-topics';
List.propTypes = {
    setBreadcrumbs: PropTypes.func,
    fetchTopics: PropTypes.func,
    topicsFetchStatus: PropTypes.string,
    topics: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
    topics: state.AdvisorStore.topics,
    topicsFetchStatus: state.AdvisorStore.topicsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    setBreadcrumbs: (obj) => AppActions.setBreadcrumbs(obj),
    fetchTopics: () => dispatch(AppActions.fetchTopics())
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(List));
