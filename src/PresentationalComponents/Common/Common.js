import "./_Common.scss";

import {
  Text,
  TextContent,
  TextVariants,
  Tooltip,
  TooltipPosition,
} from "@patternfly/react-core";
import { createIntl, createIntlCache } from "react-intl";

import {
  OutlinedQuestionCircleIcon,
  PowerOffIcon,
} from "@patternfly/react-icons";
import React from "react";
import { global_secondary_color_100 } from "@patternfly/react-tokens";
import messages from "../../Messages";
import { strong } from "../../Utilities/intlHelper";

const cache = createIntlCache();
const locale = navigator.language.slice(0, 2);
const intl = createIntl(
  {
    locale,
  },
  cache
);

const RebootRequired = (reboot_required) => (
  <span className="adv-system-reboot-message">
    <PowerOffIcon
      className={
        reboot_required
          ? "adv-c-icon-reboot-required"
          : "adv-c-icon-no-reboot-required"
      }
    />
    <TextContent className="adv-c-text-system-reboot-message pf-u-font-size-sm">
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
    <span
      aria-label="Action"
      data-cy="question-tooltip"
      data-testid={`question-tooltip-${text}`}
    >
      <OutlinedQuestionCircleIcon color={global_secondary_color_100.value} />
    </span>
  </Tooltip>
);

export { RebootRequired, QuestionTooltip };
