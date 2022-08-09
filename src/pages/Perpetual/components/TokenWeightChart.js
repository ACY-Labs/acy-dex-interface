import React, { useState, useEffect, memo } from 'react';
import ReactDOM from 'react-dom';
import { Bar } from '@ant-design/plots';
import { getTokenInfo,formatAmount,USD_DECIMALS } from '@/acy-dex-futures/utils';


const TokenWeightChart = (props) => {
    const {tokenList,infoTokens} = props
    const tokenListData = []
    tokenList.map((token)=>{
        const tokenInfo = getTokenInfo(infoTokens, token.address)
        let managedUsd
        if (tokenInfo && tokenInfo.managedUsd) {
            managedUsd = tokenInfo.managedUsd
        }
        const tData = {
            type: "Token",
            name: token.name,
            // pool: 20,
            pool: parseFloat(formatAmount(managedUsd, USD_DECIMALS, 2, true).replace(",", ""))
        }
        tokenListData.push(tData)
    })
    console.log("DDDD",tokenListData)
    const data = tokenListData
    const config = {
        data,
        xField: 'pool',
        yField: 'type',
        seriesField: 'name',
        isPercent: true,
        isStack: true,
        xAxis: {
          grid: {
            line: ""
          },
          label: "",
        },
        yAxis: {
          grid: {
            line: ""
          },
          label: "",
          position:"right",
        },
        legend: {
          position:"bottom",
          flipPage:false
        },
        maxBarWidth:20,
        /** 自定义颜色 */
        // color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
        label: {
          position: 'middle',
          content: (item) => {
            let percent = (item.pool*100).toFixed(2)
            return percent>5 ? percent+"%" : ""
          },
          style: {
            fill: '#fff',
          },
        },
        height: 150,
        animation: false
    };
    console.log("CCCCC",tokenList)
    return <Bar {...config}/>
}

export default TokenWeightChart;
// export default memo(TokenWeightChart, (pre, next) => { 
//     return _.isEqual(pre.data, next.data);
//   });