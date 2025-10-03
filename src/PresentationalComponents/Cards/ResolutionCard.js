/* eslint-disable react/prop-types */
import './Pathways.scss';

import {
  Card,
  CardBody,
  CardTitle,
} from '@patternfly/react-core/dist/esm/components/Card/index';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { RISK_OF_CHANGE_LABEL } from '../../AppConstants';
import React from 'react';
import { RebootRequired } from '../Common/Common';
import RecommendationLevel from '../Labels/RecommendationLevel';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

export const ResolutionCard = ({
  name,
  reboot_required,
  resolution_risk,
  recommendation_level,
}) => {
  const intl = useIntl();

  return (
    <Card
      isPlain
      className="adv-c-card-pathway adv__background--global-100 pf-v6-u-h-100 flex-row"
      ouiaId="resolution-card"
    >
      <div className="flex-coloumn">
        <CardTitle>{intl.formatMessage(messages.resolution)}</CardTitle>

        <div className="flex-row ">
          <div className="halfWidth">
            <p className="pf-v6-u-font-weight-bold pf-v6-u-font-size-sm pf-v6-u-pl-lg">
              {intl.formatMessage(messages.remediation)}
            </p>
            <p className="pf-v6-u-font-size-sm pf-v6-u-pl-lg">{name}</p>
          </div>

          <CardBody className=" pf-v6-u-pl-xl halfWidth">
            <p className="pf-v6-u-font-weight-bold pf-v6-u-font-size-sm">
              {intl.formatMessage(messages.riskOfChange)}
            </p>
            <InsightsLabel
              text={RISK_OF_CHANGE_LABEL[resolution_risk.risk]}
              value={resolution_risk.risk}
              hideIcon
              isCompact
            />
          </CardBody>
        </div>

        <CardBody className="body pf-v6-u-font-size-sm">
          {intl.formatMessage(messages.staticRemediationDesc)}
        </CardBody>
        <CardBody className="body">{RebootRequired(reboot_required)}</CardBody>
      </div>

      <div className="pathwayRight pf-v6-u-p-lg ">
        <p className="pf-v6-u-font-weight-bold pf-v6-u-font-size-sm">
          {intl.formatMessage(messages.reclvl)}
        </p>
        <div>
          <RecommendationLevel recLvl={recommendation_level} />
        </div>
      </div>
    </Card>
  );
};
