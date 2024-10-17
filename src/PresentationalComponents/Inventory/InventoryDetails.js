import {
  DetailWrapper,
  InventoryDetailHead,
} from '@redhat-cloud-services/frontend-components/Inventory';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';
import React, { useEffect } from 'react';
import { connect, useStore } from 'react-redux';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import PropTypes from 'prop-types';
import { entitiesDetailsReducer } from '../../Store/AppReducer';
import messages from '../../Messages';
import { updateReducers } from '../../Store';
import { useIntl } from 'react-intl';
import SystemAdvisor from '../../SmartComponents/SystemAdvisor';
import { useParams } from 'react-router-dom';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { Skeleton } from '@patternfly/react-core';

const InventoryHeadFallback = () => {
  return (
    <>
      <Skeleton width="70%" fontSize="xl" />
      <br />
      <Skeleton width="40%" fontSize="md" />
      <br />
      <Skeleton width="55%" fontSize="md" />
      <br />
    </>
  );
};

const InventoryDetails = ({ entity }) => {
  const intl = useIntl();
  const store = useStore();
  const { inventoryId } = useParams();
  const chrome = useChrome();
  useEffect(() => {
    if (entity && (entity.display_name || entity.id)) {
      chrome.updateDocumentTitle(
        `${entity.display_name || entity.id} - Systems - Advisor`
      );
    }
  }, [entity, chrome]);

  return (
    <DetailWrapper
      onLoad={({ mergeWithDetail, INVENTORY_ACTION_TYPES }) => {
        store.replaceReducer(
          updateReducers({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES)),
          })
        );
      }}
      inventoryId={inventoryId}
    >
      <PageHeader className="pf-m-light ins-inventory-detail">
        {entity && <Breadcrumbs current={entity.display_name || entity.id} />}
        <InventoryDetailHead hideBack fallback={<InventoryHeadFallback />} />
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
        <Title className="pf-v5-u-mb-lg" headingLevel="h3" size="2xl">
          {intl.formatMessage(messages.recommendations)}
        </Title>
        <Grid hasGutter>
          <GridItem span={12}>
            <SystemAdvisor fallback="" inventoryId={inventoryId} />
          </GridItem>
        </Grid>
      </section>
    </DetailWrapper>
  );
};

InventoryDetails.propTypes = {
  history: PropTypes.object,
  entity: PropTypes.object,
  addAlert: PropTypes.func,
};

const mapStateToProps = ({ entityDetails, props }) => ({
  entity: entityDetails && entityDetails.entity,
  ...props,
});

export default connect(mapStateToProps, null)(InventoryDetails);
