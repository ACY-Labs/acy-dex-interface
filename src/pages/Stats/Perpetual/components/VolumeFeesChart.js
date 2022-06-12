import React, { Component,  useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; //渐变色
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入
import styles from './chart.less';
import {COLORS} from '../test';
import { Icon} from 'antd';

let defaultData = [
  ['2000-06-05', 116, 200],
  ['2000-06-06', 129, 201],
  ['2000-06-07', 135, 202],
  ['2000-06-08', 86, 203],
  ['2000-06-09', 73, 204],
  ['2000-06-10', 85, 205],
  ['2000-06-11', 73, 206],
  ['2000-06-12', 68, 207],
  ['2000-06-13', 92, 208],
  ['2000-06-14', 130, 209],
  ['2000-06-15', 245, 210],
  ['2000-06-16', 139, 211],
  ['2000-06-17', 115, 212],
  ['2000-06-18', 111, 213],
  ['2000-06-19', 309, 214],
  ['2000-06-20', 206, 215],
  ['2000-06-21', 137, 216],
  ['2000-06-22', 1000, 217],
  ['2000-06-23', 85, 218],
  ['2000-06-24', 94, 219],
  ['2000-06-25', 71, 220],
  ['2000-06-26', 106, 221],
  ['2000-06-27', 84, 222],
  ['2000-06-28', 93, 223],
  ['2000-06-29', 85, 224],
  ['2000-06-30', 73, 225],
  ['2000-07-01', 83, 226],
  ['2000-07-02', 125, 227],
  ['2000-07-03', 107, 228],
  ['2000-07-04', 82, 229],
  ['2000-07-05', 44, 230],
  ['2000-07-06', 72, 231],
  ['2000-07-07', 106, 232],
  ['2000-07-08', 107, 233],
  ['2000-07-09', 66, 234],
  ['2000-07-10', 91, 245],
  ['2000-07-11', 92, 236],
  ['2000-07-12', 113, 256],
  ['2000-07-13', 107, 226],
  ['2000-07-14', 131, 246],
  ['2000-07-15', 111, 226],
  ['2000-07-16', 64, 256],
  ['2000-07-17', 69, 246],
  ['2000-07-18', 88, 256],
  ['2000-07-19', 77, 286],
  ['2000-07-20', 83, 206],
  ['2000-07-21', 111, 226],
  ['2000-07-22', 57, 226],
  ['2000-07-23', 55, 246],
  ['2000-07-24', 60, 276],
];



const VolumeFeesChart = props => {
    const {
        title,
        data,
        loading
    } = props;
    const [selectedIndex, setSelectedIndex] = useState(0);
    // const data = defaultData;
    // const [data, setData ] = useState();
//   constructor(props) {
//     super(props);
//     this.state = {
//       imgType: 'line', // 默认折线图
//       xtitle: "VOLUME 24H", // x轴类目名称取参
//       data: this.props.defaultData,
//     };
//   }

  // re render when the data changes
//   componentDidUpdate(prevProps, prevState){
//     if (prevProps.data !== this.props.data) {
//       // dummy state update to force re render
//       this.setState({
//         data: this.props.data
//       })
//     }
//   }
    useEffect(() => {
        console.log("DATA VOLUME:", data);
        // setSelectedIndex(0);
    },[data])

  const renderTooltip = v => {
    //   return ;
    // if (this.props.onHover) this.props.onHover(v[0].data, v[0].dataIndex);
    // console.log("TEST HERE:", v);
    const idx = v[0].dataIndex;
    console.log("TEST HERE:", );
    // setSelectedIndex(1);
    return `
      <span style="color :#b5b5b6"> ${formatFullTimestamp(data[idx].timestamp)} , ${formatCurrency(data[idx].all)}</span></br>
      <span style="color :${COLORS[0]}">Swap  : ${data[idx].swap?formatCurrency(data[idx].swap): "-"}</span></br>
      <span style="color :${COLORS[1]}">Mint  GLP  : ${data[idx].mint?formatCurrency(data[idx].mint): "-"}</span></br>
      <span style="color :${COLORS[2]}">Burn GLP  : ${data[idx].burn?formatCurrency(data[idx].burn): "-"}</span></br>
      <span style="color :${COLORS[3]}">Liquidation  : ${data[idx].liquidation?formatCurrency(data[idx].liquidation): "-"}</span></br>
      <span style="color :${COLORS[4]}">Margin trading  : ${data[idx].margin?formatCurrency(data[idx].margin): "-"}</span></br>
      <span style="color :${COLORS[0]}">Cumulative  : ${data[idx].cumulative?formatCurrency(data[idx].cumulative): "-"}</span></br>
    `;
    // else return;
  };

  const formatCurrency = (number) => number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const formatTimestamp = (second) => {
    let unix_timestamp = second
    var date = new Date(unix_timestamp * 1000);
    var hours = date.getFullYear();
    var minutes = "0" + (date.getMonth() == 0? '12' : date.getMonth());
    var seconds = "0" + date.getDate();
    var ret = minutes.slice(-2) + '.' + seconds.slice(-2) ;
    return ret;
  }
  const formatFullTimestamp = (second) => {
    let unix_timestamp = second
    var date = new Date(unix_timestamp * 1000);
    var year = date.getFullYear();
    var month = "0" + (date.getMonth() == 0? '12' : date.getMonth());
    var date = "0" + date.getDate();
    var ret = year + '.' + month.slice(-2) + '.' + date.slice(-2) ;
    return ret;
  }

  const getOption = () => {
    let chartData = data;
    if (!data) {
      chartData = defaultData;
    }
    var dateList = chartData.map(function(item) {
      return item.timestamp;
    });
    var cumulative = chartData.map(function(item) {
        return parseInt(item.cumulative);
    });
    var valueList = chartData.map(function(item) {
      return parseInt(item.swap);
    });
    var valueList2 = chartData.map(function(item) {
      return parseInt(item.mint);
    }); 
    var valueList3 = chartData.map(function(item) {
        return parseInt(item.burn);
    });
    var valueList4 = chartData.map(function(item) {
        return parseInt(item.liquidation);
    }); 
    var valueList5 = chartData.map(function(item) {
        return parseInt(item.margin);
    }); 
    let showXAxis = true;
    let options = {
      grid: {
        left: '2%',
        right: '2%',
        top: 'top',
      },
      legend: {
        data: ['Swap', 'Mint GLP', 'Burn GLP', 'Liquidation', 'Margin trading', 'Cumulative'],
        top: 'bottom',
        textStyle: {
            color: '#FFF',
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: renderTooltip,
      },
      xAxis: {
        show: showXAxis,
        splitNumber: 5,
        boundaryGap: false,
        data: dateList.map(function(item) {
          return formatTimestamp(item);
        }),
        axisTick: { show: false }, // 刻度
        axisLine: { show: false }, // 轴线
        splitLine: {
          show: false,
        },
      },
      yAxis: [
        {
            show: false,
            type: 'value',
            splitLine: {
              show: true,
            },
            axisTick: { show: false }, // 刻度
            axisLine: { show: false }, // 轴线
        },
        {
            show: false,
            type: 'value',
            splitLine: {
              show: true,
            },
            axisTick: { show: false }, // 刻度
            axisLine: { show: false }, // 轴线
        }
      ],
      series: [
        {
          data: valueList,
          type: 'bar',
          stack: true,
          name: "Swap",
          smooth: 1, //true 为平滑曲线，false为直线
          showSymbol: false, //是否默认展示圆点
          itemStyle: {
            normal: {
              color: COLORS[0],
              width: 2,
            },
          },
        },
        {
            data: valueList2,
            type: 'bar',
            stack: true,
            name: "Mint GLP",
            smooth: 1, //true 为平滑曲线，false为直线
            showSymol: false, //是否默认展示圆点
            itemStyle: {
              normal: {
                color: COLORS[1],
                width: 2,
              },
            },
          },
          {
            data: valueList3,
            type: 'bar',
            name: "Burn GLP",
            stack: true,
            smooth: 1, //true 为平滑曲线，false为直线
            showSymol: false, //是否默认展示圆点
            itemStyle: {
              normal: {
                color: COLORS[2],
                width: 2,
              },
            },
          },
          {
            data: valueList4,
            type: 'bar',
            stack: true,
            name: "Liquidation",
            smooth: 1, //true 为平滑曲线，false为直线
            showSymol: false, //是否默认展示圆点
            itemStyle: {
              normal: {
                color: COLORS[3],
                width: 2,
              },
            },
          },
          {
            data: valueList5,
            type: 'bar',
            stack: true,
            name: "Margin trading",
            smooth: 1, //true 为平滑曲线，false为直线
            showSymol: false, //是否默认展示圆点
            itemStyle: {
              normal: {
                color: COLORS[4],
                width: 2,
              },
            },
          },
          {
            data: cumulative,
            type: 'line',
            yAxisIndex: 1,
            name: "Cumulative",
            smooth: 1, //true 为平滑曲线，false为直线
            showSymbol: false, //是否默认展示圆点
            itemStyle: {
                normal: {
                lineStyle: {
                    color: COLORS[0],
                    width: 3,
                },
                },
            },
          },
      ],
    };

    return options;
  };

//   onChartClick = (param, echarts) => {
//     console.log(param);
//   };
    return (
        loading ? (
          <Icon 
            type="loading" 
            style={{ fontSize: '16px', color: '#FFF' }}
          />
        ):(
        <div className={styles.chartSectionMain}>
        <div className={styles.graphStats}> 
            <div className={styles.statName}>{title}</div>
            {/* <div className={styles.statValue}>{title}</div> */}
            {/* <div className={styles.statName}>2021-02-03</div> */}
        </div>
        <div className={styles.chartWrapper}>
            <ReactEcharts
                style={{ height: '100%' }}
                option={getOption()}
                notMerge
                lazyUpdate={false}
                theme={'theme_name'}
                ref={e => {
                //  echartsElement = e;
                }}
                onEvents={null}
            />
        </div>
    </div>)
    );
}

export default VolumeFeesChart;
