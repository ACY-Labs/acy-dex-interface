import React, { useState, useEffect } from 'react';
// import ReactDOM from 'react-dom';
import { Pie } from '@ant-design/plots';
import form from '@/locales/en-US/form';
import { formatUnits } from '@ethersproject/units';

const TokenWeightPieChart = (props) => {
  const {tokens} = props
  const data = tokens?.map(token => {
    return {
      type: token.symbol,
      value: parseInt(formatUnits(token.volume, 18)),
    }
  })
  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    style: {
      height: '200px',
    },
    // width:'335px',
    radius: 0.75,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };
  return <Pie {...config} />;
};

export default TokenWeightPieChart;


// ReactDOM.render(<DemoPie />, document.getElementById('container'));