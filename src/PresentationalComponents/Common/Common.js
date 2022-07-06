import './_Common.scss';

import {
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core/dist/js/components/Text/index';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/esm/components/Tooltip/';
import { createIntl, createIntlCache } from 'react-intl';

import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import PowerOffIcon from '@patternfly/react-icons/dist/esm/icons/power-off-icon';
import React from 'react';
import { global_secondary_color_100 } from '@patternfly/react-tokens';
import messages from '../../Messages';
import { strong } from '../../Utilities/intlHelper';

const cache = createIntlCache();
const locale = navigator.language.slice(0, 2);
const intl = createIntl(
  {
    // Yo, no.
    // eslint-disable-next-line no-console
    onError: console.log,
    locale,
  },
  cache
);

// this directory and file make structurally no sense.
const RebootRequired = (reboot_required) => (
  <span className="adv-system-reboot-message">
    <PowerOffIcon
      className={
        reboot_required
          ? 'adv-c-icon-reboot-required'
          : 'adv-c-icon-no-reboot-required'
      }
    />
    <TextContent className="adv-c-text-system-reboot-message">
      <Text component={TextVariants.p}>
        {intl.formatMessage(messages.systemReboot, {
          strong: (str) => strong(str),
          status: reboot_required
            ? intl.formatMessage(messages.is)
            : intl.formatMessage(messages.isNot),
        })}
      </Text>
    </TextContent>
  </span>
);

const QuestionTooltip = (text) => (
  <Tooltip
    key={text}
    position={TooltipPosition.right}
    content={<div>{text}</div>}
  >
    <span aria-label="Action">
      <OutlinedQuestionCircleIcon color={global_secondary_color_100.value} />
    </span>
  </Tooltip>
);

export { RebootRequired, QuestionTooltip };
