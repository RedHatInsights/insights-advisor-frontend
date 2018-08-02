import React from 'react';
import PropTypes from 'prop-types';
import SummaryChartItem from '../../PresentationalComponents/SummaryChartItem/SummaryChartItem.js';

const SummaryChart = (props) => {
  return (
    <div className='summary-chart'>
      <ul>
        { props.children }
      </ul>
    </div>
  );
};

SummaryChartItem.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.instanceOf(SummaryChartItem)
  ])
}

export default SummaryChart;