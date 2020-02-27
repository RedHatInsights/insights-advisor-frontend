import './InsightsTabs.scss';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Component } from 'react';
import { Tab, TabsVariant } from '@patternfly/react-core/dist/js/components/Tabs/index';

import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import PropTypes from 'prop-types';
import { Tabs } from '@patternfly/react-core/dist/js/components/Tabs/Tabs';
import asyncComponent from '../../Utilities/asyncComponent';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const RulesTable = asyncComponent(() => import(/* webpackChunkName: "RulesTable" */ '../../PresentationalComponents/RulesTable/RulesTable'));
const SystemsTable = asyncComponent(() => import(/* webpackChunkName: "SystemsTable" */ '../../PresentationalComponents/SystemsTable/SystemsTable'));
const TagsToolbar = asyncComponent(() => import(/* webpackChunkName: "TagsToolbar" */ '../../PresentationalComponents/TagsToolbar/TagsToolbar'));

class InsightsTabs extends Component {
    state = {
        activeTab: {},
        tabs: {
            rules: { title: this.props.intl.formatMessage(messages.rules), to: '/rules', component: <RulesTable /> },
            systems: { title: this.props.intl.formatMessage(messages.systems), to: '/rules/systems', component: <SystemsTable /> }
        }
    };

    async componentDidMount() {
        const tabType = location.pathname.slice(location.pathname.indexOf('insights/')).split('/')[2] === 'systems' ? 'systems' : 'rules';
        const activeTab = this.state.tabs[tabType];
        this.setState({ activeTab });
    }

    handleTabClick = (event, tabKey) => {
        const activeTab = this.state.tabs[tabKey];
        this.setState({ activeTab });
        this.props.history.push(activeTab.to);
    }

    render = () => {
        const { tabs, activeTab } = this.state;
        return <React.Fragment>
            <TagsToolbar />
            <PageHeader>
                <PageHeaderTitle title={this.props.intl.formatMessage(messages.rules)} />
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
                            {activeTab.title === item[1].title && item[1].component}
                        </Main>
                    </Tab>)
                }
            </Tabs>
            }
        </React.Fragment>;
    }
}

InsightsTabs.displayName = 'insights-tabs';
InsightsTabs.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    intl: PropTypes.any
};

export default injectIntl(routerParams(InsightsTabs));
