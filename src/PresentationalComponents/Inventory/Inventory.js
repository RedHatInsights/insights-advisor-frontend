import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import { registry } from '@red-hat-insights/insights-frontend-components';
import Loading from '../../PresentationalComponents/Loading/Loading';
import PropTypes from 'prop-types';

@registry()
class Inventory extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            Inventory: () => <Loading/>
        };

        this.fetchInventory = this.fetchInventory.bind(this);
        this.fetchInventory();
    }

    async fetchInventory () {
        const items = this.props.items;
        const { inventoryConnector, mergeWithEntities, mergeWithDetail } = await window.insights.loadInventory({
            react: React,
            reactRouterDom,
            reactCore,
            reactIcons
        });

        this.getRegistry().register({
            ...mergeWithEntities(),
            ...mergeWithDetail()
        });

        this.setState({
            Inventory: inventoryConnector(),
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
