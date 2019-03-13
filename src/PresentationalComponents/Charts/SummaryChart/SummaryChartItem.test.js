import SummaryChartItem from './SummaryChartItem';

import renderer from 'react-test-renderer';

describe('SummaryChartItem', () => {
    it('renders a bar with issues', () => {
        const renders = renderer.create(
            <SummaryChartItem
                name={ 'withIssue' }
                numIssues={ 4 }
                totalIssues={ 4 }/>
        ).toJSON();
        expect(renders).toMatchSnapshot;
    });

    it('renders check with no issues', () => {
        const renders = renderer.create(
            <SummaryChartItem
                name={ 'noIssue' }
                numIssues={ 0 }
                totalIssues={ 0 }/>
        ).toJSON();
        expect(renders).toMatchSnapshot;
    });
});
