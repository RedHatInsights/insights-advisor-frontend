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
import React, { useCallback, useEffect, useState } from 'react';

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
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const OverviewDetails = ({ match, fetchRuleAck, fetchTopics, fetchSystem, fetchRule, ruleFetchStatus, rule, systemFetchStatus, system, intl, entities,
    topics, ruleAck, hostAcks, fetchHostAcks, selectEntity }) => {
    const [selected, setSelected] = useState(false);
    const [selectedEntities, setSelectedEntities] = useState(0);
    const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
    const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
    const [host, setHost] = useState(undefined);
    const [ruleHostAcks, setRuleHostAcks] = useState([]);
    const [viewSystemsModalOpen, setviewSystemsModalOpen] = useState(false);

    const getSelectedItems = useCallback(() => {
        return entities && entities.loaded ?
            selectedEntities === system.host_ids.length ? system.host_ids
                : entities.rows.filter(entity => entity.selected === true).map(entity => entity.id)
            : [];
    }, [entities, selectedEntities, system.host_ids]);

    const remediationDataProvider = () => ({
        issues: [{
            id: `advisor:${rule.rule_id}`,
            description: rule.description
        }],
        systems: getSelectedItems()
    });

    const onRemediationCreated = result => (addNotification(result.getNotification()));

    const bulkOnClick = (selected, selectedEntities) => {
        setSelectedEntities(selectedEntities);
        setSelected(selected);
        selectEntity({ selected });
    };

    const handleModalToggle = (disableRuleModalOpen, host = undefined) => {
        setDisableRuleModalOpen(disableRuleModalOpen);
        setHost(host);
    };

    const enableRule = async (rule) => {
        try {
            await API.delete(`${BASE_URL}/ack/${rule.rule_id}/`);
            fetchSystem({ rule_id: match.params.id });
            fetchRule({ rule_id: match.params.id });
        } catch (error) {
            handleModalToggle(false);
            addNotification({
                variant: 'danger',
                dismissable: true,
                title: intl.formatMessage(messages.rulesTableHideReportsErrorDisabled),
                description: `${error}`
            });
        }
    };

    const bulkSelectMenuItems = [{
        title: intl.formatMessage(messages.selectNone),
        onClick: () => bulkOnClick(false, 0)
    },
    {
        title: intl.formatMessage(messages.selectPage, { items: entities && entities.count || 0 }),
        onClick: () => bulkOnClick(true, entities && entities.count || 0)
    },
    {
        title: intl.formatMessage(messages.selectAll, { items: system && system.host_ids && system.host_ids.length || 0 }),
        onClick: () => bulkOnClick(true, system && system.host_ids && system.host_ids.length || 0)
    }];

    const afterViewSystemsFn = () => {
        fetchSystem({ rule_id: match.params.id });
    };

    const afterDisableFn = () => {
        setHost(undefined);
        fetchRule({ rule_id: match.params.id });
    };

    const actionResolver = () => ([{
        title: 'Disable rule for system',
        onClick: (event, rowIndex, item) => (handleModalToggle(true, item))
    }]);

    useEffect(() => {
        if (host === undefined) {
            fetchSystem({ rule_id: match.params.id });
            fetchHostAcks({ limit: 100000 });
        }
    }, [fetchHostAcks, fetchSystem, host, match.params.id]);

    useEffect(() => {
        fetchRule({ rule_id: match.params.id });
        fetchHostAcks({ limit: 100000 });
        fetchSystem({ rule_id: match.params.id });
        fetchTopics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!rule.reports_shown && rule.rule_id) {
            fetchRuleAck({ rule_id: rule.rule_id });
        }
    }, [fetchRuleAck, rule.reports_shown, rule.rule_id]);

    useEffect(() => {
        setSelectedEntities(getSelectedItems().length);
    }, [getSelectedItems]);

    useEffect(() => {
        if (hostAcks && hostAcks.data) {
            setRuleHostAcks(hostAcks.data.filter(item => item.rule === rule.rule_id));
        }
    }, [hostAcks, rule.rule_id]);

    return <React.Fragment>
        {viewSystemsModalOpen && <ViewHostAcks
            handleModalToggle={(toggleModal) => setviewSystemsModalOpen(toggleModal)}
            isModalOpen={viewSystemsModalOpen}
            afterFn={afterViewSystemsFn}
            rule={rule}
        />}
        {disableRuleModalOpen && <DisableRule
            handleModalToggle={handleModalToggle}
            isModalOpen={disableRuleModalOpen}
            rule={rule}
            afterFn={afterDisableFn}
            host={host} />
        }
        {ruleFetchStatus === 'fulfilled' &&
            <React.Fragment>
                <PageHeader className='pageHeaderOverride'>
                    <Breadcrumbs
                        current={rule.description || ''}
                        match={match} />
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
                        </React.Fragment>}>
                        <Flex>
                            <FlexItem breakpointMods={[{ modifier: 'align-right' }]}>
                                <Dropdown
                                    onSelect={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                                    toggle={<DropdownToggle
                                        onToggle={(actionsDropdownOpen) => setActionsDropdownOpen(actionsDropdownOpen)}
                                        iconComponent={CaretDownIcon}>Actions
                                    </DropdownToggle>}
                                    isOpen={actionsDropdownOpen}
                                    dropdownItems={rule && rule.reports_shown ?
                                        [<DropdownItem key='link'
                                            onClick={() => { handleModalToggle(true); }}>
                                            {intl.formatMessage(messages.disableRule)}</DropdownItem>]
                                        : [<DropdownItem key='link'
                                            onClick={() => { enableRule(rule); }}>
                                            {intl.formatMessage(messages.enableRule)}</DropdownItem>]} />
                            </FlexItem>
                        </Flex>
                    </RuleDetails>
                </Main>
            </React.Fragment>}
        {ruleFetchStatus === 'pending' && (<Loading />)}
        <Main>
            <React.Fragment>
                {ruleFetchStatus === 'fulfilled' &&
                    <React.Fragment>
                        {(ruleHostAcks.length > 0 || !rule.reports_shown) && <Card className='cardBorderOverride'>
                            <CardHead>
                                <BellSlashIcon size='sm' />&nbsp;{intl.formatMessage(ruleHostAcks.length > 0 && rule.reports_shown ?
                                    messages.ruleIsDisabledForSystems : messages.ruleIsDisabled)}</CardHead>
                            <CardBody>
                                <p>
                                    {ruleHostAcks.length > 0 && rule.reports_shown ?
                                        <React.Fragment>
                                            {intl.formatMessage(messages.ruleIsDisabledForSystemsBody, { systems: ruleHostAcks.length })}
                                            &nbsp;
                                            <Button isInline variant='link' onClick={() => setviewSystemsModalOpen(true)}>
                                                {intl.formatMessage(messages.viewSystems)}
                                            </Button>
                                        </React.Fragment>
                                        : <React.Fragment>
                                            {intl.formatMessage(messages.ruleIsDisabledJustification)}
                                            <i>{ruleAck.justification || intl.formatMessage(messages.none)}</i>
                                            {ruleAck.updated_at && <span>&nbsp;({new Date(ruleAck.updated_at).toLocaleDateString()})</span>}
                                        </React.Fragment>}
                                </p>
                                {ruleHostAcks.length > 0 && rule.reports_shown ?
                                    // to be enabled with bulk actions
                                    // <Button isInline variant='link' onClick={() => enableRuleForSystems()}>
                                    //     {intl.formatMessage(messages.enableRuleForSystems)}
                                    // </Button>
                                    <React.Fragment></React.Fragment>
                                    : <Button isInline variant='link' onClick={() => enableRule(rule)}>
                                        {intl.formatMessage(messages.enableRule)}
                                    </Button>}
                            </CardBody>
                        </Card>}
                        {rule.reports_shown && <React.Fragment>
                            <Title headingLevel='h3' size='2xl'>
                                {intl.formatMessage(messages.affectedSystems)}
                            </Title>
                            {systemFetchStatus === 'fulfilled' &&
                                <Inventory tableProps={{ canSelectAll: false, actionResolver }} items={system.host_ids}>
                                    {rule.playbook_count > 0 &&
                                        <ToolbarGroup>
                                            <ToolbarItem className='pf-u-mr-sm'>
                                                <BulkSelect count={selectedEntities}
                                                    items={bulkSelectMenuItems}
                                                    checked={selected && selectedEntities === system.host_ids.length}
                                                    onChange={() => bulkOnClick(!selected, !selected ?
                                                        system && system.host_ids && system.host_ids.length : 0)} />
                                            </ToolbarItem>
                                            <ToolbarItem>
                                                <RemediationButton
                                                    isDisabled={selectedEntities === 0}
                                                    dataProvider={remediationDataProvider}
                                                    onRemediationCreated={onRemediationCreated}>
                                                    <AnsibeTowerIcon size='sm' color={global_BackgroundColor_100.value} />
                                                    &nbsp;{intl.formatMessage(messages.remediate)}
                                                </RemediationButton>
                                            </ToolbarItem>
                                        </ToolbarGroup>}
                                </Inventory>}
                            {systemFetchStatus === 'pending' && (<Loading />)}
                        </React.Fragment>}
                        {systemFetchStatus === 'fulfilled' && !rule.reports_shown && <MessageState icon={BellSlashIcon} size='sm'
                            title={intl.formatMessage(messages.ruleIsDisabled)}
                            text={intl.formatMessage(messages.ruleIsDisabledBody)} />}
                    </React.Fragment>}
                {ruleFetchStatus === 'pending' && (<Loading />)}
                {ruleFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.rulesTableFetchRulesError)} />)}
            </React.Fragment>
        </Main>
    </React.Fragment>;
};

