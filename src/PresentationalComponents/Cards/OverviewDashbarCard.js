import React from 'react';
import propTypes from 'prop-types';

import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  Tooltip,
  Title,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { RouteIcon } from '@patternfly/react-icons/dist/esm/icons/route-icon';

import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { QuestionTooltip } from '../Common/Common';
import RuleLabels from '../Labels/RuleLabels';
import { strong } from '../../Utilities/intlHelper';
import messages from '../../Messages';
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
  INCIDENT_TAG,
  IMPORTANT_TAG,
  CRITICAL_TAG,
  TOTAL_RISK_LABEL_LOWER,
  SEVERITY_MAP,
} from '../../AppConstants';

/*****************************************/
// this component returns an "Important" or "Critical" label with an appropriate formatted tooltip message
// It receives a typeOfTag prop, which is a number, and uses it to get the appropriate label and corresponding tooltip message
const GetTagLabelWithTooltip = ({ typeOfTag, formatMessage }) => (
  <Tooltip
    key={`${typeOfTag}-tooltip`}
    position="bottom"
    content={formatMessage(messages.rulesDetailsTotalRiskBody, {
      risk:
        TOTAL_RISK_LABEL_LOWER[typeOfTag] || formatMessage(messages.undefined),
      strong: (str) => strong(str),
    })}
  >
    <InsightsLabel value={typeOfTag} isCompact />
  </Tooltip>
);

GetTagLabelWithTooltip.propTypes = {
  typeOfTag: propTypes.number,
  formatMessage: propTypes.func,
};

/*****************************************/
// this component returns the title with an appropriate formatted tooltip message that is displayed when hovering over the question mark icon found next to it
const GetTitleWithTooltip = ({ title, tooltipMessage, formatMessage }) => (
  <Title headingLevel="h6" size="md">
    {formatMessage(title)} {QuestionTooltip(formatMessage(tooltipMessage))}
  </Title>
);

GetTitleWithTooltip.propTypes = {
  title: propTypes.shape({
    id: propTypes.string,
    description: propTypes.string,
    defaultMessage: propTypes.string,
  }),
  tooltipMessage: propTypes.shape({
    id: propTypes.string,
    description: propTypes.string,
    defaultMessage: propTypes.string,
  }),
  formatMessage: propTypes.func,
};

/*****************************************/
// this component returns the appropriate title component based on the title it receives
const GetTitleComponent = ({
  title,
  formatMessage,
  getWrongTitleErrorMessage,
}) => {
  switch (title) {
    case PATHWAYS:
      return (
        <GetTitleWithTooltip
          title={messages.pathways}
          tooltipMessage={messages.recommendedPathways}
          formatMessage={formatMessage}
        />
      );

    case INCIDENTS:
      return (
        <GetTitleWithTooltip
          title={messages.incidents}
          tooltipMessage={messages.incidentTooltip}
          formatMessage={formatMessage}
        />
      );

    case IMPORTANT_RECOMMENDATIONS:
    case CRITICAL_RECOMMENDATIONS:
      return (
        <Text component={TextVariants.h4}>
          <b>{title}</b>
        </Text>
      );

    default:
      console.log(getWrongTitleErrorMessage('GetTitleComponent'));
      return null;
  }
};

GetTitleComponent.propTypes = {
  title: propTypes.string,
  formatMessage: propTypes.func,
  getWrongTitleErrorMessage: propTypes.func,
};

/*****************************************/
// this component returns the appropriate Tag OR Icon component based on the title it receives
const GetTagOrIconComponent = ({
  title,
  formatMessage,
  getWrongTitleErrorMessage,
}) => {
  switch (title) {
    case PATHWAYS:
      return <RouteIcon size="md" />;
    case INCIDENTS:
      return (
        <RuleLabels key="incidentTag" rule={{ tags: INCIDENT_TAG }} isCompact />
      );
    case CRITICAL_RECOMMENDATIONS:
      return (
        <GetTagLabelWithTooltip
          typeOfTag={SEVERITY_MAP[CRITICAL_TAG]}
          formatMessage={formatMessage}
        />
      );
    case IMPORTANT_RECOMMENDATIONS:
      return (
        <GetTagLabelWithTooltip
          typeOfTag={SEVERITY_MAP[IMPORTANT_TAG]}
          formatMessage={formatMessage}
        />
      );

    default:
      console.log(getWrongTitleErrorMessage('GetTagOrIconComponent'));
      return null;
  }
};

GetTagOrIconComponent.propTypes = {
  title: propTypes.string,
  formatMessage: propTypes.func,
  getWrongTitleErrorMessage: propTypes.func,
};

/*****************************************/
// this component returns the appropriate Card component based on the title it receives
export const OverviewDashbarCard = ({
  title,
  count,
  onClickFilterByTitle,
  formatMessage,
  getWrongTitleErrorMessage,
}) => (
  <Card isFullHeight className="dashbar-item">
    <CardBody>
      <GetTitleComponent
        title={title}
        formatMessage={formatMessage}
        getWrongTitleErrorMessage={getWrongTitleErrorMessage}
      />

      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <GetTagOrIconComponent
            title={title}
            formatMessage={formatMessage}
            getWrongTitleErrorMessage={getWrongTitleErrorMessage}
          />
        </FlexItem>
        <FlexItem>
          <Text className="pf-u-font-size-lg pf-u-font-weight-bold pf-u-mt-xs">
            <a onClick={() => onClickFilterByTitle(title)}>{count}</a>
          </Text>
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);

OverviewDashbarCard.propTypes = {
  title: propTypes.string,
  count: propTypes.number,
  onClickFilterByTitle: propTypes.func,
  formatMessage: propTypes.func,
  getWrongTitleErrorMessage: propTypes.func,
};
