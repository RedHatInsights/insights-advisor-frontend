import '@redhat-cloud-services/frontend-components-inventory-insights/index.css';

import * as pfReactTable from '@patternfly/react-table';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import * as reactRouterDom from 'react-router-dom';

import React, { useEffect, useState } from 'react';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import { PageHeader } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { entitiesDetailsReducer } from '../../AppReducer';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const InventoryDetails = ({ entity, match }) => {
    const [InventoryDetail, setInventoryDetail] = useState();
    const [AppInfo, setAppInfo] = useState();

    const fetchInventoryDetails = async () => {
        const { inventoryConnector, mergeWithDetail, INVENTORY_ACTION_TYPES } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            reactCore,
            reactIcons,
            pfReactTable
        });
        const { InventoryDetailHead, AppInfo } = inventoryConnector();

        getRegistry().register({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES))
        });
        setInventoryDetail(() => InventoryDetailHead);
        setAppInfo(() => AppInfo);
    };

    useEffect(() => { fetchInventoryDetails(); }, []);

    return <React.Fragment>
        <PageHeader className="pf-m-light ins-inventory-detail">
            {entity && <Breadcrumbs
                current={entity.display_name || entity.id}
                match={match}
            />}
            {InventoryDetail && <InventoryDetail hideBack />}
        </PageHeader>
        <Main>
            <reactCore.Grid gutter="md">
                <reactCore.GridItem span={12}>
                    {AppInfo && <AppInfo />}
                </reactCore.GridItem>
            </reactCore.Grid>
        </Main>
    </React.Fragment>;
};

InventoryDetails.contextTypes = {
    store: PropTypes.object
};

InventoryDetails.propTypes = {
    history: PropTypes.object,
    entity: PropTypes.object,
    addAlert: PropTypes.func,
    match: PropTypes.any
};

const mapStateToProps = ({ entityDetails, props }) => ({
    entity: entityDetails && entityDetails.entity,
    ...props
});

export default routerParams(connect(mapStateToProps, null)(InventoryDetails));
