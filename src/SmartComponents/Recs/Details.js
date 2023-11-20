import './Details.scss';

import { PERMS, UI_BASE } from '../../AppConstants';
import messages from '../../Messages';
import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@patternfly/react-core/dist/esm/components/Card';
import BellSlashIcon from '@patternfly/react-icons/dist/esm/icons/bell-slash-icon';
import { Button } from '@patternfly/react-core/dist/esm/components/Button/Button';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import { InvalidObject } from '@redhat-cloud-services/frontend-components/InvalidObject';
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
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import HybridInventory from '../HybridInventoryTabs/HybridInventoryTabs';

const OverviewDetails = ({ isImmutableTabOpen }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const ruleId = useParams().id;
  const addNotification = (data) => dispatch(notification(data));
  const chrome = useChrome();
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
      chrome.updateDocumentTitle(
        intl.formatMessage(messages.documentTitle, { subnav })
      );
    }
  }, [chrome, intl, rule.description, ruleId]);

  return (
    <React.Fragment>
      {!isFetching && !isError ? (
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
          <section className="pf-l-page__main-section pf-c-page__main-section">
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
                        bulkHostActions({
                          refetch,
                          addNotification,
                          intl,
                          rule,
                        })
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
                <HybridInventory
                  ruleId={ruleId}
                  rule={rule}
                  afterDisableFn={afterDisableFn}
                  handleModalToggle={handleModalToggle}
                  isImmutableTabOpen={isImmutableTabOpen}
                  isRecommendationDetail
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
          </section>
        </React.Fragment>
      ) : isError ? (
        <InvalidObject />
      ) : (
        <Loading />
      )}
    </React.Fragment>
  );
};

OverviewDetails.propTypes = {
  isImmutableTabOpen: propTypes.bool,
};
export default OverviewDetails;
