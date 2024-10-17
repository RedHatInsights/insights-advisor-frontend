import messages from '../../src/Messages';
import { createIntl, createIntlCache } from 'react-intl';

//declaring intl to provie it to the columns
const cache = createIntlCache();
const intl = createIntl(
  {
    // eslint-disable-next-line no-console
    onError: console.error,
    locale: navigator.language.slice(0, 2),
  },
  cache
);
export const rulesTableColumns = [
  {
    title: 'Data expansion table header cell',
  },
  {
    title: intl.formatMessage(messages.name),
  },
  {
    title: intl.formatMessage(messages.modified),
  },
  {
    title: intl.formatMessage(messages.category),
  },
  {
    title: intl.formatMessage(messages.totalRisk),
  },
  {
    title: intl.formatMessage(messages.systems),
  },
  {
    title: intl.formatMessage(messages.remediation),
  },
];

export const CATEGORIES = {
  Security: ['security'],
  Availability: ['availability'],
  Performance: ['performance'],
  Stability: ['stability'],
};

export const pathwaysTableColumns = [
  {
    title: 'Name',
  },
  {
    title: 'Category',
  },
  {
    title: 'Systems',
  },
  {
    title: 'Reboot',
  },
  {
    title: 'Recommendation level',
  },
];

export const topicsTableColumns = [
  { title: intl.formatMessage(messages.name) },
  {
    title: intl.formatMessage(messages.featured),
  },
  {
    title: intl.formatMessage(messages.affectedSystems),
  },
];
