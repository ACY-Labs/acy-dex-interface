import React, { Component, useState, useEffect } from 'react';
import style from './index.less';

const AcyRoutingChart = props => {
  console.log('routing', props.data);
  const { data } = props;
  // 上行路径
  const [topLine, setTopLine] = useState([]);
  // 中间路径
  const [middleLine, setMiddleLine] = useState();
  // 下行路径
  const [bottomLine, setBottomLine] = useState([]);

  return (
    <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 600 300">
      <g transform="translate(50,150)">
        {
          data.length > 1 &&
          <g>
            <path
              id="upcurve"
              d="M0,0
            a220,110 0 1,1 500,0"
              style={{ fill: "none", stroke: "gray", strokeWidth: 2 }}
            />
          </g>
        }

        <g>
          <path
            id="line"
            d="M0,0 L500,0"
            style={{ fill: 'none', stroke: 'gray', strokeWidth: 2 }}
          />
        </g>
        {
          data.length > 2 &&
          <g>
            <path
              id="downcurve"
              d="M0,0
            a220,110 0 1,0 500,0"
              style={{ fill: "none", stroke: "gray", strokeWidth: 2 }}
            />
          </g>}
        <g>
          {/* <g
          transform="translate(60,-120)"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          <text
            x="0"
            y="15"
            textAnchor="middle"
            stroke="white"
            strokeWidth="1px"
            alignmentBaseline="middle"
          >
            15%
          </text>
        </g> */}
          <g transform="translate(60,-40)" textAnchor="middle" alignmentBaseline="middle">
            <text
              x="0"
              y="15"
              textAnchor="middle"
              stroke="#eb5c20"
              strokeWidth="1px"
              alignmentBaseline="middle"
            >
              100%
            </text>
          </g>
          {/* <g
          transform="translate(60,40)"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          <text
            x="0"
            y="15"
            textAnchor="middle"
            stroke="white"
            strokeWidth="1px"
            alignmentBaseline="middle"
          >
            15%
          </text>
        </g> */}
        </g>
        <g className="coin">
          <g>
            <circle id="USDC" r="30" cx="0" cy="0" />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              stroke="white"
              strokeWidth="1px"
              alignmentBaseline="middle"
            >
              {data && data.length > 0 && data[0].from}
            </text>
          </g>
          {
            data.length > 1 &&
            <g>
              <circle
                r="30"
                cx="250"
                cy="-125"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >

              </circle>
              <text
                x="250"
                y="-125"
                textAnchor="middle"
                stroke="red"
                strokeWidth="1px"
                alignmentBaseline="middle"
              >
                {data[0].middle}
              </text>
            </g>
          }
          {
            data.length > 2 &&
            <g>
              <circle
                id="DOT"
                r="30"
                cx="250"
                cy="130"
                fill="none"
                stroke="white"
                stroke-width="2"
              >

              </circle>
              <text
                x="250"
                y="130"
                textAnchor="middle"
                stroke="red"
                strokeWidth="1px"
                alignmentBaseline="middle"
              >
                {data[2].from}
              </text>
            </g>
          }
          <g>
            <circle id="BTC" r="30" cx="500" cy="0" fill="none" stroke="white" stroke-width="2" />
            <text x="500" y="0" text-anchor="middle" stroke-width="1px" alignmentBaseline="middle">
              {data && data.length > 0 && data[0].to}
            </text>
          </g>
        </g>
        {/* 交易金额 */}
        <g>
          <g>
            <text
              x="250"
              y="-20"
              text-anchor="middle"
              stroke-width="1px"
              stroke="white"
              alignmentBaseline="middle"
            >
              {middleLine && middleLine.value}
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default AcyRoutingChart;
