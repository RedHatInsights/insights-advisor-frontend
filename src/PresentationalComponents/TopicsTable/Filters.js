import messages from '../../Messages';

export const nameFilter = (intl) => ({
  type: 'text',
  label: intl.formatMessage(messages.name).toLowerCase(),
  filterAttribute: 'name',
});

export default (intl) => [nameFilter(intl)];
