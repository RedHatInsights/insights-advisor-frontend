import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, FormGroup, TextInput, Checkbox } from '@patternfly/react-core';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import messages from '../../Messages';

const DisableRule = ({ handleModalToggle, intl, isModalOpen, displaySingleSystemCheckbox, rule, afterDisableFn, addNotification }) => {
    const [justification, setJustificaton] = useState('');
    const [singleSystem, setSingleSystem] = useState(false);

    const disableRule = async () => {
        try {
            if (rule.reports_shown) {
                // eslint-disable-next-line camelcase
                await API.post(`${BASE_URL}/ack/`, { rule_id: rule.rule_id, justification });
                afterDisableFn();
                handleModalToggle(false);
            }
        } catch (error) {
            handleModalToggle(false);
            addNotification({
                variant: 'danger',
                dismissable: true,
                title: intl.formatMessage(messages.rulesTableHideReportsErrorDisabled),
                description: `${error}`
            });
        }

        setJustificaton('');
    };

    return <Modal
        isSmall
        title={intl.formatMessage(messages.disableRule)}
        isOpen={isModalOpen}
        onClose={() => { handleModalToggle(false); setJustificaton('');  }}
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
            <FormGroup />
            {displaySingleSystemCheckbox && <FormGroup>
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
    addNotification: PropTypes.func

};

DisableRule.defaultProps = {
    isModalOpen: false,
    handleModalToggle: () => undefined,
    displaySingleSystemCheckbox: false,
    rule: {},
    afterDisableFn: () => undefined
};

const mapDispatchToProps = dispatch => ({
    addNotification: data => dispatch(addNotification(data))
});

export default injectIntl(connect(
    null,
    mapDispatchToProps
)(DisableRule));
