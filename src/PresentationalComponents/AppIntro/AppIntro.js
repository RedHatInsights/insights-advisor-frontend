import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { linksForAppIntro } from '../../AppConstants';
import { WrenchIcon, SecurityIcon, TrendUpIcon } from '@patternfly/react-icons';
import { Grid, GridItem, Button } from '@patternfly/react-core';
import IntroCard from '../Components/IntroCard';

const AppIntro = ({
  isPreProduction,
  mainBtn,
  btn,
  title1,
  title2,
  title3,
}) => {
  const intl = useIntl();
  return (
    <Grid hasGutter>
      <GridItem>{intl.formatMessage(mainBtn)}</GridItem>
      <GridItem>
        <Button
          className={'advisor_pendo_intro'}
          id={'advisor_pendo_intro'}
          ouiaId={'advisor_pendo_intro'}
        >
          {intl.formatMessage(btn)}
        </Button>
      </GridItem>
      {!isPreProduction && (
        <>
          <GridItem>
            <IntroCard
              title={intl.formatMessage(title1)}
              Icon={WrenchIcon}
              appList={linksForAppIntro.operationInsights}
            />
          </GridItem>
          <GridItem>
            <IntroCard
              title={intl.formatMessage(title2)}
              Icon={SecurityIcon}
              appList={linksForAppIntro.securityInsights}
            />
          </GridItem>
          <GridItem>
            <IntroCard
              title={intl.formatMessage(title3)}
              Icon={TrendUpIcon}
              appList={linksForAppIntro.businessInsights}
            />
          </GridItem>
        </>
      )}
    </Grid>
  );
};

AppIntro.propTypes = {
  isPreProduction: PropTypes.bool,
  mainBtn: PropTypes.object,
  btn: PropTypes.object,
  title1: PropTypes.object,
  title2: PropTypes.object,
  title3: PropTypes.object,
};

export default AppIntro;
