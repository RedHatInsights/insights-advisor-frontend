import React from 'react';
import PropTypes from 'prop-types';
import './SummaryChartItem.scss';

const SummaryChartItem = (props) => {
  const numIssues = props.numIssues;
  let percentage = ((numIssues / props.totalIssues) * 100).toFixed(1);
  let lowerCaseName = props.name.toLowerCase();

  return (
    <li>
      {numIssues > 0 && 
        <React.Fragment>
          <div className='metrics'>
            <strong>{props.name} </strong>
            <span className='num'>({percentage}%)</span>
          </div>
          <div className='progress-bars'>
            <div
              className={'progress-bar progress-bar-' + lowerCaseName}
              style={{width: percentage + '%'}}
            ></div>
            <div className='bar'></div>
          </div>
        </React.Fragment>
      }
      {numIssues == 0 &&
        <div className='no-errors'><i className='fas fa-check-circle small-spacer green'></i>You have no issues of { lowerCaseName } severity</div>
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