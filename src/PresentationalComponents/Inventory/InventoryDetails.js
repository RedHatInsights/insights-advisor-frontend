import '@redhat-cloud-services/frontend-components-inventory-insights/index.css';

import {
  AppInfo,
  DetailWrapper,
  InventoryDetailHead,
} from '@redhat-cloud-services/frontend-components/Inventory';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/js/layouts/Grid/index';
import React, { useEffect } from 'react';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { entitiesDetailsReducer } from '../../AppReducer';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import { useIntl } from 'react-intl';

const InventoryDetails = ({ entity, match }) => {
  const intl = useIntl();

  useEffect(() => {
    if (entity && (entity.display_name || entity.id)) {
      const subnav = `${entity.display_name || entity.id} - ${
        messages.systems.defaultMessage
      }`;
      document.title = intl.formatMessage(messages.documentTitle, { subnav });
    }
  }, [entity]);

  return (
    <DetailWrapper
      onLoad={({ mergeWithDetail, INVENTORY_ACTION_TYPES }) => {
        getRegistry().register({
          ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES)),
        });
      }}
    >
      <PageHeader className="pf-m-light ins-inventory-detail">
        {entity && (
          <Breadcrumbs
            current={entity.display_name || entity.id}
            match={match}
          />
        )}
        <InventoryDetailHead hideBack fallback="" />
      </PageHeader>
      <Main>
        <Grid hasGutter>
          <GridItem span={12}>
            <AppInfo fallback="" />
          </GridItem>
        </Grid>
      </Main>
    </DetailWrapper>
  );
};

InventoryDetails.propTypes = {
  history: PropTypes.object,
  entity: PropTypes.object,
  addAlert: PropTypes.func,
  match: PropTypes.any,
};

const mapStateToProps = ({ entityDetails, props }) => ({
  entity: entityDetails && entityDetails.entity,
  ...props,
});

export default routerParams(connect(mapStateToProps, null)(InventoryDetails));
