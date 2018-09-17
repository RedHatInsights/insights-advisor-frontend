import SummaryChart from './SummaryChart';
import SummaryChartItem from '../SummaryChartItem/SummaryChartItem';

import renderer from 'react-test-renderer';

describe('SummaryChartItem', () => {
    it('expects SummaryChart to render SummaryChartItem', () => {
        const renders = renderer.create(
            <SummaryChart>
                <SummaryChartItem
                    name={ 'withIssue' }
                    numIssues={ 4 }
                    totalIssues={ 4 }/>
                <SummaryChartItem
                    name={ 'noIssues' }
                    numIssues={ 0 }
                    totalIssues={ 4 }/>
            </SummaryChart>
        ).toJSON();
        expect(renders).toMatchSnapshot;
    });
});
