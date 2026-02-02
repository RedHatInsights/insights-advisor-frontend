import './_Common.scss';

import {
  Content,
  ContentVariants,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { createIntl, createIntlCache } from 'react-intl';
import { t_global_text_color_200 } from '@patternfly/react-tokens';

import {
  OutlinedQuestionCircleIcon,
  PowerOffIcon,
} from '@patternfly/react-icons';
import React from 'react';
import propTypes from 'prop-types';
import messages from '../../Messages';
import { strong } from '../../Utilities/intlHelper';

const cache = createIntlCache();
const locale = navigator.language.slice(0, 2);
const intl = createIntl(
  {
    locale,
  },
  cache,
);

const RebootRequired = (reboot_required) => (
  <span className="adv-system-reboot-message">
    <PowerOffIcon
      className={
        reboot_required
          ? 'adv-c-icon-reboot-required'
          : 'adv-c-icon-no-reboot-required'
      }
    />
    <Content className="adv-c-text-system-reboot-message pf-v6-u-font-size-sm">
      <Content component={ContentVariants.p}>
        {intl.formatMessage(messages.systemReboot, {
          strong: (str) => strong(str),
          status: reboot_required
            ? intl.formatMessage(messages.is)
            : intl.formatMessage(messages.isNot),
        })}
      </Content>
    </Content>
  </span>
);

const QuestionTooltip = ({ text }) => (
  <Tooltip
    key={text}
    position={TooltipPosition.right}
    content={<div>{text}</div>}
  >
    <span aria-label="Action" data-testid={`question-tooltip-${text}`}>
      <OutlinedQuestionCircleIcon
        className="pf-v6-u-ml-xs"
        color={t_global_text_color_200.value}
      />
    </span>
  </Tooltip>
);

QuestionTooltip.propTypes = {
  text: propTypes.string,
};

export { RebootRequired, QuestionTooltip };
