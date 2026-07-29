import {
  Name as NameCell,
  Featured as FeaturedCell,
  AffectedSystems as AffectedSystemsCell,
} from './Cells';

export const Name = {
  title: 'Name',
  Component: NameCell,
  sortable: 'name',
  props: { colSpan: 2 },
};

export const Featured = {
  title: 'Featured',
  Component: FeaturedCell,
  sortable: 'featured',
};

export const AffectedSystems = {
  title: 'Affected systems',
  Component: AffectedSystemsCell,
  sortable: 'impacted_systems_count',
};

export default [Name, Featured, AffectedSystems];
