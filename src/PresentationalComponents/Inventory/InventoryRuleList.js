import React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { addNotification } from '@red-hat-insights/insights-frontend-components/components/Notifications';
import '@patternfly/patternfly-next/utilities/Display/display.css';
import '@patternfly/patternfly-next/utilities/Flex/flex.css';

import Loading from '../../PresentationalComponents/Loading/Loading';
import ExpandableRulesCard from '../../PresentationalComponents/Cards/ExpandableRulesCard';
import API from '../../Utilities/Api';
import { SYSTEM_FETCH_URL } from '../../AppConstants';

class InventoryRuleList extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,
            inventoryRulesFetchStatus: 'pending',
            entity: this.props.entityDetails.entity,
            inventoryRules: []
        };

        this.fetchEntityRules = this.fetchEntityRules.bind(this);
        this.fetchEntityRules();
        this.expandAll = this.expandAll.bind(this);
    }

    async fetchEntityRules () {
        try {
            const inventoryRules = (await API.get(`${SYSTEM_FETCH_URL}${this.state.entity.canonical_facts['machine-id']}/`)).data;
            this.setState({
                inventoryRules,
                inventoryRulesFetchStatus: 'fulfilled'
            });
        } catch (error) {
            this.props.addNotification({
                variant: 'danger',
                dismissable: true,
                title: '',
                description: 'Inventory item rule fetch failed.'
            });
            this.setState({
                inventoryRulesFetchStatus: 'failed'
            });
        }
    }

    expandAll () {
        this.setState({ expanded: !this.state.expanded });
    }

    render () {
        const { inventoryRules, inventoryRulesFetchStatus, expanded } = this.state;
        return (
            <>
                <div className="pf-u-display-flex pf-u-flex-direction-row-reverse">
                    <a onClick={ this.expandAll } rel="noopener">{ (expanded ? `Collapse All` : `Expand All`) }</a>
                </div>
                {inventoryRulesFetchStatus === 'pending' && (<Loading/>)}
                {inventoryRulesFetchStatus === 'fulfilled' && (
                    inventoryRules.map((rule, key) => <ExpandableRulesCard key={ key } rule={ rule } isExpanded={ expanded }/>)
                )}
            </>
        );
    }
}

InventoryRuleList.propTypes = {
    entityDetails: PropTypes.object,
    addNotification: PropTypes.func

};

const mapStateToProps = (state, ownProps) => ({
    entityDetails: state.entityDetails,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    addNotification: data => dispatch(addNotification(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InventoryRuleList);
