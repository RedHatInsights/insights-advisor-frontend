import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import { registry } from '@red-hat-insights/insights-frontend-components';
import Loading from '../../PresentationalComponents/Loading/Loading';

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
            Inventory: inventoryConnector()
        });
    }

    render () {
        const { Inventory } = this.state;
        return (
            <Inventory/>
        );
    }
}

export default Inventory;
