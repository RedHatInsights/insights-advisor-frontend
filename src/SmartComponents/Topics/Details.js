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
            setFilters({ impacting: true, rule_status: 'enabled', topic: match.params.id, sort: `-total_risk`, limit: 10, offset: 0  });
        }
    });

    useEffect(() => {
        fetchTopic({ topic_id: match.params.id });
        return () => {
            setFilters({ impacting: true, rule_status: 'enabled', sort: '-total_risk', limit: 10, offset: 0 });
        };
    }, [fetchTopic, match.params.id, setFilters]);

    useEffect(() => {
        if (topic && topic.name) {
            const subnav = `${topic.name} - ${messages.topics.defaultMessage}`;
            document.title = intl.formatMessage(messages.documentTitle, { subnav });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic]);

    return <React.Fragment>
        <PageHeader>
            <Breadcrumbs
                current={topic.name}
                match={match}
                ouiaId="details"
            />
            {topicFetchStatus === 'fulfilled' &&
                <React.Fragment>
                    <Title headingLevel='h3' size="2xl" className='titleOverride'>
                        {topic.name}{topic.featured && <Label color='blue' className='labelOverride' icon={<StarIcon />}>
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
                    <Title headingLevel="h3" size="2xl" className='titleOverride'>
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
