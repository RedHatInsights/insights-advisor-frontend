/* eslint-disable camelcase */
import { Button, Checkbox, Form, FormGroup, Modal, TextInput } from '@patternfly/react-core';
import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import { setAck } from '../../AppActions';

const DisableRule = ({ handleModalToggle, intl, isModalOpen, host, rule, afterFn, setAck }) => {
    const [justification, setJustificaton] = useState('');
    const [singleSystem, setSingleSystem] = useState(host !== undefined);

    const disableRule = () => {
        if (rule.reports_shown) {
            const options = singleSystem
                ? { type: 'HOST', options: { rule: rule.rule_id, system_uuid: host.id, ...(justification && { justification }) } }
                : { type: 'RULE', options: { rule_id: rule.rule_id, ...(justification && { justification }) } };
            setAck(options);
            afterFn();
            setJustificaton('');
            setSingleSystem(false);
            handleModalToggle(false);
        }
    };

    return <Modal
        isSmall
        title={intl.formatMessage(messages.disableRule)}
        isOpen={isModalOpen}
        onClose={() => { handleModalToggle(false); setJustificaton(''); }}
        actions={[
            <Button key="confirm" variant="primary" onClick={disableRule}>
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
            {host !== undefined && <FormGroup fieldId='disable-rule-one-system'>
                <Checkbox
                    isChecked={singleSystem}
                    onChange={() => { setSingleSystem(!singleSystem); }}
                    label={intl.formatMessage(messages.disableRuleSingleSystem)}
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
    setAck: PropTypes.func
};

DisableRule.defaultProps = {
    isModalOpen: false,
    handleModalToggle: () => undefined,
    system: undefined,
    rule: {},
    afterFn: () => undefined
};

const mapDispatchToProps = dispatch => ({
    setAck: data => dispatch(setAck(data))
});

export default injectIntl(connect(null, mapDispatchToProps)(DisableRule));
