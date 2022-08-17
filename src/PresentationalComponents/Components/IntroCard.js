import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  List,
  ListItem,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

const IntroCard = ({ title, Icon, appList }) => {
  return (
    <Card
      id={`id-${title}`}
      isCompact
      style={{ 'background-color': 'var(--pf-global--palette--black-200)' }}
    >
      <CardTitle>
        <Flex flex={{ default: 'inlineFlex' }} style={{ flexWrap: 'nowrap' }}>
          <FlexItem>
            <Icon />
          </FlexItem>
          <FlexItem isFilled>{title}</FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <List isPlain>
          {appList.map((app) => (
            <ListItem key={app.title}>
              <Button variant="link" component="a" isInline href={app.link}>
                {app.title}
              </Button>{' '}
            </ListItem>
          ))}
        </List>
      </CardBody>
    </Card>
  );
};
IntroCard.propTypes = {
  title: PropTypes.string,
  Icon: PropTypes.element,
  appList: PropTypes.array,
};

export default IntroCard;
