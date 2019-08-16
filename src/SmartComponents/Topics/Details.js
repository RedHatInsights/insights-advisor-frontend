/* eslint-disable camelcase */
import React, { useEffect } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { Main, PageHeader, Truncate } from '@redhat-cloud-services/frontend-components';
import {
    TextContent,
    Text,
    TextVariants,
    Label,
    Title
} from '@patternfly/react-core';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StarIcon, TimesCircleIcon } from '@patternfly/react-icons';

import * as AppActions from '../../AppActions';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';

import './_Details.scss';

const Details = (props) => {
    const { match, fetchTopic, setFilters, topic, topicFetchStatus } = props;
    useEffect(() => {
        fetchTopic({ topic_id: props.match.params.id });
        setFilters({ impacting: true, reports_shown: true, topic: props.match.params.id });
        return () => setFilters({ impacting: true, reports_shown: true });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchTopic, topic.slug]);

    return <>
        <PageHeader>
            <Breadcrumbs
                current={topic.name}
                match={match}
            />
            {topicFetchStatus === 'fulfilled' &&
                <>
                    <Title size="2xl" className='titleOverride'>
                        {topic.name}{topic.featured && <Label className='labelOverride'><StarIcon /> Recommended</Label>}
                    </Title>
                    <TextContent className='textOverride'>
                        <Text component={TextVariants.p}>
                            <Truncate
                                text={topic.description}
                                length={600}
                                expandText='Read more'
                                collapseText='Read less'
                                inline
                            />
                        </Text>
                    </TextContent>
                </>
            }
            {topicFetchStatus === '' || topicFetchStatus === 'pending' && <Loading />}
        </PageHeader>
        <Main>
            <>
                {topicFetchStatus === '' || topicFetchStatus === 'pending' || topicFetchStatus === 'fulfilled' && <>
                    <Title headingLevel="h3" size="2xl" className='titlePaddingOverride'> Rules</Title>
                    <RulesTable />
                </>}
                {topicFetchStatus === 'failed' || topicFetchStatus === 'rejected' && <MessageState icon={TimesCircleIcon} title='No details for topic'
                    text={`There exist no further details for this topic.`} />}
            </>
        </Main>
    </>;
};

Details.propTypes = {
    match: PropTypes.any,
    fetchTopic: PropTypes.func,
    topic: PropTypes.object,
    topicFetchStatus: PropTypes.string,
    setFilters: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    topic: state.AdvisorStore.topic,
    topicFetchStatus: state.AdvisorStore.topicFetchStatus,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchTopic: (url) => dispatch(AppActions.fetchTopic(url)),
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Details));
