import React, { useContext, useState } from 'react';

import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core/deprecated';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import PropTypes from 'prop-types';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { useSetAckMutation } from '../../Services/Acks';
import { EnvironmentContext } from '../../App';
import { getCsrfTokenHeader } from '../helper';

const DisableRule = ({
  handleModalToggle = () => {},
  isModalOpen = false,
  host,
  hosts = [],
  rule = {},
  afterFn = () => {},
}) => {
  const intl = useIntl();
  const envContext = useContext(EnvironmentContext);
  const addNotification = useAddNotification();
  const [justification, setJustificaton] = useState('');
  const [singleSystem, setSingleSystem] = useState(
    host !== undefined || hosts.length > 0,
  );
  const justificationMaxLength = 255;

  const [setAck] = useSetAckMutation();

  const bulkHostActions = async () => {
    const data = { systems: hosts, justification };
    try {
      await instance.post(
        `${envContext.BASE_URL}/rule/${rule.rule_id}/ack_hosts/`,
        data,
        { headers: getCsrfTokenHeader() },
      );
      !singleSystem &&
        addNotification({
          variant: 'success',
          dismissable: true,
          timeout: true,
          title: intl.formatMessage(messages.recSuccessfullyDisabled),
        });
      afterFn && afterFn();
    } catch (error) {
      addNotification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const disableRule = async () => {
    if (rule.rule_status === 'enabled' && !hosts.length) {
      let options = singleSystem
        ? {
            type: 'HOST',
            options: {
              rule: rule.rule_id,
              system_uuid: host.id,
              justification,
            },
          }
        : {
            type: 'RULE',
            options: {
              rule_id: rule.rule_id,
              ...(justification && { justification }),
            },
          };
      try {
        if (envContext.loadChromeless) {
          options = {
            customBasePath: envContext.BASE_URL,
            csrfToken: document
              ?.querySelector('meta[name="csrf-token"]')
              ?.getAttribute('content'),
            ...options,
          };
        }
        await setAck(options).unwrap();

        addNotification({
          variant: 'success',
          timeout: true,
          dismissable: true,
          title: intl.formatMessage(messages.recSuccessfullyDisabled),
        });

        setJustificaton('');
        afterFn && afterFn();
      } catch (error) {
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${error}`,
        });
      }
    } else {
      bulkHostActions();
    }

    handleModalToggle(false);
  };

  return (
    <Modal
      variant="small"
      title={intl.formatMessage(messages.disableRule)}
      isOpen={isModalOpen}
      onClose={() => {
        handleModalToggle(false);
        setJustificaton('');
      }}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => disableRule()}
          ouiaId="confirm"
        >
          {intl.formatMessage(messages.save)}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            handleModalToggle(false);
            setJustificaton('');
          }}
          ouiaId="cancel"
        >
          {intl.formatMessage(messages.cancel)}
        </Button>,
      ]}
    >
      {intl.formatMessage(messages.disableRuleBody)}
      <Form>
        <FormGroup fieldId="blank-form" />
        {(host !== undefined || hosts.length > 0) && (
          <FormGroup fieldId="disable-rule-one-system">
            <Checkbox
              isChecked={singleSystem}
              onChange={() => {
                setSingleSystem(!singleSystem);
              }}
              label={
                hosts.length
                  ? intl.formatMessage(messages.disableRuleForSystems)
                  : intl.formatMessage(messages.disableRuleSingleSystem)
              }
              id="disable-rule-one-system"
              name="disable-rule-one-system"
            />
          </FormGroup>
        )}
        <FormGroup
          label={intl.formatMessage(messages.justificationNote)}
          fieldId="disable-rule-justification"
        >
          <TextInput
            type="text"
            id="disable-rule-justification"
            aria-describedby="disable-rule-justification"
            value={justification}
            maxLength={justificationMaxLength}
            onChange={(_event, text) => setJustificaton(text)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), disableRule())
            }
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

DisableRule.propTypes = {
  isModalOpen: PropTypes.bool,
  host: PropTypes.object,
  handleModalToggle: PropTypes.func,
  rule: PropTypes.object,
  afterFn: PropTypes.func,
  hosts: PropTypes.array,
};

export default DisableRule;
