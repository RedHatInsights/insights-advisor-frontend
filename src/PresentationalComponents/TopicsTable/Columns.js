import React from 'react';
import {
  Name as NameCell,
  Featured as FeaturedCell,
  AffectedSystems as AffectedSystemsCell,
} from './Cells';
import messages from '../../Messages';

export const Name = (intl) => ({
  title: intl.formatMessage(messages.name),
  Component: NameCell,
  sortable: 'name',
  props: { colSpan: 2 },
});

export const Featured = (intl) => ({
  title: intl.formatMessage(messages.featured),
  Component: (props) => <FeaturedCell {...props} intl={intl} />,
  sortable: 'featured',
});

export const AffectedSystems = (intl) => ({
  title: intl.formatMessage(messages.affectedSystems),
  Component: AffectedSystemsCell,
  sortable: 'impacted_systems_count',
});

export default (intl) => [Name(intl), Featured(intl), AffectedSystems(intl)];
