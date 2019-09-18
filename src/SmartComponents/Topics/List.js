import React, { useEffect } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import { Gallery } from '@patternfly/react-core';
import { Main } from '@redhat-cloud-services/frontend-components';
import { groupBy, sortBy, reverse } from 'lodash';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import TopicCard from '../../PresentationalComponents/TopicCard/TopicCard';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import messages from '../../Messages';

const List = ({ topics, topicsFetchStatus, fetchTopics, setBreadcrumbs, intl }) => {
    useEffect(() => {
        setBreadcrumbs([{ title: intl.formatMessage(messages.topicsTitle), navigate: '/topics' }]);
        fetchTopics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <MessageState icon={TimesCircleIcon}
                title={intl.formatMessage(messages.topicsListNotopicsTitle)}
                text={intl.formatMessage(messages.topicsListNotopicsBody)} />
        }
    </>;

    return <>
        <PageHeader>
            <PageHeaderTitle title={intl.formatMessage(messages.topicsTitle)} />
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
    topics: PropTypes.array,
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    topics: state.AdvisorStore.topics,
    topicsFetchStatus: state.AdvisorStore.topicsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    setBreadcrumbs: (obj) => dispatch(AppActions.setBreadcrumbs(obj)),
    fetchTopics: () => dispatch(AppActions.fetchTopics())
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(List)));
