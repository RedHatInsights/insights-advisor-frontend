import React from 'react';
import { Link } from 'react-router-dom';
import { sortable, wrappable } from '@patternfly/react-table';

import messages from '../../Messages';
import RuleLabels from '../Labels/RuleLabels';

export const systemsTableColumns = (intl) => [
  {
    title: intl.formatMessage(messages.name),
    key: 'display_name',
    transforms: [sortable, wrappable],
    props: { isStatic: true },
    renderFunc: (_data, _id, system) => (
      <React.Fragment>
        <Link key={_id} to={`/systems/${system.system_uuid}`}>
          {`${system.display_name} `}
        </Link>
        {system.incident_hits > 0 && <RuleLabels rule={{ tags: 'incident' }} />}
      </React.Fragment>
    ),
  },
  {
    key: 'tags',
  },
  {
    key: 'system_profile',
    transforms: [sortable, wrappable],
  },
  {
    title: intl.formatMessage(messages.numberRuleHits),
    transforms: [sortable, wrappable],
    key: 'hits',
  },
  {
    title: intl.formatMessage(messages.critical),
    transforms: [sortable, wrappable],
    key: 'critical_hits',
  },
  {
    title: intl.formatMessage(messages.important),
    transforms: [sortable, wrappable],
    key: 'important_hits',
  },
  {
    title: intl.formatMessage(messages.moderate),
    transforms: [sortable, wrappable],
    key: 'moderate_hits',
  },
  {
    title: intl.formatMessage(messages.low),
    transforms: [sortable, wrappable],
    key: 'low_hits',
  },
  {
    key: 'updated',
    transforms: [sortable, wrappable],
    props: { width: 20 },
  },
];
