/* eslint-disable camelcase */

import React, { useState } from 'react';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { Checkbox } from '@patternfly/react-core/dist/js/components/Checkbox/Checkbox';
import { Form } from '@patternfly/react-core/dist/js/components/Form/Form';
import { FormGroup } from '@patternfly/react-core/dist/js/components/Form/FormGroup';
import { Modal } from '@patternfly/react-core/dist/js/components/Modal/Modal';
import PropTypes from 'prop-types';
import { TextInput } from '@patternfly/react-core/dist/js/components/TextInput/TextInput';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import { setAck } from '../../AppActions';

const DisableRule = ({ handleModalToggle, intl, isModalOpen, host, hosts, rule, afterFn, setAck, addNotification }) => {
    const [justification, setJustificaton] = useState('');
    const [singleSystem, setSingleSystem] = useState(host !== undefined || hosts.length > 0);

    const bulkHostActions = async () => {
        const data = { systems: hosts, justification };
        try {
            await API.post(`${BASE_URL}/rule/${rule.rule_id}/ack_hosts/`, {}, data);
            afterFn && afterFn();
        } catch (error) {
            addNotification({ variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` });
        }
    };

    const disableRule = async() => {
        if (rule.reports_shown && !hosts.length) {
            const options = singleSystem
                ? { type: 'HOST', options: { rule: rule.rule_id, system_uuid: host.id, justification } }
                : { type: 'RULE', options: { rule_id: rule.rule_id, ...(justification && { justification }) } };
            await setAck(options);
            setJustificaton('');
            afterFn && afterFn();
        } else {
            bulkHostActions();
        }

        handleModalToggle(false);
    };

    return <Modal
        isSmall
        title={intl.formatMessage(messages.disableRule)}
        isOpen={isModalOpen}
        onClose={() => { handleModalToggle(false); setJustificaton(''); }}
        actions={[
            <Button key="confirm" variant="primary" onClick={() => disableRule()}>
                {intl.formatMessage(messages.save)}
            </Button>,
            <Button key="cancel" variant="link" onClick={() => { handleModalToggle(false); setJustificaton(''); }}>
                {intl.formatMessage(messages.cancel)}
            </Button>
        ]}
        isFooterLeftAligned
    >
        {intl.formatMessage(messages.disableRuleBody)}
        <Form>
            <FormGroup fieldId='blank-form' />
            {(host !== undefined || hosts.length > 0) && <FormGroup fieldId='disable-rule-one-system'>
                <Checkbox
                    isChecked={singleSystem}
                    onChange={() => { setSingleSystem(!singleSystem); }}
                    label={hosts.length ? intl.formatMessage(messages.disableRuleForSystems) : intl.formatMessage(messages.disableRuleSingleSystem)}
                    id="disable-rule-one-system"
                    name="disable-rule-one-system" />
            </FormGroup>}
            <FormGroup
                label={intl.formatMessage(messages.justificationNote)}
                fieldId="disable-rule-justification">
                <TextInput
                    type="text"
                    id="disable-rule-justification"
                    name="disable-rule-justification"
                    aria-describedby="disable-rule-justification"
                    value={justification}
                    onChange={(text) => { setJustificaton(text); }}
                />
            </FormGroup>
        </Form>
    </Modal>;
};

DisableRule.propTypes = {
    isModalOpen: PropTypes.bool,
    host: PropTypes.object,
    handleModalToggle: PropTypes.func,
    intl: PropTypes.any,
    rule: PropTypes.object,
    afterFn: PropTypes.func,
    setAck: PropTypes.func,
    hosts: PropTypes.array,
    addNotification: PropTypes.func
};

DisableRule.defaultProps = {
    isModalOpen: false,
    handleModalToggle: () => undefined,
    system: undefined,
    rule: {},
    afterFn: () => undefined,
    host: undefined,
    hosts: []
};

const mapDispatchToProps = dispatch => ({
    addNotification: data => dispatch(addNotification(data)),
    setAck: data => dispatch(setAck(data))
});

export default injectIntl(connect(null, mapDispatchToProps)(DisableRule));
