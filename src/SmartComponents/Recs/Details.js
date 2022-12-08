import './Details.scss';

import { PERMS, UI_BASE } from '../../AppConstants';
import messages from '../../Messages';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@patternfly/react-core/dist/js/components/Card';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';

import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';

import { addNotification as notification } from '@redhat-cloud-services/frontend-components-notifications/';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

import { cveToRuleid } from '../../cveToRuleid.js';
import { useGetRecAcksQuery } from '../../Services/Acks';
import { useGetRecQuery } from '../../Services/Recs';
import { useGetTopicsQuery } from '../../Services/Topics';
import { enableRule, bulkHostActions } from './helpers';
import { DetailsRules } from './DetailsRules';
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

  const handleModalToggle = (disableRuleModalOpen, host = undefined) => {
    setDisableRuleModalOpen(disableRuleModalOpen);
    setHost(host);
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
        <DetailsRules
          rule={rule}
          topics={topics}
          permsDisableRec={permsDisableRec}
          setActionsDropdownOpen={setActionsDropdownOpen}
          actionsDropdownOpen={actionsDropdownOpen}
          addNotification={addNotification}
          handleModalToggle={handleModalToggle}
          refetch={refetch}
        />
      )}
      {isFetching && <Loading />}
      <section className="pf-l-page__main-section pf-c-page__main-section">
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
                      onClick={() =>
                        bulkHostActions(refetch, addNotification, intl, rule)
                      }
                      ouiaId="bulkHost"
                    >
                      {intl.formatMessage(messages.enableRuleForSystems)}
                    </Button>
                  ) : (
                    <Button
                      isInline
                      variant="link"
                      onClick={() =>
                        enableRule(
                          rule,
                          refetch,
                          intl,
                          addNotification,
                          handleModalToggle
                        )
                      }
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
          <ErrorState />
        ) : (
          <Loading />
        )}
      </section>
    </React.Fragment>
  );
};

export default OverviewDetails;
