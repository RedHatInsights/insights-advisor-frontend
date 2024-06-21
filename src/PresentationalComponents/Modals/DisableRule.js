import React, { useState } from 'react';

import { BASE_URL } from '../../AppConstants';
import { Button } from '@patternfly/react-core/dist/esm/components/Button/Button';
import { Checkbox } from '@patternfly/react-core/dist/esm/components/Checkbox/Checkbox';
import { Form } from '@patternfly/react-core/dist/esm/components/Form/Form';
import { FormGroup } from '@patternfly/react-core/dist/esm/components/Form/FormGroup';
import { Modal } from '@patternfly/react-core/dist/esm/components/Modal/Modal';
import { Post } from '../../Utilities/Api';
import PropTypes from 'prop-types';
import { TextInput } from '@patternfly/react-core/dist/esm/components/TextInput/TextInput';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import messages from '../../Messages';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSetAckMutation } from '../../Services/Acks';

const DisableRule = ({
  handleModalToggle,
  isModalOpen,
  host,
  hosts,
  rule,
  afterFn,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const notification = (data) => dispatch(addNotification(data));
  const [justification, setJustificaton] = useState('');
  const [singleSystem, setSingleSystem] = useState(
    host !== undefined || hosts.length > 0
  );
  const justificationMaxLength = 255;

  const [setAck] = useSetAckMutation();

  const bulkHostActions = async () => {
    const data = { systems: hosts, justification };
    try {
      await Post(`${BASE_URL}/rule/${rule.rule_id}/ack_hosts/`, {}, data);
      !singleSystem &&
        notification({
          variant: 'success',
          dismissable: true,
          timeout: true,
          title: intl.formatMessage(messages.recSuccessfullyDisabled),
        });
      afterFn && afterFn();
    } catch (error) {
      notification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const disableRule = async () => {
    if (rule.rule_status === 'enabled' && !hosts.length) {
      const options = singleSystem
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
        await setAck(options).unwrap();

        notification({
          variant: 'success',
          timeout: true,
          dismissable: true,
          title: intl.formatMessage(messages.recSuccessfullyDisabled),
        });

        setJustificaton('');
        afterFn && afterFn();
      } catch (error) {
        notification({
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

DisableRule.defaultProps = {
  isModalOpen: false,
  handleModalToggle: () => undefined,
  system: undefined,
  rule: {},
  afterFn: () => undefined,
  host: undefined,
  hosts: [],
};

export default DisableRule;
