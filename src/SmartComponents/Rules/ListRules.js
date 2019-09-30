import React, { Component } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageHeader, PageHeaderTitle, Main } from '@redhat-cloud-services/frontend-components';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import messages from '../../Messages';

class ListRules extends Component {
    async componentDidMount() {
        this.props.setBreadcrumbs([{ title: this.props.intl.formatMessage(messages.rulesTitle), navigate: '/rules' }]);
    }

    render = () => <React.Fragment>
        <PageHeader>
            <PageHeaderTitle title={this.props.intl.formatMessage(messages.rulesTitle)} />
        </PageHeader>
        <Main>
            <RulesTable />
        </Main>
    </React.Fragment>;
}

ListRules.displayName = 'list-rules';
ListRules.propTypes = {
    setBreadcrumbs: PropTypes.func,
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    setBreadcrumbs: (obj) => AppActions.setBreadcrumbs(obj)
}, dispatch);

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListRules)));
