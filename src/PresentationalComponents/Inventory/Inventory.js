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
    state = {
        Inventory: () => <Loading/>
    };

    componentWillMount () {
        this.fetchInventory();
    }

    async fetchInventory () {
        const items = this.props.items;
        const pagination = await{ PaginationRow };
        const {
            inventoryConnector,
            mergeWithEntities
        } = await insights.loadInventory({
            react: React,
            pfReact: pagination,
            reactRouterDom,
            reactCore,
            reactIcons
        });

        this.getRegistry().register({
            ...mergeWithEntities()
        });

        this.setState({
            Inventory: inventoryConnector().InventoryTable,
            items: [ ...items.slice(0, 50) ],
            page: 1,
            total: items.length,
            pageSize: 50
        });
    }

    onRefresh = ({ page, per_page: perPage })  => {
        const { items } = this.props;

        this.setState({
            page,
            perPage,
            items: [ ...items.slice(page - 1 * perPage, page * perPage) ]
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
