import React, { useState, useEffect } from 'react';
// import ReactDOM from 'react-dom';
import { Pie } from '@ant-design/plots';

const TokenWeightPieChart = (props) => {
  const {tokens} = props
  const data = [
    {
      type: 'Token 1',
      value: 27,
    },
    {
      type: 'Token 2',
      value: 25,
    },
    {
      type: 'Token 3',
      value: 18,
    },
    {
      type: 'Token 4',
      value: 15,
    },
    {
      type: 'Token 5',
      value: 10,
    },
    {
      type: 'Token 6',
      value: 5,
    },
  ];
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