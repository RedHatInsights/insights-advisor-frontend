import React from 'react';
import PropTypes from 'prop-types';

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
