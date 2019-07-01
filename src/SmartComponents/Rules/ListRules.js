import React, { Component } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import * as AppActions from '../../AppActions';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';

class ListRules extends Component {
    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.props.setBreadcrumbs([{ title: 'Rules', navigate: '/rules' }]);
    }

    render = () => <>
        <PageHeader>
            <PageHeaderTitle title='Rules'/>
        </PageHeader>
        <RulesTable/></>;
}

ListRules.displayName = 'list-rules';
ListRules.propTypes = {
    setBreadcrumbs: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    setBreadcrumbs: (obj) => AppActions.setBreadcrumbs(obj)
}, dispatch);

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListRules));
