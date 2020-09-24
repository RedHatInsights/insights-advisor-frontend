import './Details.scss';

import * as AppActions from '../../AppActions';

import { BASE_URL, SYSTEM_TYPES, UI_BASE, isGlobalFilter } from '../../AppConstants';
import { Card, CardBody, CardFooter, CardHeader } from '@patternfly/react-core/dist/js/components/Card';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

import API from '../../Utilities/Api';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { DateFormat } from '@redhat-cloud-services/frontend-components/components/DateFormat';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import { Dropdown } from '@patternfly/react-core/dist/js/components/Dropdown/Dropdown';
import { DropdownItem } from '@patternfly/react-core/dist/js/components/Dropdown/DropdownItem';
import { DropdownToggle } from '@patternfly/react-core/dist/js/components/Dropdown/DropdownToggle';
import Failed from '../../PresentationalComponents/Loading/Failed';
import { Flex } from '@patternfly/react-core/dist/js/layouts/Flex/Flex';
import { FlexItem } from '@patternfly/react-core/dist/js/layouts/Flex/FlexItem';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import PropTypes from 'prop-types';
import RuleDetails from '../../PresentationalComponents/RuleDetails/RuleDetails';
import RuleLabels from '../../PresentationalComponents/RuleLabels/RuleLabels';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { cveToRuleid } from '../../cveToRuleid.js';
import { encodeOptionsToURL } from '../../PresentationalComponents/Common/Tables';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const TagsToolbar = lazy(() => import('../../PresentationalComponents/TagsToolbar/TagsToolbar'));
const OverviewDetails = ({ match, fetchRuleAck, fetchTopics, fetchSystem, fetchRule, ruleFetchStatus, rule, systemFetchStatus, system, intl,
    topics, ruleAck, hostAcks, fetchHostAcks, setSystem, setRule, selectedTags, addNotification, workloads }) => {
    const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
    const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
    const [host, setHost] = useState(undefined);
    const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ sort: '-updated' });
    const [isRuleUpdated, setIsRuleUpdated] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchRulefn = (newSort, rule = true, system = true) => {
        let options = selectedTags !== null && selectedTags.length && ({ tags: selectedTags.map(tag => encodeURIComponent(tag)).join('&tags=') });
        workloads && (options = { ...options, ...workloads });
        system && fetchSystem(
            match.params.id,
            options.tags ? {} : { ...options, ...filters, ...newSort },
            options.tags && encodeOptionsToURL({ ...options, ...filters, ...newSort })
        );
        rule && fetchRule(
            options.tags ? { rule_id: match.params.id } : { rule_id: match.params.id, ...options },
            options.tags && encodeOptionsToURL(options)
        );
    };

    const ruleResolutionRisk = (rule) => {
        const resolution = rule.resolution_set.find(resolution => resolution.system_type === SYSTEM_TYPES.rhel || SYSTEM_TYPES.ocp);
        return resolution ? resolution.resolution_risk.risk : undefined;
    };

    const handleModalToggle = (disableRuleModalOpen, host = undefined) => {
        setDisableRuleModalOpen(disableRuleModalOpen);
        setHost(host);
    };

    const enableRule = async (rule) => {
        try {
            await API.delete(`${BASE_URL}/ack/${rule.rule_id}/`);
            addNotification({
                variant: 'success', timeout: true, dismissable: true, title: intl.formatMessage(messages.ruleSuccessfullyEnabled)
            });
            fetchRulefn();
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
        title: 'Disable recommendation for system',
        onClick: (event, rowIndex, item) => (handleModalToggle(true, item))
    }]);

    const bulkHostActions = async () => {
        const data = { systems: hostAcks.data.map(item => item.system_uuid) };
        try {
            const response = await API.post(`${BASE_URL}/rule/${rule.rule_id}/unack_hosts/`, {}, data);
            addNotification({
                variant: 'success', timeout: true, dismissable: true, title: intl.formatMessage(messages.ruleSuccessfullyEnabled)
            });
            if (selectedTags.length > 0) {
                fetchRulefn();
            } else {
                setSystem({ host_ids: response.data.host_ids });
                setRule({ ...rule, hosts_acked_count: 0 });
            }
        } catch (error) {
            addNotification({ variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` });
        }
    };

    const onSortFn = (sort) => {
        setFilters({ sort });
        sort === 'updated' && (sort = 'last_seen');
        sort === '-updated' && (sort = '-last_seen');
        fetchRulefn({ sort }, false);
    };

    useEffect(() => {
        rule.rule_id && fetchHostAcks({ rule_id: rule.rule_id, limit: rule.hosts_acked_count });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchHostAcks, rule.hosts_acked_count]);

    useEffect(() => {
        const isCVE = cveToRuleid && cveToRuleid.find(mapping => mapping.rule_id === match.params.id);

        if (isCVE) {
            window.location.href = `${UI_BASE}/vulnerability/cves/${isCVE.cves[0].includes('CVE-') ?
                `${isCVE.cves[0]}?security_rule=${match.params.id}`
                : ''}`;
        } else {
            fetchTopics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tagRef = useRef();
    const workloadRef = useRef();
    useEffect(() => {
        const fetchAction = () => {fetchRulefn(); setIsRuleUpdated(true);};

        if (isRuleUpdated && ((selectedTags !== null && JSON.stringify(tagRef.current) !== JSON.stringify(selectedTags)) ||
        (JSON.stringify(workloadRef.current) !== JSON.stringify(workloads)))) {
            fetchAction();
        }

        workloadRef.current = workloads;
        tagRef.current = selectedTags;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchRulefn, selectedTags, workloads]);

    useEffect(() => {
        if (!rule.reports_shown && rule.rule_id && isRuleUpdated) {
            fetchRuleAck({ rule_id: rule.rule_id });
        } else if (!isRuleUpdated) {
            fetchRulefn();
            setIsRuleUpdated(true);
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchRuleAck, rule.reports_shown, rule.rule_id]);

    return <React.Fragment>
        {!isGlobalFilter() && <Suspense fallback={<Loading />}> <TagsToolbar /> </Suspense>}
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
                    <RuleDetails resolutionRisk={ruleResolutionRisk(rule)} isDetailsPage rule={rule} topics={topics} header={
                        <React.Fragment>
                            <PageHeaderTitle title={<React.Fragment><RuleLabels rule={rule} />{rule.description}</React.Fragment>} />
                            <p>{intl.formatMessage(
                                messages.rulesDetailsPubishdate, { date: <DateFormat date={new Date(rule.publish_date)} type="onlyDate" /> }
                            )}
                            <Label className="categoryLabel" color="blue">{rule.category.name}</Label>
                            </p>
                        </React.Fragment>}>
                        <Flex>
                            <FlexItem align={{ default: 'alignRight' }}>
                                <Dropdown
                                    className='ins-c-rec-details__actions_dropdown'
                                    onSelect={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                                    position='right'
                                    toggle={<DropdownToggle
                                        onToggle={(actionsDropdownOpen) => setActionsDropdownOpen(actionsDropdownOpen)}
                                        toggleIndicator={CaretDownIcon}>Actions
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
                            <CardHeader><Title headingLevel="h4" size="xl">
                                <BellSlashIcon size='sm' />&nbsp;{intl.formatMessage(rule.hosts_acked_count > 0 && rule.reports_shown ?
                                    messages.ruleIsDisabledForSystems : messages.ruleIsDisabled)}
                            </Title></CardHeader>
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
                            <Title className='titleOverride' headingLevel='h3' size='2xl'>
                                {intl.formatMessage(messages.affectedSystems)}
                            </Title>
                            {systemFetchStatus === 'fulfilled' &&
                                <Inventory
                                    tableProps={{ canSelectAll: false, actionResolver }}
                                    items={system.host_ids} rule={rule} afterDisableFn={afterDisableFn} filters={filters}
                                    onSortFn={onSortFn} />}
                            {systemFetchStatus === 'pending' && (<Loading />)}
                        </React.Fragment>}
                        {systemFetchStatus === 'fulfilled' && !rule.reports_shown && <MessageState icon={BellSlashIcon}
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
    fetchHostAcks: PropTypes.func,
    setRule: PropTypes.func,
    setSystem: PropTypes.func,
    selectedTags: PropTypes.array,
    workloads: PropTypes.object
};

const mapStateToProps = ({ AdvisorStore, ownProps }) => ({
    rule: AdvisorStore.rule,
    ruleFetchStatus: AdvisorStore.ruleFetchStatus,
    system: AdvisorStore.system,
    systemFetchStatus: AdvisorStore.systemFetchStatus,
    topics: AdvisorStore.topics,
    ruleAck: AdvisorStore.ruleAck,
    hostAcks: AdvisorStore.hostAcks,
    selectedTags: AdvisorStore.selectedTags,
    workloads: AdvisorStore.workloads,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (options, search) => dispatch(AppActions.fetchRule(options, search)),
    fetchSystem: (rule_id, options, search) => dispatch(AppActions.fetchSystem(rule_id, options, search)),
    addNotification: data => dispatch(addNotification(data)),
    fetchTopics: () => dispatch(AppActions.fetchTopics()),
    fetchRuleAck: data => dispatch(AppActions.fetchRuleAck(data)),
    fetchHostAcks: data => dispatch(AppActions.fetchHostAcks(data)),
    setRule: data => dispatch(AppActions.setRule(data)),
    setSystem: data => dispatch(AppActions.setSystem(data))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDetails)));
