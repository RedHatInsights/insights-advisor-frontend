/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardHeader, CardBody, Button, Title, Stack, StackItem, GalleryItem, Text, TextContent, TextVariants, Level, LevelItem, Label
} from '@patternfly/react-core';
import { StarIcon } from '@patternfly/react-icons';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { injectIntl } from 'react-intl';

import messages from '../../Messages';

import './_TopicCard.scss';

const TopicCard = ({ topic, history, intl }) => {

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
                                {intl.formatMessage(messages.topicCardSystemsaffected, { systems: topic.impacted_systems_count })}
                            </Text>
                        </TextContent>
                    </StackItem>
                    <StackItem>
                        <Level className='nowrap'>
                            <LevelItem>
                                <Button variant="link" onClick={() => {
                                    history.push(`/topics/${topic.slug}/`);
                                }}>
                                    {intl.formatMessage(messages.learnMore)}
                                </Button>
                            </LevelItem>
                            {topic.featured && <LevelItem>
                                <Label> <StarIcon />&nbsp;{intl.formatMessage(messages.featured)}</Label>
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
    intl: PropTypes.any
};

export default injectIntl(routerParams((TopicCard)));
