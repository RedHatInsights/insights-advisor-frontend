/* eslint-disable react/prop-types */
import './Pathways.scss';

import {
  Card,
  CardBody,
  CardFooter,
} from '@patternfly/react-core/dist/esm/components/Card/index';
import { Text } from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import CategoryLabel from '../Labels/CategoryLabel';
import React from 'react';
import { RebootRequired } from '../Common/Common';
import RuleLabels from '../Labels/RuleLabels';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

import messages from '../../Messages';
import { useIntl } from 'react-intl';

export const PathwayCard = ({
  name,
  categories,
  impacted_systems_count,
  description,
  has_incident,
  reboot_required,
  slug,
}) => {
  const intl = useIntl();

  return (
    <Card
      isFlat
      isPlain
      className="adv-c-card-pathway adv__background--global-100"
    >
      <CardBody className="body">
        <Text className="pf-u-pb-sm pf-u-font-weight-bold">{name}</Text>
        <CategoryLabel key={name} labelList={categories} />{' '}
        <InsightsLink
          to={`../recommendations/pathways/systems/${slug}`}
          className="pf-u-font-size-sm"
        >
          {intl.formatMessage(messages.topicCardSystemsaffected, {
            systems: impacted_systems_count,
          })}
        </InsightsLink>
      </CardBody>
      <CardBody className="body pf-u-font-size-sm">{description}</CardBody>
      <CardBody className="body pf-u-font-size-sm">
        {has_incident && <RuleLabels rule={{ tags: 'incident' }} isCompact />}{' '}
        {RebootRequired(reboot_required)}
      </CardBody>
      <CardFooter className="footer pf-u-font-size-sm">
        <InsightsLink to={`../recommendations/pathways/${slug}`}>
          {`${intl.formatMessage(messages.viewPathway)} `}
          <ArrowRightIcon />
        </InsightsLink>
      </CardFooter>
    </Card>
  );
};
