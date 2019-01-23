import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Main, PageHeader, registry as registryDecorator, routerParams } from '@red-hat-insights/insights-frontend-components';
import { entitiesDetailsReducer } from '../../AppReducer';
import Breadcrumbs, { buildBreadcrumbs } from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import Loading from '../../PresentationalComponents/Loading/Loading';

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
        const { InventoryDetailHead, AppInfo, VulnerabilitiesStore } = inventoryConnector();

        this.getRegistry().register({
            ...mergeWithDetail(entitiesDetailsReducer(INVENTORY_ACTION_TYPES))
        });
        VulnerabilitiesStore && this.getRegistry().register({ VulnerabilitiesStore });
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
        const { breadcrumbs, entity } = this.props;
        return (
            <>
                <PageHeader className="pf-m-light ins-inventory-detail">
                    { entity && <Breadcrumbs
                        current={ entity.display_name || entity.id }
                        items={ buildBreadcrumbs(this.props.match, { breadcrumbs }) }
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
    breadcrumbs: PropTypes.array,
    match: PropTypes.any
};

function mapStateToProps (store) {
    return {
        entity: store.entityDetails && store.entityDetails.entity,
        breadcrumbs: store.AdvisorStore.breadcrumbs
    };
}

export default routerParams(connect(mapStateToProps, null)(InventoryDetails));
