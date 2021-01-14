import './_RuleRating.scss';

import * as AppConstants from '../../AppConstants';

import React, { useState } from 'react';

import API from '../../Utilities/Api';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import OutlinedThumbsDownIcon from '@patternfly/react-icons/dist/js/icons/outlined-thumbs-down-icon';
import OutlinedThumbsUpIcon from '@patternfly/react-icons/dist/js/icons/outlined-thumbs-up-icon';
import PropTypes from 'prop-types';
import ThumbsDownIcon from '@patternfly/react-icons/dist/js/icons/thumbs-down-icon';
import ThumbsUpIcon from '@patternfly/react-icons/dist/js/icons/thumbs-up-icon';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const RuleRating = ({ intl, rule }) => {
    const [rating, setRating] = useState(rule.rating);
    const [submitted, setSubmitted] = useState(false);
    const [thankYou, setThankYou] = useState(intl.formatMessage(messages.feedbackThankyou));
    const updateRuleRating = async (newRating) => {
        const calculatedRating = rating === newRating ? 0 : newRating;
        try {
            await API.post(`${AppConstants.BASE_URL}/rating/`, {}, { rule: rule.rule_id, rating: calculatedRating });
            setRating(calculatedRating);
            setSubmitted(true);
            setTimeout(() => setThankYou(''), 3000);
        } catch (error) {
            console.error(error); // eslint-disable-line no-console
        }
    };

    return <span className='ratingSpanOverride'>
        {intl.formatMessage(messages.ruleHelpful)}
        <Button variant="plain" aria-label="thumbs-up" onClick={() => updateRuleRating(1)}
            ouiaId="thumbsUp">
            {rating === 1 ? <ThumbsUpIcon className='like' size='sm' /> :
                <OutlinedThumbsUpIcon size='sm' />}
        </Button>
        <Button variant="plain" aria-label="thumbs-down" onClick={() => updateRuleRating(-1)}
            ouiaId="thumbsDown">
            {rating === -1 ? <ThumbsDownIcon className='dislike' size='sm' /> :
                <OutlinedThumbsDownIcon size='sm' />}
        </Button>
        {submitted && thankYou}
    </span>;
};

RuleRating.propTypes = {
    intl: PropTypes.any,
    rule: PropTypes.object
};

export default injectIntl(RuleRating);
