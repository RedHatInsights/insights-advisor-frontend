import {
  DetailWrapper,
  InventoryDetailHead,
} from '@redhat-cloud-services/frontend-components/Inventory';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/js/layouts/Grid/index';
import React, { useEffect } from 'react';
import { connect, useStore } from 'react-redux';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import PropTypes from 'prop-types';
import { entitiesDetailsReducer } from '../../Store/AppReducer';
import messages from '../../Messages';
import { updateReducers } from '../../Store';
import { useIntl } from 'react-intl';
import SystemAdvisor from '../../SmartComponents/SystemAdvisor';
import { useParams } from 'react-router-dom';

const InventoryDetails = ({ entity }) => {
  const intl = useIntl();
  const store = useStore();
  const { inventoryId } = useParams();
  useEffect(() => {
    if (entity && (entity.display_name || entity.id)) {
      const subnav = `${entity.display_name || entity.id} - ${
        messages.systems.defaultMessage
      }`;
      document.title = intl.formatMessage(messages.documentTitle, { subnav });
    }
  }, [entity, intl]);

  return (
    <DetailWrapper
      onLoad={({ mergeWithDetail, INVENTORY_ACTION_TYPES }) => {
        store.replaceReducer(
          updateReducers({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES)),
          })
        );
      }}
    >
      <PageHeader className="pf-m-light ins-inventory-detail">
        {entity && <Breadcrumbs current={entity.display_name || entity.id} />}
        <InventoryDetailHead hideBack fallback="" />
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <Title className="pf-u-mb-lg" headingLevel="h3" size="2xl">
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
