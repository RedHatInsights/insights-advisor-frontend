import './DownloadPlaybookButton.scss';
import React, { useContext } from 'react';
import { Button, Icon } from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import messages from '../Messages';
import { Post } from './Api';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { EnvironmentContext } from '../App';
import { DownloadIcon } from '@patternfly/react-icons';

const DownloadPlaybookButton = ({ isDisabled, rules, systems }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const notification = (data) => dispatch(addNotification(data));
  const envContext = useContext(EnvironmentContext);

  const download = async (payload) => {
    try {
      const csrfToken = document
        ?.querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
      const response = await Post(
        `${envContext.REMEDIATIONS_BASE_URL}/playbook`,
        { 'X-CSRF-Token': csrfToken },
        payload,
      );

      // download the playbook in the response as a yaml file
      const blob = new Blob([response.data], { type: 'application/x-yaml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'insights-remediation-playbook.yml');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const preparePayload = (rules, systems) => {
    // payload to send to the remediations service for playbook generation is defined here:
    // https://developers.redhat.com/api-catalog/api/remediations#content-operations-group-generator

    // ensure only rules with playbooks will be included in the payload
    const playbookRules = rules.filter((r) =>
      r.resolution_set.some((r2) => r2.has_playbook),
    );
    const autoReboot = playbookRules.some((r) => r.reboot_required);
    const issues = playbookRules.map((r) => ({
      id: `advisor:${r.rule_id}`,
      systems,
    }));

    return {
      auto_reboot: autoReboot,
      issues,
    };
  };

  return (
    <Button
      id="download-playbook-button"
      key="download-playbook-button"
      ouiaId="download-playbook-button"
      variant="secondary"
      isDisabled={isDisabled}
      onClick={() => download(preparePayload(rules, systems))}
    >
      <span>
        <Icon>
          <DownloadIcon />
        </Icon>
        {intl.formatMessage(messages.downloadPlaybookButtonText)}
      </span>
    </Button>
  );
};

DownloadPlaybookButton.propTypes = {
  isDisabled: PropTypes.bool,
  rules: PropTypes.arrayOf(PropTypes.shape({})),
  systems: PropTypes.arrayOf(PropTypes.string),
};

export default DownloadPlaybookButton;
