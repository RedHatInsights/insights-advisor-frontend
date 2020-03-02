/* eslint-disable camelcase */
import './_Details.scss';

import * as AppActions from '../../AppActions';

import React, { useEffect } from 'react';
import { Text, TextVariants } from '@patternfly/react-core/dist/js/components/Text/Text';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PageHeader } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import PropTypes from 'prop-types';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import StarIcon from '@patternfly/react-icons/dist/js/icons/star-icon';
import { TextContent } from '@patternfly/react-core/dist/js/components/Text/TextContent';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import { Truncate } from '@redhat-cloud-services/frontend-components/components/Truncate';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const Details = ({ match, fetchTopic, setFilters, topic, topicFetchStatus, intl, filters }) => {
    useEffect(() => {
        if (typeof filters.topic === 'undefined') {
            setFilters({ impacting: true, reports_shown: 'true', topic: match.params.id, sort: `-publish_date` });
        }
    });

    useEffect(() => {
        fetchTopic({ topic_id: match.params.id });
        return () => {
            setFilters({ impacting: true, reports_shown: 'true', sort: '-publish_date' });
        };
    }, [fetchTopic, match.params.id, setFilters]);

    return <React.Fragment>
        <PageHeader>
            <Breadcrumbs
                current={topic.name}
                match={match}
            />
            {topicFetchStatus === 'fulfilled' &&
                <React.Fragment>
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
                </React.Fragment>
            }
            {topicFetchStatus === '' || topicFetchStatus === 'pending' && <Loading />}
        </PageHeader>
        <Main>
            <React.Fragment>
                {topicFetchStatus === '' || topicFetchStatus === 'pending' || topicFetchStatus === 'fulfilled' && <React.Fragment>
                    <Title headingLevel="h3" size="2xl" className='titlePaddingOverride'>
                        {intl.formatMessage(messages.recommendations)}
                    </Title>
                    {filters.topic && <RulesTable />}
                </React.Fragment>}
                {topicFetchStatus === 'failed' || topicFetchStatus === 'rejected' &&
                    <MessageState icon={TimesCircleIcon} title={intl.formatMessage(messages.topicDetailslNodetailsTitle)}
                        text={intl.formatMessage(messages.topicDetailslNodetailsBody)} />}
            </React.Fragment>
        </Main>
    </React.Fragment>;
};

Details.propTypes = {
    match: PropTypes.any,
    fetchTopic: PropTypes.func,
    topic: PropTypes.object,
    topicFetchStatus: PropTypes.string,
    setFilters: PropTypes.func,
    intl: PropTypes.any,
    filters: PropTypes.object
};

const mapStateToProps = (state) => ({
    topic: state.AdvisorStore.topic,
    topicFetchStatus: state.AdvisorStore.topicFetchStatus,
    filters: state.AdvisorStore.filters
});

const mapDispatchToProps = dispatch => ({
    fetchTopic: (url) => dispatch(AppActions.fetchTopic(url)),
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Details)));
