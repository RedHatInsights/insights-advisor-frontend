import './Details.scss';

import PropTypes from 'prop-types';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { TotalRiskCard } from '../../PresentationalComponents/Cards/TotalRiskCard';
import { ResolutionCard } from '../../PresentationalComponents/Cards/ResolutionCard';
import {
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core/dist/esm/components/Tabs/index';
import { updateRecFilters, updateSysFilters } from '../../Services/Filters';
import { useDispatch, useSelector } from 'react-redux';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import CategoryLabel from '../../PresentationalComponents/Labels/CategoryLabel';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import Loading from '../../PresentationalComponents/Loading/Loading';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import messages from '../../Messages';
import { useGetPathwayQuery } from '../../Services/Pathways';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { useLocation } from 'react-router-dom';
import HybridInventory from '../HybridInventoryTabs/HybridInventoryTabs';
import { systemsCheck } from './helpers';
import { EnvironmentContext } from '../../App';

const RulesTable = lazy(
  () =>
    import(
      /* webpackChunkName: 'RulesTable' */ '../../PresentationalComponents/RulesTable/RulesTable'
    ),
);

const PathwayDetails = () => {
  const intl = useIntl();
  const pathwayName = useParams().id;
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const recFilters = useSelector(({ filters }) => filters.recState);
  const sysFilters = useSelector(({ filters }) => filters.sysState);

  const [conventionalSystemsCount, setConventionalSystemsCount] = useState(0);
  const [areCountsLoading, setCountsLoading] = useState(true);

  let options = {};
  selectedTags?.length &&
    (options = {
      ...options,
      ...{ tags: selectedTags.join(',') },
    });
  workloads && (options = { ...options, ...workloadQueryBuilder(workloads) });
  const { data: pathway = {}, isFetching } = useGetPathwayQuery({
    ...options,
    slug: pathwayName,
  });
  const { pathname } = useLocation();

  const [activeTab, setActiveTab] = useState(
    pathname.includes('/recommendations/pathways/systems/') ? 1 : 0,
  );
  useEffect(() => {
    pathway &&
      !isFetching &&
      envContext.updateDocumentTitle(
        `${pathway.name} - ${messages.pathways.defaultMessage} - Advisor`,
      );
  }, [envContext, pathway, pathname, isFetching]);

  const waitForElm = (selector) => {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });
    });
  };

  const scrollDown = () => {
    if (pathname.includes('/recommendations/pathways/systems/')) {
      setTimeout(() => {
        waitForElm('#tablesContainer').then(() => {
          document
            .getElementById('tablesContainer')
            .scrollIntoView({ behavior: 'smooth' });
        });
      }, 5000);
    }
  };

  useEffect(() => {
    const initiaRecFilters = { ...recFilters };
    const initiaSysFilters = { ...sysFilters };
    const defaultFilters = { pathway: pathwayName, limit: 20, offset: 0 };
    dispatch(
      updateRecFilters({
        ...defaultFilters,
        sort: 'category',
        impacting: true,
      }),
    );
    dispatch(
      updateSysFilters({
        ...defaultFilters,
      }),
    );
    scrollDown();
    return () => {
      dispatch(updateRecFilters(initiaRecFilters));
      dispatch(updateSysFilters(initiaSysFilters));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      typeof envContext.BASE_URL === 'string' &&
      envContext.BASE_URL.length > 0
    ) {
      systemsCheck(
        undefined,
        undefined,
        setConventionalSystemsCount,
        setCountsLoading,
        pathwayName,
        envContext.BASE_URL,
      );
    }
  }, [pathwayName, envContext.BASE_URL]);

  return (
    <React.Fragment>
      {isFetching ? (
        <Loading />
      ) : (
        <React.Fragment>
          <PageHeader className="adv-c-page__header">
            <Breadcrumbs ouiaId="override" current={pathway.name || ''} />
            <PageHeaderTitle
              title={
                <React.Fragment>
                  {pathway.name}
                  {pathway.has_incident && (
                    <RuleLabels rule={{ tags: 'incident' }} />
                  )}
                </React.Fragment>
              }
            />
            <p className="pf-v6-u-mb-lg">
              {intl.formatMessage(messages.pathwaysDetailsModifieddate, {
                date: (
                  <DateFormat
                    date={new Date(pathway.publish_date)}
                    type="onlyDate"
                  />
                ),
              })}
              <span className="pf-v6-u-pl-sm">
                <CategoryLabel labelList={pathway.categories} />
              </span>
            </p>
            <p className="pf-v6-u-mb-lg">{pathway.description}</p>
          </PageHeader>
          <section className="pf-v6-u-p-lg">
            <Grid hasGutter>
              <GridItem sm={12} md={6}>
                <TotalRiskCard {...pathway} />
              </GridItem>
              <GridItem sm={12} md={6}>
                <ResolutionCard {...pathway} />
              </GridItem>
            </Grid>
          </section>
        </React.Fragment>
      )}
      {isFetching && <Loading />}
      <section className="pf-v6-u-px-lg pf-v6-u-pb-lg">
        <Tabs
          className="adv__background--global-100"
          activeKey={activeTab}
          onSelect={(_e, tab) => setActiveTab(tab)}
        >
          <Tab
            eventKey={0}
            title={
              <TabTitleText>
                {intl.formatMessage(messages.recommendations)}
              </TabTitleText>
            }
          >
            {isFetching ? (
              <Loading />
            ) : (
              <Suspense fallback={<Loading />}>
                <RulesTable pathway={pathwayName} />
              </Suspense>
            )}
          </Tab>
          <Tab
            eventKey={1}
            title={
              <TabTitleText>
                {intl.formatMessage(messages.systems)}
              </TabTitleText>
            }
          >
            {isFetching ? (
              <Loading />
            ) : (
              <Suspense fallback={<Loading />}>
                <HybridInventory
                  pathway={pathway}
                  selectedTags={selectedTags}
                  workloads={workloads}
                  tabPathname={`/insights/advisor/recommendations/pathways/${pathwayName}`}
                  conventionalSystemsCount={conventionalSystemsCount}
                  areCountsLoading={areCountsLoading}
                />
              </Suspense>
            )}
          </Tab>
        </Tabs>
      </section>
    </React.Fragment>
  );
};

PathwayDetails.propTypes = {
  isImmutableTabOpen: PropTypes.bool,
};
export default PathwayDetails;
