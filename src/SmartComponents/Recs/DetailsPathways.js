import React, { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  GridItem,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { TotalRiskCard } from '../../PresentationalComponents/Cards/TotalRiskCard';
import { ResolutionCard } from '../../PresentationalComponents/Cards/ResolutionCard';
import { updateRecFilters, updateSysFilters } from '../../Services/Filters';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import CategoryLabel from '../../PresentationalComponents/Labels/CategoryLabel';
import Loading from '../../PresentationalComponents/Loading/Loading';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import messages from '../../Messages';
import { useGetPathwayQuery } from '../../Services/Pathways';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import HybridInventory from '../HybridInventoryTabs/HybridInventoryTabs';
import { useFeatureFlag } from '../../Utilities/Hooks';
import { edgeSystemsCheck } from './helpers';
import './Details.scss';

const RulesTable = lazy(() =>
  import(
    /* webpackChunkName: 'RulesTable' */ '../../PresentationalComponents/RulesTable/RulesTable'
  )
);

const PathwayDetails = ({ isImmutableTabOpen }) => {
  const intl = useIntl();
  const pathwayName = useParams().id;
  const dispatch = useDispatch();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const recFilters = useSelector(({ filters }) => filters.recState);
  const sysFilters = useSelector(({ filters }) => filters.sysState);

  const isEdgeParityEnabled = useFeatureFlag('advisor.edge_parity');
  const [edgeSystemsCount, setEdgeSystemsCount] = useState(0);
  const [conventionalSystemsCount, setConventionalSystemsCount] = useState(0);
  const [areCountsLoading, setCountsLoading] = useState(true);

  let options = {};
  selectedTags?.length &&
    (options = {
      ...options,
      ...{ tags: selectedTags.join(',') },
    });
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
  const { data: pathway = {}, isFetching } = useGetPathwayQuery({
    ...options,
    slug: pathwayName,
  });
  const { pathname } = useLocation();

  const [activeTab, setActiveTab] = useState(
    pathname.includes('/recommendations/pathways/systems/') ? 1 : 0
  );
  const chrome = useChrome();
  useEffect(() => {
    pathway &&
      !isFetching &&
      chrome.updateDocumentTitle(
        intl.formatMessage(messages.documentTitle, {
          subnav: `${pathway.name} - ${messages.pathways.defaultMessage}`,
        })
      );
  }, [chrome, intl, pathway, pathname, isFetching]);

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
      })
    );
    dispatch(
      updateSysFilters({
        ...defaultFilters,
      })
    );
    scrollDown();
    return () => {
      dispatch(updateRecFilters(initiaRecFilters));
      dispatch(updateSysFilters(initiaSysFilters));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    isEdgeParityEnabled &&
      edgeSystemsCheck(
        undefined,
        undefined,
        setEdgeSystemsCount,
        setConventionalSystemsCount,
        setCountsLoading,
        pathwayName
      );
  }, [isEdgeParityEnabled, pathwayName]);

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
            <p className="pf-v5-u-mb-lg">
              {intl.formatMessage(messages.rulesDetailsModifieddate, {
                date: (
                  <DateFormat
                    date={new Date(pathway.publish_date)}
                    type="onlyDate"
                  />
                ),
              })}
              <span className="pf-v5-u-pl-sm">
                <CategoryLabel labelList={pathway.categories} />
              </span>
            </p>
            <p className="pf-v5-u-mb-lg">{pathway.description}</p>
          </PageHeader>
          <section className="pf-v5-u-p-lg">
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
      <section className="pf-v5-u-px-lg pf-v5-u-pb-lg">
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
                <RulesTable />
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
                  SID={SID}
                  isImmutableTabOpen={isImmutableTabOpen}
                  tabPathname={`/insights/advisor/recommendations/pathways/${pathwayName}`}
                  edgeSystemsCount={edgeSystemsCount}
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
