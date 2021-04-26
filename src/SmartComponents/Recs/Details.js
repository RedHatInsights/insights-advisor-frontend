import './Details.scss';

import * as AppActions from '../../AppActions';

import { BASE_URL, PERMS, SYSTEM_TYPES, UI_BASE } from '../../AppConstants';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@patternfly/react-core/dist/js/components/Card';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  encodeOptionsToURL,
  workloadQueryBuilder,
} from '../../PresentationalComponents/Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import API from '../../Utilities/Api';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { DEBOUNCE_DELAY } from '../../AppConstants';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
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
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import PropTypes from 'prop-types';
import RuleDetails from '../../PresentationalComponents/RuleDetails/RuleDetails';
import RuleLabels from '../../PresentationalComponents/RuleLabels/RuleLabels';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { cveToRuleid } from '../../cveToRuleid.js';
import debounce from '../../Utilities/Debounce';
import messages from '../../Messages';
import { addNotification as notification } from '@redhat-cloud-services/frontend-components-notifications/';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const OverviewDetails = ({ match }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const permsDisableRec = usePermissions('advisor', PERMS.disableRec).hasAccess;
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [host, setHost] = useState(undefined);
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ sort: '-updated' });
  const [isRuleUpdated, setIsRuleUpdated] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);

  const rule = useSelector(({ AdvisorStore }) => AdvisorStore.rule);
  const ruleFetchStatus = useSelector(
    ({ AdvisorStore }) => AdvisorStore.ruleFetchStatus
  );
  const system = useSelector(({ AdvisorStore }) => AdvisorStore.system);
  const systemFetchStatus = useSelector(
    ({ AdvisorStore }) => AdvisorStore.systemFetchStatus
  );
  const topics = useSelector(({ AdvisorStore }) => AdvisorStore.topics);
  const ruleAck = useSelector(({ AdvisorStore }) => AdvisorStore.ruleAck);
  const selectedTags = useSelector(
    ({ AdvisorStore }) => AdvisorStore.selectedTags
  );
  const workloads = useSelector(({ AdvisorStore }) => AdvisorStore.workloads);
  const SID = useSelector(({ AdvisorStore }) => AdvisorStore.SID);
  const fetchTopics = () => dispatch(AppActions.fetchTopics());
  const addNotification = (data) => dispatch(notification(data));

  const fetchRulefn = useCallback(
    (newFilter, rule = true, system = true) => {
      const fetchRule = (options, search) =>
        dispatch(AppActions.fetchRule(options, search));
      const fetchSystem = (rule_id, options, search) =>
        dispatch(AppActions.fetchSystem(rule_id, options, search));
      let options = selectedTags !== null &&
        selectedTags.length && {
          tags: selectedTags.map((tag) => encodeURIComponent(tag)),
        };
      workloads &&
        (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
      if (system) {
        fetchSystem(
          match.params.id,
          options.tags ? {} : { ...options, ...filters, ...newFilter },
          options.tags &&
            encodeOptionsToURL({ ...options, ...filters, ...newFilter })
        );
      }
      if (rule) {
        fetchRule(
          options.tags
            ? { rule_id: match.params.id }
            : { rule_id: match.params.id, ...options },
          options.tags && encodeOptionsToURL(options)
        );
      }
    },
    [selectedTags, workloads, SID, dispatch, match.params.id, filters]
  );

  const ruleResolutionRisk = (rule) => {
    const resolution = rule?.resolution_set?.find(
      (resolution) =>
        resolution.system_type === SYSTEM_TYPES.rhel || SYSTEM_TYPES.ocp
    );
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
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyEnabled),
      });
      fetchRulefn();
    } catch (error) {
      handleModalToggle(false);
      addNotification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const afterDisableFn = async () => {
    setHost(undefined);
    fetchRulefn();
  };

  const actionResolver = () => [
    {
      title: 'Disable recommendation for system',
      onClick: (event, rowIndex, item) => handleModalToggle(true, item),
    },
  ];

  const bulkHostActions = async () => {
    try {
      const hostAckResponse = (
        await API.get(
          `${BASE_URL}/hostack/`,
          {},
          { rule_id: rule.rule_id, limit: rule.hosts_acked_count }
        )
      ).data;
      const data = {
        systems: hostAckResponse?.data?.map((item) => item.system_uuid),
      };

      await API.post(`${BASE_URL}/rule/${rule.rule_id}/unack_hosts/`, {}, data);
      fetchRulefn();
      addNotification({
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyEnabledForSystem),
      });
    } catch (error) {
      addNotification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const onSortFn = (sort) => {
    setFilters({ ...filters, sort });
    sort === 'updated' && (sort = 'last_seen');
    sort === '-updated' && (sort = '-last_seen');
    fetchRulefn({ sort }, false);
  };

  useEffect(() => {
    if (isRuleUpdated && systemFetchStatus === 'fulfilled') {
      setFilters({ ...filters, name: debouncedSearchText });
      fetchRulefn({ name: debouncedSearchText }, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  useEffect(() => {
    const isCVE =
      cveToRuleid &&
      cveToRuleid.find((mapping) => mapping.rule_id === match.params.id);

    if (isCVE) {
      window.location.href = `${UI_BASE}/vulnerability/cves/${
        isCVE.cves[0].includes('CVE-')
          ? `${isCVE.cves[0]}?security_rule=${match.params.id}`
          : ''
      }`;
    } else {
      fetchTopics();
    }
    fetchRulefn({}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagRef = useRef();
  const workloadRef = useRef();
  const sidRef = useRef();

  useEffect(() => {
    if (
      isRuleUpdated &&
      selectedTags !== null &&
      (JSON.stringify(tagRef.current) !== JSON.stringify(selectedTags) ||
        JSON.stringify(workloadRef.current) !== JSON.stringify(workloads) ||
        JSON.stringify(sidRef.current) !== JSON.stringify(SID))
    ) {
      fetchRulefn({}, false);
    }

    tagRef.current = selectedTags;
    workloadRef.current = workloads;
    sidRef.current = SID;
  }, [selectedTags, workloads, SID, fetchRulefn, isRuleUpdated]);

  useEffect(() => {
    const fetchRuleAck = (data) => dispatch(AppActions.fetchRuleAck(data));

    if (rule.rule_status !== 'enabled' && rule.rule_id && isRuleUpdated) {
      fetchRuleAck({ rule_id: rule.rule_id });
    } else if (!isRuleUpdated) {
      fetchRulefn({}, true, false);
      setIsRuleUpdated(true);
    }

    if (rule && rule.description) {
      const subnav = `${rule.description} - ${messages.recommendations.defaultMessage}`;
      document.title = intl.formatMessage(messages.documentTitle, { subnav });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule, rule.rule_status, rule.rule_id]);

  return (
    <React.Fragment>
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={(toggleModal) =>
            setViewSystemsModalOpen(toggleModal)
          }
          isModalOpen={viewSystemsModalOpen}
          afterFn={fetchRulefn}
          rule={rule}
        />
      )}
      {disableRuleModalOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModalOpen}
          rule={rule}
          afterFn={afterDisableFn}
          host={host}
        />
      )}
      {ruleFetchStatus === 'fulfilled' && (
        <React.Fragment>
          <PageHeader className="pageHeaderOverride">
            <Breadcrumbs
              ouiaId="override"
              current={rule.description || ''}
              match={match}
            />
          </PageHeader>
          <Main className="pf-m-light pf-u-pt-sm">
            <RuleDetails
              resolutionRisk={ruleResolutionRisk(rule)}
              isDetailsPage
              rule={rule}
              topics={topics}
              header={
                <React.Fragment>
                  <PageHeaderTitle
                    title={
                      <React.Fragment>
                        <RuleLabels rule={rule} />
                        {rule.description}
                      </React.Fragment>
                    }
                  />
                  <p>
                    {intl.formatMessage(messages.rulesDetailsPubishdate, {
                      date: (
                        <DateFormat
                          date={new Date(rule.publish_date)}
                          type="onlyDate"
                        />
                      ),
                    })}
                    <Label className="categoryLabel" color="blue">
                      {rule.category.name}
                    </Label>
                  </p>
                </React.Fragment>
              }
            >
              <Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  <Tooltip
                    trigger={!permsDisableRec ? 'mouseenter' : ''}
                    content={intl.formatMessage(messages.permsAction)}
                  >
                    <Dropdown
                      className="ins-c-rec-details__actions_dropdown"
                      onSelect={() =>
                        setActionsDropdownOpen(!actionsDropdownOpen)
                      }
                      position="right"
                      ouiaId="actions"
                      toggle={
                        <DropdownToggle
                          isDisabled={!permsDisableRec}
                          onToggle={(actionsDropdownOpen) =>
                            setActionsDropdownOpen(actionsDropdownOpen)
                          }
                          toggleIndicator={CaretDownIcon}
                        >
                          {intl.formatMessage(messages.actions)}
                        </DropdownToggle>
                      }
                      isOpen={actionsDropdownOpen}
                      dropdownItems={
                        rule && rule.rule_status === 'enabled'
                          ? [
                              <DropdownItem
                                key="link"
                                ouiaId="disable"
                                onClick={() => {
                                  handleModalToggle(true);
                                }}
                              >
                                {intl.formatMessage(messages.disableRule)}
                              </DropdownItem>,
                            ]
                          : [
                              <DropdownItem
                                key="link"
                                ouiaId="enable"
                                onClick={() => {
                                  enableRule(rule);
                                }}
                              >
                                {intl.formatMessage(messages.enableRule)}
                              </DropdownItem>,
                            ]
                      }
                    />
                  </Tooltip>
                </FlexItem>
              </Flex>
            </RuleDetails>
          </Main>
        </React.Fragment>
      )}
      {ruleFetchStatus === 'pending' && <Loading />}
      <Main>
        <React.Fragment>
          {ruleFetchStatus === 'fulfilled' && (
            <React.Fragment>
              {(rule.hosts_acked_count > 0 ||
                rule.rule_status !== 'enabled') && (
                <Card className="cardOverride">
                  <CardHeader>
                    <Title headingLevel="h4" size="xl">
                      <BellSlashIcon size="sm" />
                      &nbsp;
                      {intl.formatMessage(
                        rule.hosts_acked_count > 0 &&
                          rule.rule_status === 'enabled'
                          ? messages.ruleIsDisabledForSystems
                          : messages.ruleIsDisabled
                      )}
                    </Title>
                  </CardHeader>
                  <CardBody>
                    {rule.hosts_acked_count > 0 &&
                    rule.rule_status === 'enabled' ? (
                      <React.Fragment>
                        {intl.formatMessage(
                          messages.ruleIsDisabledForSystemsBody,
                          { systems: rule.hosts_acked_count }
                        )}
                        &nbsp;
                        <Button
                          isInline
                          variant="link"
                          onClick={() => setViewSystemsModalOpen(true)}
                          ouiaId="viewSystems"
                        >
                          {intl.formatMessage(messages.viewSystems)}
                        </Button>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        {intl.formatMessage(
                          messages.ruleIsDisabledJustification
                        )}
                        <i>
                          {ruleAck.justification ||
                            intl.formatMessage(messages.none)}
                        </i>
                        {ruleAck.updated_at && (
                          <span>
                            &nbsp;
                            <DateFormat
                              date={new Date(ruleAck.updated_at)}
                              type="onlyDate"
                            />
                          </span>
                        )}
                      </React.Fragment>
                    )}
                  </CardBody>
                  <CardFooter>
                    {rule.hosts_acked_count > 0 &&
                    rule.rule_status === 'enabled' ? (
                      <Button
                        isInline
                        variant="link"
                        onClick={() => bulkHostActions()}
                        ouiaId="bulkHost"
                      >
                        {intl.formatMessage(messages.enableRuleForSystems)}
                      </Button>
                    ) : (
                      <Button
                        isInline
                        variant="link"
                        onClick={() => enableRule(rule)}
                        ouiaId="rule"
                      >
                        {intl.formatMessage(messages.enableRule)}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
              {rule.rule_status === 'enabled' && (
                <React.Fragment>
                  <Title className="titleOverride" headingLevel="h3" size="2xl">
                    {intl.formatMessage(messages.affectedSystems)}
                  </Title>
                  {systemFetchStatus === 'fulfilled' && (
                    <Inventory
                      tableProps={{ canSelectAll: false, actionResolver }}
                      items={system.host_ids}
                      rule={rule}
                      afterDisableFn={afterDisableFn}
                      filters={filters}
                      onSortFn={onSortFn}
                      searchText={searchText}
                      setSearchText={(searchText) => {
                        setSearchText(searchText);
                      }}
                    />
                  )}
                  {systemFetchStatus === 'pending' && <Loading />}
                </React.Fragment>
              )}
              {systemFetchStatus === 'fulfilled' &&
                rule.rule_status !== 'enabled' && (
                  <MessageState
                    icon={BellSlashIcon}
                    title={intl.formatMessage(messages.ruleIsDisabled)}
                    text={intl.formatMessage(messages.ruleIsDisabledBody)}
                  />
                )}
            </React.Fragment>
          )}
          {ruleFetchStatus === 'pending' && <Loading />}
          {ruleFetchStatus === 'failed' && (
            <Failed
              message={intl.formatMessage(messages.rulesTableFetchRulesError)}
            />
          )}
        </React.Fragment>
      </Main>
    </React.Fragment>
  );
};

OverviewDetails.propTypes = {
  match: PropTypes.any,
};

export default routerParams(OverviewDetails);
