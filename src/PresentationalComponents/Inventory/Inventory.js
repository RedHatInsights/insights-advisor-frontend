import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import * as pfReactTable from '@patternfly/react-table';
import registryDecorator from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import Loading from '../../PresentationalComponents/Loading/Loading';
import PropTypes from 'prop-types';

@registryDecorator()
class Inventory extends React.Component {
    state = {
        Inventory: () => <Loading/>
    };

    componentWillMount () {
        this.fetchInventory();
    }

    async fetchInventory () {
        const items = this.props.items;
        const {
            inventoryConnector,
            mergeWithEntities
        } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            reactCore,
            reactIcons,
            pfReactTable
        });

        this.getRegistry().register({
            ...mergeWithEntities()
        });

        this.setState({
            Inventory: inventoryConnector().InventoryTable,
            items: [...items.slice(0, 50)],
            page: 1,
            total: items.length,
            pageSize: 50
        });
    }

    onRefresh = ({ page, per_page: perPage })  => {
        const { items } = this.props;

        this.setState({
            page,
            pageSize: perPage,
            items: [...items.slice((page - 1) * perPage, page * perPage)]
        });
    }

    render () {
        const { Inventory, items, page, total, pageSize } = this.state;

        return (
            <Inventory
                items={ items }
                onRefresh={ this.onRefresh }
                page={ page }
                total={ total }
                perPage={ pageSize }
            >
                { this.props.children }
            </Inventory>
        );
    }
}

Inventory.propTypes = {
    items: PropTypes.array,
    children: PropTypes.any

};

export default Inventory;
