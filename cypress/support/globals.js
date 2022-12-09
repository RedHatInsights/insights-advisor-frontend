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
    title: intl.formatMessage(messages.pathwaysName),
  },
  {
    title: intl.formatMessage(messages.category),
  },
  {
    title: intl.formatMessage(messages.systems),
  },
  {
    title: intl.formatMessage(messages.reboot),
  },
  {
    title: intl.formatMessage(messages.reclvl),
  },
];
