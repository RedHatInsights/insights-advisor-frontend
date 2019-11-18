/* eslint camelcase: 0 */
import './Details.scss';

import * as AppActions from '../../AppActions';

import { AnsibeTowerIcon, BellSlashIcon, CaretDownIcon } from '@patternfly/react-icons';
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHead,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    Flex,
    FlexItem,
    Title,
    ToolbarGroup,
    ToolbarItem
} from '@patternfly/react-core';
import { BulkSelect, Main, PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import React, { Component } from 'react';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import RuleDetails from '../../PresentationalComponents/RuleDetails/RuleDetails';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

class OverviewDetails extends Component {
    state = {
        kbaDetails: {},
        kbaDetailsLoading: false,
        selected: false,
        selectedEntities: 0,
        actionsDropdownOpen: false,
        disableRuleModalOpen: false
    };

    async componentDidMount() {
        const { fetchRule, fetchRuleAck, fetchSystem, fetchTopics, match } = this.props;
        await fetchRule({ rule_id: match.params.id });
        fetchSystem({ rule_id: match.params.id });
        fetchTopics();
        this.setState({ selectedEntities: this.getSelectedItems().length });
        if (!this.props.rule.reports_shown && this.props.rule.rule_id) {
            fetchRuleAck({ rule_id: this.props.rule.rule_id });
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            this.setState({ selectedEntities: this.getSelectedItems().length });
        }
    }

    getSelectedItems = () => {
        const { entities, system } = this.props;
        if (!entities || !entities.loaded) {
            return [];
        }

        return (this.state.selectedEntities === system.host_ids.length) && this.state.selectedEntities > 1 ? system.host_ids
            : entities.rows.filter(entity => entity.selected === true).map(entity => entity.id);
    };

    remediationDataProvider = () => {
        return {
            issues: [{
                id: `advisor:${this.props.rule.rule_id}`,
                description: this.props.rule.description
            }],
            systems: this.getSelectedItems()
        };
    };

    onRemediationCreated = result => {
        this.props.addNotification(result.getNotification());
    };

    bulkOnClick = (selected, selectedEntities) => {
        this.setState({ selected, selectedEntities });
        this.props.selectEntity({ selected });
    }

    handleModalToggle = (disableRuleModalOpen) => {
        this.setState({ disableRuleModalOpen });
    }

    enableRule = async (rule) => {
        try {
            await API.delete(`${BASE_URL}/ack/${rule.rule_id}/`);
            this.props.fetchRule({ rule_id: this.props.match.params.id });
        } catch (error) {
            this.handleModalToggle(false);
            addNotification({
                variant: 'danger',
                dismissable: true,
                title: this.props.intl.formatMessage(messages.rulesTableHideReportsErrorDisabled),
                description: `${error}`
            });
        }
    }

    render() {
        const { match, ruleFetchStatus, rule, systemFetchStatus, system, intl, entities, topics, ruleAck } = this.props;
        const { selected, selectedEntities, disableRuleModalOpen, actionsDropdownOpen } = this.state;
        const bulkSelectMenuItems = [{
            title: intl.formatMessage(messages.selectNone),
            onClick: () => this.bulkOnClick(false, 0)
        },
        {
            title: intl.formatMessage(messages.selectPage, { items: entities && entities.count || 0 }),
            onClick: () => this.bulkOnClick(true, entities && entities.count || 0)
        },
        {
            title: intl.formatMessage(messages.selectAll, { items: system && system.host_ids && system.host_ids.length || 0 }),
            onClick: () => this.bulkOnClick(true, system && system.host_ids && system.host_ids.length || 0)
        }];

        return (
            <React.Fragment>
                <DisableRule
                    handleModalToggle={this.handleModalToggle}
                    isModalOpen={disableRuleModalOpen}
                    rule={rule}
                    afterDisableFn={() => this.props.fetchRule({ rule_id: this.props.match.params.id })}
                />
                {ruleFetchStatus === 'fulfilled' && (
                    <React.Fragment>
                        <PageHeader className='pageHeaderOverride'>
                            <Breadcrumbs
                                current={rule.description || ''}
                                match={match}
                            />
                        </PageHeader>
                        <Main className='pf-m-light pf-u-pt-sm'>
                            <RuleDetails rule={rule} topics={topics} header={
                                <React.Fragment>
                                    <PageHeaderTitle title={<span>
                                        {!rule.reports_shown && <Badge isRead>
                                            <BellSlashIcon size='md' />&nbsp;
                                            {intl.formatMessage(messages.disabled)}
                                        </Badge>}
                                        {rule.description}
                                    </span>} />
                                    <p>{intl.formatMessage(
                                        messages.rulesDetailsPubishdate, { date: (new Date(rule.publish_date)).toLocaleDateString() }
                                    )}</p>
                                </React.Fragment>
                            }>
                                <Flex>
                                    <FlexItem breakpointMods={[{ modifier: 'align-right' }]}>
                                        <Dropdown
                                            onSelect={() => { this.setState({ actionsDropdownOpen: !actionsDropdownOpen }); }}
                                            toggle={<DropdownToggle
                                                onToggle={(actionsDropdownOpen) => { this.setState({ actionsDropdownOpen }); }}
                                                iconComponent={CaretDownIcon}>Actions
                                            </DropdownToggle>}
                                            isOpen={actionsDropdownOpen}
                                            dropdownItems={rule && rule.reports_shown ?
                                                [<DropdownItem key="link"
                                                    onClick={() => { this.handleModalToggle(true); }}>
                                                    {intl.formatMessage(messages.disableRule)}</DropdownItem>]
                                                : [<DropdownItem key="link"
                                                    onClick={() => { this.enableRule(rule); }}>
                                                    {intl.formatMessage(messages.enableRule)}</DropdownItem>]
                                            }
                                        />
                                    </FlexItem>
                                </Flex>
                            </RuleDetails>
                        </Main>
                    </React.Fragment>
                )}
                {ruleFetchStatus === 'pending' && (<Loading />)}
                <Main>
                    <React.Fragment>
                        {ruleFetchStatus === 'fulfilled' && rule.reports_shown ?
                            <React.Fragment>
                                <Title headingLevel="h3" size="2xl" className='titlePaddingOverride'>
                                    {intl.formatMessage(messages.affectedSystems)}
                                </Title>
                                {systemFetchStatus === 'fulfilled' && (
                                    <Inventory tableProps={{ canSelectAll: false }} items={system.host_ids}>
                                        {rule.playbook_count > 0 &&
                                            <ToolbarGroup>
                                                <ToolbarItem className='pf-u-mr-sm'>
                                                    <BulkSelect count={selectedEntities}
                                                        items={bulkSelectMenuItems}
                                                        checked={selected}
                                                        onChange={() => {
                                                            this.bulkOnClick(!selected, !selected ?
                                                                system && system.host_ids && system.host_ids.length : 0);
                                                        }} />
                                                </ToolbarItem>
                                                <ToolbarItem>
                                                    <RemediationButton
                                                        isDisabled={selectedEntities === 0}
                                                        dataProvider={this.remediationDataProvider}
                                                        onRemediationCreated={this.onRemediationCreated}
                                                    >
                                                        <AnsibeTowerIcon size='sm' color={global_BackgroundColor_100.value} />
                                                        &nbsp;{intl.formatMessage(messages.remediate)}
                                                    </RemediationButton>
                                                </ToolbarItem>
                                            </ToolbarGroup>
                                        }
                                    </Inventory>
                                )}
                                {systemFetchStatus === 'pending' && (<Loading />)}
                            </React.Fragment>
                            : <React.Fragment>
                                <Card className='cardBorderOverride'>
                                    <CardHead>
                                        <BellSlashIcon size='sm' />&nbsp;{intl.formatMessage(messages.ruleIsDisabled)}</CardHead>
                                    <CardBody>
                                        <p>
                                            {intl.formatMessage(messages.ruleIsDisabledJustification)}
                                            <i>{ruleAck.justification || intl.formatMessage(messages.none)}</i>
                                            {ruleAck.updated_at && <span>&nbsp;({new Date(ruleAck.updated_at).toLocaleDateString()})</span>}
                                        </p>
                                        <Button isInline variant='link'
                                            onClick={() => { this.enableRule(rule); }}>
                                            {intl.formatMessage(messages.enableRule)}
                                        </Button>
                                    </CardBody>
                                </Card>
                                <MessageState icon={BellSlashIcon} size='sm'
                                    title={intl.formatMessage(messages.ruleIsDisabled)}
                                    text={intl.formatMessage(messages.ruleIsDisabledBody)} />
                            </React.Fragment>
                        }
                        {ruleFetchStatus === 'pending' && (<Loading />)}
                        {ruleFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.rulesTableFetchRulesError)} />)}
                    </React.Fragment>
                </Main>
            </React.Fragment>
        );
    }
}

OverviewDetails.propTypes = {
    match: PropTypes.any,
    fetchRule: PropTypes.func,
    ruleFetchStatus: PropTypes.string,
    rule: PropTypes.object,
    fetchSystem: PropTypes.func,
    systemFetchStatus: PropTypes.string,
    system: PropTypes.object,
    entities: PropTypes.any,
    addNotification: PropTypes.func.isRequired,
    intl: PropTypes.any,
    selectEntity: PropTypes.func,
    fetchTopics: PropTypes.func,
    topics: PropTypes.array,
    ruleAck: PropTypes.object,
    fetchRuleAck: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    system: state.AdvisorStore.system,
    systemFetchStatus: state.AdvisorStore.systemFetchStatus,
    entities: state.entities,
    topics: state.AdvisorStore.topics,
    ruleAck: state.AdvisorStore.ruleAck,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url)),
    fetchSystem: (url) => dispatch(AppActions.fetchSystem(url)),
    addNotification: data => dispatch(addNotification(data)),
    selectEntity: (payload) => dispatch({ type: 'SELECT_ENTITY', payload }),
    fetchTopics: () => dispatch(AppActions.fetchTopics()),
    fetchRuleAck: data => dispatch(AppActions.fetchRuleAck(data))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDetails)));
