import './Details.scss';

import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Resolution,
  TotalRisk,
} from '../../PresentationalComponents/Cards/Pathways';
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
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import messages from '../../Messages';
import { useGetPathwayQuery } from '../../Services/Pathways';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { useLocation } from 'react-router-dom';

const RulesTable = lazy(() =>
  import(
    /* webpackChunkName: 'RulesTable' */ '../../PresentationalComponents/RulesTable/RulesTable'
  )
);

const PathwayDetails = () => {
  const intl = useIntl();
  const pathwayName = useParams().id;
  const dispatch = useDispatch();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const recFilters = useSelector(({ filters }) => filters.recState);
  const sysFilters = useSelector(({ filters }) => filters.sysState);

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

  return (
    <React.Fragment>
      {isFetching ? (
        <Loading />
      ) : (
        <React.Fragment>
          <PageHeader className="adv-c-page__header">
            <Breadcrumbs
              ouiaId="override"
              current={pathway.description || ''}
            />
            <CategoryLabel labelList={pathway.categories} />
            <PageHeaderTitle
              title={
                <React.Fragment>
                  {pathway.description}
                  {pathway.has_incident && (
                    <RuleLabels rule={{ tags: 'incident' }} />
                  )}
                </React.Fragment>
              }
            />
            <p className="pf-u-mb-lg">
              {intl.formatMessage(messages.rulesDetailsModifieddate, {
                date: (
                  <DateFormat
                    date={new Date(pathway.publish_date)}
                    type="onlyDate"
                  />
                ),
              })}
            </p>
          </PageHeader>
          <Main className="pf-u-pb-0">
            <Grid hasGutter>
              <GridItem sm={12} md={6}>
                <TotalRisk {...pathway} />
              </GridItem>
              <GridItem sm={12} md={6}>
                <Resolution {...pathway} />
              </GridItem>
            </Grid>
          </Main>
        </React.Fragment>
      )}
      {isFetching && <Loading />}
      <Main>
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
                <Inventory
                  tableProps={{
                    canSelectAll: false,
                    isStickyHeader: true,
                  }}
                  pathway={pathway}
                  selectedTags={selectedTags}
                  workloads={workloads}
                  SID={SID}
                  showTags={true}
                />
              </Suspense>
            )}
          </Tab>
        </Tabs>
      </Main>
    </React.Fragment>
  );
};

export default PathwayDetails;
