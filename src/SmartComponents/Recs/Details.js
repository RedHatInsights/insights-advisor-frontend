import './Details.scss';

import {
  BASE_URL,
  PERMS,
  RISK_OF_CHANGE_DESC,
  SYSTEM_TYPES,
  UI_BASE,
} from '../../AppConstants';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@patternfly/react-core/dist/js/components/Card';
import { DeleteApi, Get, Post } from '../../Utilities/Api';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
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
import RuleDetails from '../../PresentationalComponents/RuleDetails/RuleDetails';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { cveToRuleid } from '../../cveToRuleid.js';
import messages from '../../Messages';
import { addNotification as notification } from '@redhat-cloud-services/frontend-components-notifications/';
import { useGetRecAcksQuery } from '../../Services/Acks';
import { useGetRecQuery } from '../../Services/Recs';
import { useGetTopicsQuery } from '../../Services/Topics';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const OverviewDetails = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const ruleId = useParams().id;
  const addNotification = (data) => dispatch(notification(data));
  const permsExport = usePermissions('advisor', PERMS.export).hasAccess;

  const {
    data: rule = {},
    isFetching,
    isError,
    refetch,
  } = useGetRecQuery({ ruleId });

  const {
    data: recAck = {},
    isFetching: recAckIsFetching,
    refetch: recAckRefetch,
  } = useGetRecAcksQuery({ ruleId });

  const { data: topics = [], isFetching: topicIsFetching } =
    useGetTopicsQuery();

  const permsDisableRec = usePermissions('advisor', PERMS.disableRec).hasAccess;
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [host, setHost] = useState(undefined);
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);

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
      await DeleteApi(`${BASE_URL}/ack/${rule.rule_id}/`);
      addNotification({
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyEnabled),
      });
      refetch();
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
    refetch();
    recAckRefetch();
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
        await Get(
          `${BASE_URL}/hostack/`,
          {},
          { rule_id: rule.rule_id, limit: rule.hosts_acked_count }
        )
      ).data;
      const data = {
        systems: hostAckResponse?.data?.map((item) => item.system_uuid),
      };

      await Post(`${BASE_URL}/rule/${rule.rule_id}/unack_hosts/`, {}, data);
      refetch();
      addNotification({
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyEnabled),
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

  useEffect(() => {
    const isCVE =
      cveToRuleid && cveToRuleid.find((mapping) => mapping.rule_id === ruleId);

    if (isCVE) {
      window.location.href = `${UI_BASE}/vulnerability/cves/${
        isCVE.cves[0].includes('CVE-')
          ? `${isCVE.cves[0]}?security_rule=${ruleId}`
          : ''
      }`;
    }

    if (rule?.description) {
      const subnav = `${rule.description} - ${messages.recommendations.defaultMessage}`;
      document.title = intl.formatMessage(messages.documentTitle, { subnav });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={(toggleModal) =>
            setViewSystemsModalOpen(toggleModal)
          }
          isModalOpen={viewSystemsModalOpen}
          afterFn={() => refetch()}
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
      {!isFetching && !topicIsFetching && (
        <React.Fragment>
          <PageHeader className="adv-c-page__header">
            <Breadcrumbs ouiaId="override" current={rule.description || ''} />
          </PageHeader>
          <Main className="pf-m-light pf-u-pt-sm">
            <RuleDetails
              resolutionRisk={ruleResolutionRisk(rule)}
              riskOfChangeDesc={RISK_OF_CHANGE_DESC[ruleResolutionRisk(rule)]}
              isDetailsPage
              rule={rule}
              topics={topics}
              header={
                <React.Fragment>
                  <PageHeaderTitle
                    title={
                      <React.Fragment>
                        {rule.description} <RuleLabels rule={rule} />
                      </React.Fragment>
                    }
                  />
                  <p>
                    {intl.formatMessage(messages.rulesDetailsModifieddate, {
                      date: (
                        <DateFormat
                          date={new Date(rule.publish_date)}
                          type="onlyDate"
                        />
                      ),
                    })}
                    <Label className="adv-c-label-category" color="blue">
                      {rule.category.name}
                    </Label>
                  </p>
                </React.Fragment>
              }
              onFeedbackChanged={async (ruleId, calculatedRating) => {
                await Post(
                  `${BASE_URL}/rating/`,
                  {},
                  { rule: ruleId, rating: calculatedRating }
                );
              }}
            >
              <Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  <Tooltip
                    trigger={!permsDisableRec ? 'mouseenter' : ''}
                    content={intl.formatMessage(messages.permsAction)}
                  >
                    <Dropdown
                      className="adv-c-dropdown-details-actions"
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
      {isFetching && <Loading />}
      <Main>
        {!isFetching ? (
          <React.Fragment>
            {(rule.hosts_acked_count > 0 || rule.rule_status !== 'enabled') && (
              <Card className="adv-c-card-details">
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
                <CardBody className="adv-c-card__body">
                  {rule.hosts_acked_count > 0 &&
                  rule.rule_status === 'enabled' ? (
                    <React.Fragment>
                      {intl.formatMessage(
                        messages.ruleIsDisabledForSystemsBody,
                        {
                          systems: rule.hosts_acked_count,
                        }
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
                    !recAckIsFetching && (
                      <React.Fragment>
                        {intl.formatMessage(
                          messages.ruleIsDisabledJustification
                        )}
                        <i>
                          {recAck.justification ||
                            intl.formatMessage(messages.none)}
                        </i>
                        {recAck.updated_at && (
                          <span>
                            &nbsp;
                            <DateFormat
                              date={new Date(recAck.updated_at)}
                              type="onlyDate"
                            />
                          </span>
                        )}
                      </React.Fragment>
                    )
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
                <Title className="pf-u-mb-lg" headingLevel="h3" size="2xl">
                  {intl.formatMessage(messages.affectedSystems)}
                </Title>
                <Inventory
                  tableProps={{
                    canSelectAll: false,
                    actionResolver,
                    isStickyHeader: true,
                  }}
                  rule={rule}
                  afterDisableFn={afterDisableFn}
                  selectedTags={selectedTags}
                  workloads={workloads}
                  SID={SID}
                  permsExport={permsExport}
                  exportTable="systems"
                  showTags={true}
                />
              </React.Fragment>
            )}
            {
              // TODO this should also have a message specifically for RH disabled
              // rules
            }
            {rule.rule_status !== 'enabled' && (
              <MessageState
                icon={BellSlashIcon}
                title={intl.formatMessage(messages.ruleIsDisabled)}
                text={
                  recAck.justification
                    ? intl.formatMessage(
                        messages.ruleIsDisabledBodyWithJustification,
                        {
                          reason: recAck.justification,
                        }
                      )
                    : intl.formatMessage(messages.ruleIsDisabledBody)
                }
              />
            )}
          </React.Fragment>
        ) : isError ? (
          <Failed
            message={intl.formatMessage(messages.rulesTableFetchRulesError)}
          />
        ) : (
          <Loading />
        )}
      </Main>
    </React.Fragment>
  );
};

export default OverviewDetails;
