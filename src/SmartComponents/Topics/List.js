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

const List = ({ topics, topicsFetchStatus, fetchTopics, intl }) => {
    useEffect(() => { fetchTopics(); }, [fetchTopics]);

    const buildTopicList = () => {
        const groupedTopics = groupBy(topics, 'featured');
        const sortedTopics = reverse(sortBy(groupedTopics.false, ['impacted_systems_count']));
        const sortedRecommenedTopics = reverse(sortBy(groupedTopics.true, (topic) => topic.impacted_systems_count));
        const combinedTopics = [...sortedRecommenedTopics, ...sortedTopics];

        return combinedTopics.map(topic => <TopicCard key={topic.name} topic={topic} />);
    };

    const renderTopics = () => <React.Fragment>
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
    </React.Fragment>;

    return <React.Fragment>
        <PageHeader>
            <PageHeaderTitle title={intl.formatMessage(messages.topics)} />
        </PageHeader>
        <Main>
            {renderTopics()}
        </Main>
    </React.Fragment>;
};

List.displayName = 'list-topics';
List.propTypes = {
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
    fetchTopics: () => dispatch(AppActions.fetchTopics())
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(List)));
