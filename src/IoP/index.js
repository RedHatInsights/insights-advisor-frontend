import { withIoP } from './context/withIoP';
import ListIop from './components/Recs/ListIop';
import IopRecommendationDetails from './components/Recs/IopRecommendationDetails';
import IopOverviewDashbar from './components/IopOverviewDashbar';
import { IopOverviewDashbarCard } from './components/Cards/IopOverviewDashbarCard';
import IopViewHostAcks from './components/Modals/IopViewHostAcks';
import IopSystemAdvisor from './components/IopSystemAdvisor';
import SystemDetail from './modules/SystemDetail';
import RulesTable from '../PresentationalComponents/RulesTable/RulesTable';

/**
 * IoP component collection.
 * All components are pre-wrapped with withIoP HOC (where applicable) to provide
 * IoP environment context, internationalization, and Redux store.
 *
 * @namespace IoP
 * @property {React.ComponentType} ListIop - Recommendations list page (wrapped)
 * @property {React.ComponentType} IopRecommendationDetails - Recommendation detail page (wrapped)
 * @property {React.ComponentType} IopOverviewDashbar - Overview dashboard component
 * @property {React.ComponentType} IopOverviewDashbarCard - Dashboard card component
 * @property {React.ComponentType} IopViewHostAcks - Host acknowledgements modal
 * @property {React.ComponentType} IopSystemAdvisor - System advisor component
 * @property {React.ComponentType} SystemDetail - System detail module (wrapped)
 * @property {React.ComponentType} RulesTable - Rules/recommendations table (wrapped)
 *
 * @example
 * // Import specific components
 * import { IoP } from './IoP';
 *
 * // Use in your app
 * <IoP.ListIop />
 * <IoP.IopRecommendationDetails ruleId="RULE_123" />
 * <IoP.SystemDetail response={systemData} />
 */
export const IoP = {
  ListIop: withIoP(ListIop),
  IopRecommendationDetails: withIoP(IopRecommendationDetails),
  IopOverviewDashbar,
  IopOverviewDashbarCard,
  IopViewHostAcks,
  IopSystemAdvisor,
  SystemDetail: withIoP(SystemDetail),
  RulesTable: withIoP(RulesTable),
};

/**
 * Higher-Order Component for wrapping components with IoP context.
 * @see {@link module:IoP/context/withIoP~withIoP}
 */
export { withIoP } from './context/withIoP';

/**
 * IoP environment context configuration.
 * @see {@link module:IoP/constants~IOP_ENVIRONMENT_CONTEXT}
 */
export { IOP_ENVIRONMENT_CONTEXT } from './constants';
