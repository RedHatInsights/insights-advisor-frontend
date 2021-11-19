import React from 'react';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { linksForAppIntro } from '../../AppConstants';
import { WrenchIcon, SecurityIcon, TrendUpIcon } from '@patternfly/react-icons';
import {
  Grid,
  GridItem,
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

const IntroBody = ({ isPreProduction }) => {
  const intl = useIntl();
  return (
    <Grid hasGutter>
      <GridItem>{intl.formatMessage(messages.introLearnMoreButton)}</GridItem>
      <GridItem>
        <Button className={'advisor_pendo_intro'} id="advisor_pendo_intro">
          {intl.formatMessage(messages.introTakeTour)}
        </Button>
      </GridItem>
      {!isPreProduction && (
        <>
          <GridItem>
            <IntroCard
              title={intl.formatMessage(messages.introLinkOperationInsights)}
              Icon={WrenchIcon}
              appList={linksForAppIntro.operationInsights}
            />
          </GridItem>
          <GridItem>
            <IntroCard
              title={intl.formatMessage(messages.introLinkSecurityInsights)}
              Icon={SecurityIcon}
              appList={linksForAppIntro.securityInsights}
            />
          </GridItem>
          <GridItem>
            <IntroCard
              title={intl.formatMessage(messages.introLinkBusinessInsights)}
              Icon={TrendUpIcon}
              appList={linksForAppIntro.businessInsights}
            />
          </GridItem>
        </>
      )}
    </Grid>
  );
};

IntroCard.propTypes = {
  title: PropTypes.string,
  Icon: PropTypes.element,
  appList: PropTypes.array,
};

IntroBody.propTypes = {
  isPreProduction: PropTypes.bool,
};

export default IntroBody;
