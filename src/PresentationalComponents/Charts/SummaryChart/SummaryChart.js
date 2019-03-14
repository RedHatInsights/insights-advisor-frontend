import React from 'react';
import PropTypes from 'prop-types';

const SummaryChart = (props) => {
    return (
        <div className={ `summary-chart ${props.className}` } widget-type='InsightsSummaryChart'>
            <ul> { props.children } </ul>
        </div>
    );
};

SummaryChart.propTypes = {
    children: PropTypes.array,
    className: PropTypes.string
};

export default SummaryChart;
