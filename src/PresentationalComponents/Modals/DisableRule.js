import { Button, Checkbox, Form, FormGroup, Modal, TextInput } from '@patternfly/react-core';
import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import { setRuleAck } from '../../AppActions';

const DisableRule = ({ handleModalToggle, intl, isModalOpen, displaySingleSystemCheckbox, rule, afterDisableFn, setRuleAck }) => {
    const [justification, setJustificaton] = useState('');
    const [singleSystem, setSingleSystem] = useState(false);

    const disableRule = () => {
        if (rule.reports_shown) {
            // eslint-disable-next-line camelcase
            setRuleAck({ rule_id: rule.rule_id, justification });
            afterDisableFn();
            setJustificaton('');
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
            {displaySingleSystemCheckbox && <FormGroup fieldId='disable-rule-one-system'>
                <Checkbox
                    isChecked={singleSystem}
                    onChange={() => { setSingleSystem(!singleSystem); }}
                    label={intl.formatMessage(messages.disableRuleSingleSystem)}
                    id="disable-rule-one-system"
                    name="disable-rule-one-system" />
            </FormGroup>}
            <FormGroup
                label={intl.formatMessage(messages.justificatonNote)}
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
    displaySingleSystemCheckbox: PropTypes.bool,
    handleModalToggle: PropTypes.func,
    intl: PropTypes.any,
    rule: PropTypes.object,
    afterDisableFn: PropTypes.func,
    setRuleAck: PropTypes.func
};

DisableRule.defaultProps = {
    isModalOpen: false,
    handleModalToggle: () => undefined,
    displaySingleSystemCheckbox: false,
    rule: {},
    afterDisableFn: () => undefined
};

const mapDispatchToProps = dispatch => ({
    setRuleAck: data => dispatch(setRuleAck(data))
});

export default injectIntl(connect(
    null,
    mapDispatchToProps
)(DisableRule));
