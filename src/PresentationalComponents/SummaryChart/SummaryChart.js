import React from 'react';
import PropTypes from 'prop-types';
import asyncComponent from '../../Utilities/asyncComponent';
const SummaryChartItem = asyncComponent(() => import('../../PresentationalComponents/SummaryChartItem/SummaryChartItem.js'));

const SummaryChart = (props) => {
    return (
        <div className='summary-chart'>
            <ul> { props.children } </ul>
        </div>
    );
};

SummaryChart.propTypes = {
    children: PropTypes.array
};

export default SummaryChart;
