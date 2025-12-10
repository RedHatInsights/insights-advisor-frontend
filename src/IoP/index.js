import { withIoP } from './context/withIoP';
import ListIop from './components/Recs/ListIop';
import IopRecommendationDetails from './components/Recs/IopRecommendationDetails';
import IopOverviewDashbar from './components/IopOverviewDashbar';
import IopSystemAdvisor from './components/IopSystemAdvisor';
import SystemDetail from './modules/SystemDetail';
import RulesTable from '../PresentationalComponents/RulesTable/RulesTable';

export const IoP = {
  ListIop: withIoP(ListIop),
  IopRecommendationDetails: withIoP(IopRecommendationDetails),
  IopOverviewDashbar,
  IopSystemAdvisor,
  SystemDetail: withIoP(SystemDetail),
  RulesTable: withIoP(RulesTable),
};

export { withIoP } from './context/withIoP';
export { IOP_ENVIRONMENT_CONTEXT } from './constants';
