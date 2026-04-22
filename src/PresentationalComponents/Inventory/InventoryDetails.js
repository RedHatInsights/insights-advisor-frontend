import {
  DetailWrapper,
  InventoryDetailHead,
} from '@redhat-cloud-services/frontend-components/Inventory';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';
import React, { useContext, useEffect, useState } from 'react';
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
import { Skeleton, Bullseye } from '@patternfly/react-core';
import { EnvironmentContext } from '../../App';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import MessageState from '../MessageState/MessageState';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';

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
  const envContext = useContext(EnvironmentContext);
  const axios = useAxiosWithPlatformInterceptors();
  const addNotification = useAddNotification();
  const [systemExists, setSystemExists] = useState(true);
  const [checking, setChecking] = useState(true);

  /**
   * Check if the system exists in Advisor and has a valid last_seen value.
   * Systems with last_seen: null don't exist in Inventory and will cause
   * DetailWrapper to throw a 404 error. This check prevents that by validating
   * the system before attempting to render the DetailWrapper component.
   */
  useEffect(() => {
    const checkSystem = async () => {
      try {
        await axios.get(
          `${envContext.BASE_URL}/system/${inventoryId}/reports/`,
        );
        setSystemExists(true);
      } catch (error) {
        if (error.response?.status === 404) {
          setSystemExists(false);
        } else {
          setSystemExists(true);
        }
      } finally {
        setChecking(false);
      }
    };

    checkSystem();
  }, [inventoryId, axios, envContext.BASE_URL]);

  /**
   * Display a notification when a non-existent system is detected.
   * This runs after the check completes to inform the user why they're
   * seeing an empty state instead of system details.
   */
  useEffect(() => {
    if (!checking && !systemExists) {
      addNotification({
        variant: 'warning',
        title: 'System not available',
        description:
          'This system no longer exists in your inventory and cannot be displayed.',
      });
    }
  }, [checking, systemExists, addNotification]);

  useEffect(() => {
    if (entity && (entity.display_name || entity.id)) {
      envContext.updateDocumentTitle(
        `${entity.display_name || entity.id} - Systems - Advisor`,
      );
    }
  }, [envContext, entity]);

  if (checking) {
    return (
      <PageHeader className="pf-m-light ins-inventory-detail">
        <InventoryHeadFallback />
      </PageHeader>
    );
  }

  if (!systemExists) {
    return (
      <>
        <PageHeader className="pf-m-light ins-inventory-detail">
          <Breadcrumbs current="System not found" />
        </PageHeader>
        <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
          <Bullseye>
            <MessageState
              icon={ExclamationCircleIcon}
              title="System not available"
              text="This system no longer exists in your inventory."
            />
          </Bullseye>
        </section>
      </>
    );
  }

  return (
    <DetailWrapper
      onLoad={({ mergeWithDetail, INVENTORY_ACTION_TYPES }) => {
        store.replaceReducer(
          updateReducers({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES)),
          }),
        );
      }}
      inventoryId={inventoryId}
    >
      <PageHeader className="pf-m-light ins-inventory-detail">
        {entity && <Breadcrumbs current={entity.display_name || entity.id} />}
        <InventoryDetailHead hideBack fallback={<InventoryHeadFallback />} />
      </PageHeader>
      <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
        <Title className="pf-v6-u-mb-lg" headingLevel="h3" size="2xl">
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
