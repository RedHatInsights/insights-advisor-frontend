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
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import messages from '../../Messages';

import './_Details.scss';

const Details = ({ match, fetchTopic, setFilters, topic, topicFetchStatus, intl }) => {
    useEffect(() => {
        fetchTopic({ topic_id: match.params.id });
        return () => {
            setFilters({ impacting: true, reports_shown: true });
        };
    }, [fetchTopic, match.params.id, setFilters]);

    return <>
        <PageHeader>
            <Breadcrumbs
                current={topic.name}
                match={match}
            />
            {topicFetchStatus === 'fulfilled' &&
                <>
                    <Title size="2xl" className='titleOverride'>
                        {topic.name}{topic.featured && <Label className='labelOverride'><StarIcon />
                            {intl.formatMessage(messages.featured)}
                        </Label>}
                    </Title>
                    <TextContent className='textOverride'>
                        <Text component={TextVariants.p}>
                            <Truncate
                                text={topic.description}
                                length={600}
                                expandText={intl.formatMessage(messages.readmore)}
                                collapseText={intl.formatMessage(messages.readless)}
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
                {topicFetchStatus === 'failed' || topicFetchStatus === 'rejected' &&
                    <MessageState icon={TimesCircleIcon} title={intl.formatMessage(messages.topicDetailslNodetailsTitle)}
                        text={intl.formatMessage(messages.topicDetailslNodetailsBody)} />}
            </>
        </Main>
    </>;
};

Details.propTypes = {
    match: PropTypes.any,
    fetchTopic: PropTypes.func,
    topic: PropTypes.object,
    topicFetchStatus: PropTypes.string,
    setFilters: PropTypes.func,
    intl: PropTypes.any
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

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Details)));
