import React from 'react';
import PropTypes from 'prop-types';
import './SummaryChartItem.scss';

const SummaryChartItem = (props) => {
  const numIssues = props.numIssues;
  let percentage = ((numIssues / props.totalIssues) * 100).toFixed(1);
  let lowerCaseName = props.name.toString().toLowerCase();

  return (
    <li>
      <div className='metrics'>
        <strong>{props.name} </strong> 
        <span className='num'>({percentage}%)</span>
      </div>
      {numIssues > 0 && 
        <div className='progress-bars'>
          <div 
            className={'progress-bar progress-bar-' + lowerCaseName}
            style={{width: percentage + '%'}}
          ></div>
          <div className='bar'></div>
        </div>
        }
        {numIssues == 0 &&
          <div className='metrics'>You have no issues of { props.name } severity</div>
        }
    </li>
  );
};

SummaryChartItem.propTypes = {
  name: PropTypes.string.isRequired,
  totalIssues: PropTypes.number.isRequired,
  numIssues: PropTypes.number.isRequired,
}

export default SummaryChartItem;