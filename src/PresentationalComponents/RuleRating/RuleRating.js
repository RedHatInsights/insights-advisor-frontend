import './_RuleRating.scss';

import React, { useState } from 'react';

import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import OutlinedThumbsDownIcon from '@patternfly/react-icons/dist/js/icons/outlined-thumbs-down-icon';
import OutlinedThumbsUpIcon from '@patternfly/react-icons/dist/js/icons/outlined-thumbs-up-icon';
import PropTypes from 'prop-types';
import ThumbsDownIcon from '@patternfly/react-icons/dist/js/icons/thumbs-down-icon';
import ThumbsUpIcon from '@patternfly/react-icons/dist/js/icons/thumbs-up-icon';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const RuleRating = ({ ruleId, ruleRating, updateRatingAction }) => {
  const intl = useIntl();

  const { toggleFeedbackModal } = useChrome();

  const [rating, setRating] = useState(ruleRating);
  const [submitted, setSubmitted] = useState(false);
  const [thankYou, setThankYou] = useState(
    intl.formatMessage(messages.feedbackThankyou)
  );
  const updateRuleRating = async (newRating) => {
    const calculatedRating = rating === newRating ? 0 : newRating;
    try {
      await updateRatingAction(ruleId, calculatedRating);
      setRating(calculatedRating);
      setSubmitted(true);
      setTimeout(() => setThankYou(''), 3000);
      toggleFeedbackModal(true);
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
    }
  };

  return (
    <span className="adv-rating-span">
      {intl.formatMessage(messages.ruleHelpful)}
      <Button
        variant="plain"
        aria-label="thumbs-up"
        onClick={() => updateRuleRating(1)}
        ouiaId="thumbsUp"
      >
        {rating === 1 ? (
          <ThumbsUpIcon className="like" size="sm" />
        ) : (
          <OutlinedThumbsUpIcon size="sm" />
        )}
      </Button>
      <Button
        variant="plain"
        aria-label="thumbs-down"
        onClick={() => updateRuleRating(-1)}
        ouiaId="thumbsDown"
      >
        {rating === -1 ? (
          <ThumbsDownIcon className="dislike" size="sm" />
        ) : (
          <OutlinedThumbsDownIcon size="sm" />
        )}
      </Button>
      {submitted && thankYou}
    </span>
  );
};

RuleRating.propTypes = {
  ruleId: PropTypes.string.isRequired,
  ruleRating: PropTypes.number.isRequired,
  updateRatingAction: PropTypes.func.isRequired,
};

export default RuleRating;
