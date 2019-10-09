import React, { Component } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageHeader, PageHeaderTitle, Main } from '@redhat-cloud-services/frontend-components';
import { Tabs, Tab, TabsVariant } from '@patternfly/react-core';
import { injectIntl } from 'react-intl';

import asyncComponent from '../../Utilities/asyncComponent';
import * as AppActions from '../../AppActions';
import messages from '../../Messages';

const RulesTable = asyncComponent(() => import(/* webpackChunkName: "RulesTAble" */ '../../PresentationalComponents/RulesTable/RulesTable'));
const SystemsTable = asyncComponent(() => import(/* webpackChunkName: "SystemsTable" */ '../../PresentationalComponents/SystemsTable/SystemsTable'));

import './InsightsTabs.scss';

class InsightsTabs extends Component {
    state = {
        activeTab: {},
        tabs: {
            rules: { title: this.props.intl.formatMessage(messages.rulesTitle), to: '/rules', component: <RulesTable /> },
            systems: { title: this.props.intl.formatMessage(messages.systems), to: '/systems', component: <SystemsTable /> }
        }
    };

    async componentDidMount() {
        const path = location.pathname.slice(location.pathname.indexOf('insights/')).split('/')[1];
        const activeTab = this.state.tabs[path];
        this.props.setBreadcrumbs([{ title: activeTab.title, navigate: activeTab.to }]);
        this.setState({ activeTab });
    }

    handleTabClick = (event, tabKey) => {
        const activeTab = this.state.tabs[tabKey];
        this.setState({ activeTab });
        this.props.history.push(activeTab.to);
    }

    render = () => {
        const { tabs, activeTab } = this.state;
        return <>
            <PageHeader>
                <PageHeaderTitle title={this.props.intl.formatMessage(messages.rulesTitle)} />
            </PageHeader>
            {activeTab.title && <Tabs mountOnEnter unmountOnExit
                className='insights-tabs'
                activeKey={activeTab.title.toLowerCase()}
                onSelect={this.handleTabClick}
                aria-label="Insights Tabs"
                variant={TabsVariant.nav}
            >
                {Object.entries(tabs).map((item) =>
                    <Tab key={item[0]} eventKey={item[0]} title={item[1].title}>
                        <Main>
                            {activeTab.title === item[1].title && item[1].component }
                        </Main>
                    </Tab>)
                }
            </Tabs>
            }
        </>;
    }
}

InsightsTabs.displayName = 'insights-tabs';
InsightsTabs.propTypes = {
    setBreadcrumbs: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    intl: PropTypes.any
};

const mapDispatchToProps = dispatch => bindActionCreators({
    setBreadcrumbs: (obj) => AppActions.setBreadcrumbs(obj)
}, dispatch);

export default injectIntl(routerParams(connect(
    null,
    mapDispatchToProps
)(InsightsTabs)));
