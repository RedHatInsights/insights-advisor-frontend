/* eslint camelcase: 0 */
import './Details.scss';

import * as AppActions from '../../AppActions';

import { BellSlashIcon, CaretDownIcon } from '@patternfly/react-icons';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHead,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    Flex,
    FlexItem,
    Title
} from '@patternfly/react-core';
import { DateFormat, Main, PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import React, { useEffect, useState } from 'react';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import PropTypes from 'prop-types';
import RuleDetails from '../../PresentationalComponents/RuleDetails/RuleDetails';
import RuleLabels from '../../PresentationalComponents/RuleLabels/RuleLabels';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const OverviewDetails = ({ match, fetchRuleAck, fetchTopics, fetchSystem, fetchRule, ruleFetchStatus, rule, systemFetchStatus, system, intl,
    topics, ruleAck, hostAcks, fetchHostAcks }) => {
    const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
    const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
    const [host, setHost] = useState(undefined);
    const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);

    const fetchRulefn = () => {
        fetchSystem({ rule_id: match.params.id });
        fetchRule({ rule_id: match.params.id });
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

    const afterDisableFn = () => {
        setHost(undefined);
        fetchRulefn();
    };

    const actionResolver = () => ([{
        title: 'Disable rule for system',
        onClick: (event, rowIndex, item) => (handleModalToggle(true, item))
    }]);

    const bulkHostActions = async () => {
        const data = { systems: hostAcks.data.map(item => item.system_uuid) };
        try {
            await API.post(`${BASE_URL}/rule/${rule.rule_id}/unack_hosts/`, {}, data);
            fetchRulefn();
        } catch (error) {
            addNotification({ variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` });
        }
    };

    useEffect(() => {
        fetchHostAcks({ rule_id: rule.rule_id, limit: rule.hosts_acked_count });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchHostAcks, rule.hosts_acked_count]);

    useEffect(() => {
        fetchTopics();
        fetchRulefn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!rule.reports_shown && rule.rule_id) {
            fetchRuleAck({ rule_id: rule.rule_id });
        }
    }, [fetchRuleAck, rule.reports_shown, rule.rule_id]);

    return <React.Fragment>
        {viewSystemsModalOpen && <ViewHostAcks
            handleModalToggle={(toggleModal) => setViewSystemsModalOpen(toggleModal)}
            isModalOpen={viewSystemsModalOpen}
            afterFn={fetchRulefn}
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
                    <RuleDetails isDetailsPage rule={rule} topics={topics} header={
                        <React.Fragment>
                            <PageHeaderTitle title={<React.Fragment><RuleLabels rule={rule} />{rule.description}</React.Fragment>} />
                            <p>{intl.formatMessage(
                                messages.rulesDetailsPubishdate, { date: <DateFormat date={new Date(rule.publish_date)} type="onlyDate" /> }
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
                        {(rule.hosts_acked_count > 0 || !rule.reports_shown) && <Card className='cardOverride'>
                            <CardHead><Title headingLevel="h4" size="xl">
                                <BellSlashIcon size='sm' />&nbsp;{intl.formatMessage(rule.hosts_acked_count > 0 && rule.reports_shown ?
                                    messages.ruleIsDisabledForSystems : messages.ruleIsDisabled)}
                            </Title></CardHead>
                            <CardBody>
                                {rule.hosts_acked_count > 0 && rule.reports_shown ?
                                    <React.Fragment>
                                        {intl.formatMessage(messages.ruleIsDisabledForSystemsBody, { systems: rule.hosts_acked_count })}
                                        &nbsp;
                                        <Button isInline variant='link' onClick={() => setViewSystemsModalOpen(true)}>
                                            {intl.formatMessage(messages.viewSystems)}
                                        </Button>
                                    </React.Fragment>
                                    : <React.Fragment>
                                        {intl.formatMessage(messages.ruleIsDisabledJustification)}
                                        <i>{ruleAck.justification || intl.formatMessage(messages.none)}</i>
                                        {ruleAck.updated_at && <span>&nbsp;<DateFormat date={new Date(ruleAck.updated_at)} type="onlyDate" /></span>}
                                    </React.Fragment>}
                            </CardBody>
                            <CardFooter>
                                {rule.hosts_acked_count > 0 && rule.reports_shown ?
                                    <Button isInline variant='link' onClick={() => bulkHostActions()}>
                                        {intl.formatMessage(messages.enableRuleForSystems)}
                                    </Button>
                                    : <Button isInline variant='link' onClick={() => enableRule(rule)}>
                                        {intl.formatMessage(messages.enableRule)}
                                    </Button>}
                            </CardFooter>
                        </Card>}
                        {rule.reports_shown && <React.Fragment>
                            <Title headingLevel='h3' size='2xl'>
                                {intl.formatMessage(messages.affectedSystems)}
                            </Title>
                            {systemFetchStatus === 'fulfilled' &&
                                <Inventory
                                    tableProps={{ canSelectAll: false, actionResolver }}
                                    items={system.host_ids} rule={rule} afterDisableFn={afterDisableFn} />}
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
    addNotification: PropTypes.func,
    intl: PropTypes.any,
    fetchTopics: PropTypes.func,
    topics: PropTypes.array,
    ruleAck: PropTypes.object,
    hostAcks: PropTypes.object,
    fetchRuleAck: PropTypes.func,
    fetchHostAcks: PropTypes.func
};

const mapStateToProps = ({ AdvisorStore, ownProps }) => ({
    rule: AdvisorStore.rule,
    ruleFetchStatus: AdvisorStore.ruleFetchStatus,
    system: AdvisorStore.system,
    systemFetchStatus: AdvisorStore.systemFetchStatus,
    topics: AdvisorStore.topics,
    ruleAck: AdvisorStore.ruleAck,
    hostAcks: AdvisorStore.hostAcks,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url)),
    fetchSystem: (url) => dispatch(AppActions.fetchSystem(url)),
    addNotification: data => dispatch(addNotification(data)),
    fetchTopics: () => dispatch(AppActions.fetchTopics()),
    fetchRuleAck: data => dispatch(AppActions.fetchRuleAck(data)),
    fetchHostAcks: data => dispatch(AppActions.fetchHostAcks(data))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDetails)));