OverviewDetails.propTypes = {
    match: PropTypes.any,
    fetchRule: PropTypes.func,
    ruleFetchStatus: PropTypes.string,
    rule: PropTypes.object,
    fetchSystem: PropTypes.func,
    systemFetchStatus: PropTypes.string,
    system: PropTypes.object,
    entities: PropTypes.any,
    addNotification: PropTypes.func,
    intl: PropTypes.any,
    selectEntity: PropTypes.func,
    fetchTopics: PropTypes.func,
    topics: PropTypes.array,
    ruleAck: PropTypes.object,
    fetchRuleAck: PropTypes.func,
    fetchHostAcks: PropTypes.func,
    hostAcks: PropTypes.object

};

const mapStateToProps = (state, ownProps) => ({
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    system: state.AdvisorStore.system,
    systemFetchStatus: state.AdvisorStore.systemFetchStatus,
    entities: state.entities,
    topics: state.AdvisorStore.topics,
    ruleAck: state.AdvisorStore.ruleAck,
    hostAcks: state.AdvisorStore.hostAcks,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url)),
    fetchSystem: (url) => dispatch(AppActions.fetchSystem(url)),
    addNotification: data => dispatch(addNotification(data)),
    selectEntity: (payload) => dispatch({ type: 'SELECT_ENTITY', payload }),
    fetchTopics: () => dispatch(AppActions.fetchTopics()),
    fetchRuleAck: data => dispatch(AppActions.fetchRuleAck(data)),
    fetchHostAcks: data => dispatch(AppActions.fetchHostAcks(data))

});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDetails)));
