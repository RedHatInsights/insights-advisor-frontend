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
            inventoryReportFetchStatus: 'pending',
            entity: this.props.entityDetails.entity,
            inventoryReport: {}
        };

        this.fetchEntityRules();
    }

    async fetchEntityRules () {
        try {
            const inventoryReport = (await API.get(`${SYSTEM_FETCH_URL}${this.state.entity.canonical_facts['machine-id']}/reports`)).data;
            this.setState({
                inventoryReport,
                inventoryReportFetchStatus: 'fulfilled'
            });
        } catch (error) {
            this.props.addNotification({
                variant: 'danger',
                dismissable: true,
                title: '',
                description: 'Inventory item rule fetch failed.'
            });
            this.setState({
                inventoryReportFetchStatus: 'failed'
            });
        }
    }

    expandAll (expanded) {
        this.setState({ expanded: !expanded });
    }

    render () {
        const { inventoryReport, inventoryReportFetchStatus, expanded } = this.state;
        return (
            <>
                <div className="pf-u-display-flex pf-u-flex-direction-row-reverse">
                    <a onClick={ e => {
                        e.preventDefault();
                        this.expandAll(this.state.expanded);
                    } } rel="noopener">{ (expanded ? `Collapse All` : `Expand All`) }</a>
                </div>
                { inventoryReportFetchStatus === 'pending' && (<Loading/>) }
                { inventoryReportFetchStatus === 'fulfilled' && (
                    inventoryReport.active_reports.map((report, key) =>
                        <ExpandableRulesCard key={ key } report={ report } isExpanded={ expanded }/>
                    )
                ) }
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
