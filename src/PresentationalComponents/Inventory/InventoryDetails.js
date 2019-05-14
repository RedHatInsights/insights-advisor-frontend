import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import registryDecorator from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { Main, PageHeader } from '@redhat-cloud-services/frontend-components';
import { entitiesDetailsReducer } from '../../AppReducer';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import Loading from '../../PresentationalComponents/Loading/Loading';
import '@redhat-cloud-services/frontend-components-inventory-insights/index.css';

@registryDecorator()
class InventoryDetails extends React.Component {
    state = { InventoryDetails: () => <Loading/> };

    componentDidMount () {
        this.fetchInventoryDetails();
    }

    async fetchInventoryDetails () {
        const { inventoryConnector, mergeWithDetail, INVENTORY_ACTION_TYPES } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            reactCore,
            reactIcons
        });
        const { InventoryDetailHead, AppInfo } = inventoryConnector();

        this.getRegistry().register({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES))
        });
        this.setState({
            InventoryDetail: InventoryDetailHead, AppInfo
        });
    }

    onNavigate (navigateTo) {
        const { history } = this.props;
        history.push(`/${navigateTo}`);
    }

    render () {
        const { InventoryDetail, AppInfo } = this.state;
        const { entity } = this.props;
        return (
            <>
                <PageHeader className="pf-m-light ins-inventory-detail">
                    { entity && <Breadcrumbs
                        current={ entity.display_name || entity.id }
                        match={ this.props.match }
                    /> }
                    { InventoryDetail && <InventoryDetail hideBack/> }
                </PageHeader>
                <Main>
                    <reactCore.Grid gutter="md">
                        <reactCore.GridItem span={ 12 }>
                            { AppInfo && <AppInfo/> }
                        </reactCore.GridItem>
                    </reactCore.Grid>
                </Main>
            </>
        );
    }
}

InventoryDetails.contextTypes = {
    store: PropTypes.object
};

InventoryDetails.propTypes = {
    history: PropTypes.object,
    entity: PropTypes.object,
    addAlert: PropTypes.func,
    match: PropTypes.any
};

function mapStateToProps (store) {
    return {
        entity: store.entityDetails && store.entityDetails.entity
    };
}

export default routerParams(connect(mapStateToProps, null)(InventoryDetails));
