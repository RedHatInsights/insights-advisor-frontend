import '@redhat-cloud-services/frontend-components-inventory-insights/index.css';

import * as pfReactTable from '@patternfly/react-table';
import * as reactRouterDom from 'react-router-dom';
import * as ReactRedux from 'react-redux';
import { reactCore } from '@redhat-cloud-services/frontend-components-utilities/files/inventoryDependencies';

import { Grid, GridItem } from '@patternfly/react-core/dist/js/layouts/Grid/index';
import React, { useEffect, useState } from 'react';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import { PageHeader } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { entitiesDetailsReducer } from '../../AppReducer';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { useStore } from 'react-redux';

const InventoryDetails = ({ entity, match }) => {
    const [InventoryDetail, setInventoryDetail] = useState();
    const [AppInfo, setAppInfo] = useState();
    const [InvWrapper, setInvWrapper] = useState();
    const store = useStore();

    const fetchInventoryDetails = async () => {
        const { inventoryConnector, mergeWithDetail, INVENTORY_ACTION_TYPES } = await insights.loadInventory({
            ReactRedux,
            react: React,
            reactRouterDom,
            pfReactTable,
            pfReact: reactCore
        });
        const { InventoryDetailHead, AppInfo, DetailWrapper } = inventoryConnector(store);

        getRegistry().register({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES))
        });
        setInventoryDetail(() => InventoryDetailHead);
        setAppInfo(() => AppInfo);
        setInvWrapper(() => DetailWrapper);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchInventoryDetails(); }, []);
    const Wrapper = InvWrapper || React.Fragment;

    return <Wrapper>
        <PageHeader className="pf-m-light ins-inventory-detail">
            {entity && <Breadcrumbs
                current={entity.display_name || entity.id}
                match={match}
            />}
            {InventoryDetail && <InventoryDetail hideBack />}
        </PageHeader>
        <Main>
            <Grid hasGutter>
                <GridItem span={12}>
                    {AppInfo && <AppInfo />}
                </GridItem>
            </Grid>
        </Main>
    </Wrapper>;
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
