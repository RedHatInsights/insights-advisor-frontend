/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardHeader, CardBody, Button, Title, Stack, StackItem, GalleryItem, Text, TextContent, TextVariants, Level, LevelItem, Label
} from '@patternfly/react-core';
import { StarIcon } from '@patternfly/react-icons';
import pluralize from 'pluralize';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';

import * as AppActions from '../../AppActions';

import './_TopicCard.scss';

const TopicCard = (props) => {
    const { topic, setFilters, history } = props;

    return <GalleryItem>
        <Card>
            <CardHeader>
                <Title headingLevel="h3" size="lg">{topic.name} </Title>
            </CardHeader>
            <CardBody>
                <Stack gutter="md">
                    <StackItem className='cardDescription'>
                        <TextContent>
                            <Text component={TextVariants.p}>
                                {topic.description.substring(0, 150)}{topic.description.length > 150 ? '...' : ''}
                            </Text>
                        </TextContent>
                    </StackItem>
                    <StackItem>
                        <TextContent>
                            <Text component={TextVariants.small}>
                                {pluralize('system', topic.impacted_systems_count, true)} affected
                            </Text>
                        </TextContent>
                    </StackItem>
                    <StackItem>
                        <Level className='nowrap'>
                            <LevelItem>
                                <Button variant="link" onClick={() => {
                                    setFilters({ impacting: true, reports_shown: true, topic: topic.slug });
                                    history.push(`/topics/${topic.slug}/`);
                                }}>
                                    Learn more
                                </Button>
                            </LevelItem>
                            {topic.featured && <LevelItem>
                                <Label> <StarIcon /> Recommended</Label>
                            </LevelItem>}
                        </Level>
                    </StackItem>
                </Stack>
            </CardBody>
        </Card>

    </GalleryItem>;
};

TopicCard.propTypes = {
    topic: PropTypes.object,
    history: PropTypes.object,
    setFilters: PropTypes.func
};

const mapDispatchToProps = dispatch => ({
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default routerParams(connect(
    null,
    mapDispatchToProps
)(TopicCard));
