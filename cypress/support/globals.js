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
export const columns = [
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
    title: intl.formatMessage(messages.riskOfChange),
  },
  {
    title: intl.formatMessage(messages.systems),
  },
  {
    title: intl.formatMessage(messages.remediation),
  },
];

export const CATEGORIES = {
  'Service Availability': ['service_availability'],
  Security: ['security'],
  'Fault Tolerance': ['fault_tolerance'],
  Performance: ['performance'],
};
