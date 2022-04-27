import React from 'react';
import './_BarDividedList.scss';

const BarDividedList = (list) =>
  list.map((element, index) => (
    <React.Fragment key={index}>
      {element}
      {index + 1 !== list.length && (
        <strong className="adv-verticalDivider">&nbsp;&#124;&nbsp;</strong>
      )}
    </React.Fragment>
  ));

export default BarDividedList;
