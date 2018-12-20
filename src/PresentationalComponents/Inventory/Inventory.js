import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import { PaginationRow } from 'patternfly-react';
import { registry as registryDecorator } from '@red-hat-insights/insights-frontend-components';
import Loading from '../../PresentationalComponents/Loading/Loading';
import PropTypes from 'prop-types';

@registryDecorator()
class Inventory extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            Inventory: () => <Loading/>
        };

        this.fetchInventory();
    }

    async fetchInventory () {
        const items = this.props.items;
        const {
            inventoryConnector,
            mergeWithEntities
        } = await insights.loadInventory({
            react: React,
            pfReact: { PaginationRow },
            reactRouterDom,
            reactCore,
            reactIcons
        });

        this.getRegistry().register({
            ...mergeWithEntities()
        });

        this.setState({
            Inventory: inventoryConnector().InventoryTable,
            items
        });
    }

    render () {
        const { Inventory, items } = this.state;

        return (
            <Inventory items={ items } />
        );
    }
}

Inventory.propTypes = {
    items: PropTypes.array
};

export default Inventory;
