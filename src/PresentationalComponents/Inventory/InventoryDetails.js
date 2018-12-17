import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import { Main, registry as registryDecorator } from '@red-hat-insights/insights-frontend-components';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { entitiesDetailsReducer } from '../../AppReducer';

@registryDecorator()
class InventoryDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            InventoryDetails: () => <Loading />
        };

        this.fetchInventoryDetails();
    }

    async fetchInventoryDetails() {
        const { inventoryConnector, mergeWithDetail, INVENTORY_ACTION_TYPES } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            reactCore,
            reactIcons
        });

        this.getRegistry().register({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES))
        });

        this.setState({
            InventoryDetails: inventoryConnector().InventoryDetail
        });
    }

    render() {
        const { InventoryDetails } = this.state;
        return (
            <Main>
                <InventoryDetails root='/actions/:type/:id' />
            </Main>
        );
    }
}

export default InventoryDetails;
