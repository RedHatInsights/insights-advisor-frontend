import './_RuleRating.scss';

import * as AppConstants from '../../AppConstants';

import { OutlinedThumbsDownIcon, OutlinedThumbsUpIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';

import API from '../../Utilities/Api';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const RuleRating = ({ intl, rule }) => {
    const [rating, setRating] = useState(rule.rating);
    const [submitted, setSubmitted] = useState(false);
    const [thankYou, setThankYou] = useState(intl.formatMessage(messages.feedbackThankyou));
    const updateRuleRating = async (newRating) => {
        const calculatedRating = rating === 0 ? newRating : 0;
        try {
            await API.post(`${AppConstants.BASE_URL}/rating/`, {}, { rule: rule.rule_id, rating: calculatedRating });
            setRating(calculatedRating);
            setSubmitted(true);
            setTimeout(() => setThankYou(''), 3000);
        } catch (error) {
            console.error(error);
        }
    };

    return <span className={'ratingSpanOverride'}>
        {intl.formatMessage(messages.ruleHelpful)}
        <Button variant="plain" aria-label="Action" onClick={() => updateRuleRating(1)}>
            <OutlinedThumbsUpIcon className={rating === 1 && 'like'} size='sm' />
        </Button>
        <Button variant="plain" aria-label="Action" onClick={() => updateRuleRating(-1)}>
            <OutlinedThumbsDownIcon className={rating === -1 && 'dislike'} size='sm' />
        </Button>
        {submitted && thankYou}
    </span>;
};

RuleRating.propTypes = {
    intl: PropTypes.any,
    rule: PropTypes.object
};

export default injectIntl(RuleRating);
