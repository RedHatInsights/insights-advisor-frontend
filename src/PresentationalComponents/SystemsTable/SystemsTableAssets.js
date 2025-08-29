import React from 'react';
import { wrappable } from '@patternfly/react-table';

import messages from '../../Messages';
import RuleLabels from '../Labels/RuleLabels';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { Link } from 'react-router-dom';
import { lastSeenColumn } from '../Inventory/helpers';

export const systemsTableColumns = (intl, envContext) => [
  {
    key: 'display_name',
    transforms: [wrappable],
    renderFunc: (data, id, system) => (
      <React.Fragment>
        {envContext.loadChromeless ? (
          <Link key={id} to={`/systems/${system.system_uuid}`}>
            {`${system.display_name} `}
          </Link>
        ) : (
          <InsightsLink key={id} to={`/systems/${system.system_uuid}`}>
            {`${system.display_name} `}
          </InsightsLink>
        )}
        {system.incident_hits > 0 && <RuleLabels rule={{ tags: 'incident' }} />}
      </React.Fragment>
    ),
  },
  {
    key: 'groups',
    requiresDefault: true,
    transforms: [wrappable],
  },
  {
    key: 'tags',
  },
  {
    key: 'system_profile',
    transforms: [wrappable],
  },
  {
    title: intl.formatMessage(messages.numberRuleHits),
    transforms: [wrappable],
    key: 'hits',
  },
  {
    title: intl.formatMessage(messages.critical),
    transforms: [wrappable],
    key: 'critical_hits',
  },
  {
    title: intl.formatMessage(messages.important),
    transforms: [wrappable],
    key: 'important_hits',
  },
  {
    title: intl.formatMessage(messages.moderate),
    transforms: [wrappable],
    key: 'moderate_hits',
  },
  {
    title: intl.formatMessage(messages.low),
    transforms: [wrappable],
    key: 'low_hits',
  },
  lastSeenColumn,
];
