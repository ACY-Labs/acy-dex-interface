import React, { useState, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; // 渐变色
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入
import moment from 'moment';
import { Icon } from 'antd';

const defaultData = [
  ['2000-06-05', 116],
  ['2000-06-06', 129],
  ['2000-06-07', 135],
  ['2000-06-08', 86],
  ['2000-06-09', 73],
  ['2000-06-10', 85],
  ['2000-06-11', 73],
  ['2000-06-12', 68],
  ['2000-06-13', 92],
  ['2000-06-14', 130],
  ['2000-06-15', 245],
  ['2000-06-16', 139],
  ['2000-06-17', 115],
  ['2000-06-18', 111],
  ['2000-06-19', 309],
  ['2000-06-20', 206],
  ['2000-06-21', 137],
  ['2000-06-22', 1000],
  ['2000-06-23', 85],
  ['2000-06-24', 94],
  ['2000-06-25', 71],
  ['2000-06-26', 106],
  ['2000-06-27', 84],
  ['2000-06-28', 93],
  ['2000-06-29', 85],
  ['2000-06-30', 73],
  ['2000-07-01', 83],
  ['2000-07-02', 125],
  ['2000-07-03', 107],
  ['2000-07-04', 82],
  ['2000-07-05', 44],
  ['2000-07-06', 72],
  ['2000-07-07', 106],
  ['2000-07-08', 107],
  ['2000-07-09', 66],
  ['2000-07-10', 91],
  ['2000-07-11', 92],
  ['2000-07-12', 113],
  ['2000-07-13', 107],
  ['2000-07-14', 131],
  ['2000-07-15', 111],
  ['2000-07-16', 64],
  ['2000-07-17', 69],
  ['2000-07-18', 88],
  ['2000-07-19', 77],
  ['2000-07-20', 83],
  ['2000-07-21', 111],
  ['2000-07-22', 57],
  ['2000-07-23', 55],
  ['2000-07-24', 60],
];

function getTIMESTAMP(time) {
  var date = new Date(time);
  var year = date.getFullYear(time);
  var month = ("0" + (date.getMonth(time) + 1)).substr(-2);
  var day = ("0" + date.getDate(time)).substr(-2);
  var hour = ("0" + date.getHours(time)).substr(-2);
  var minutes = ("0" + date.getMinutes(time)).substr(-2);
  var seconds = ("0" + date.getSeconds(time)).substr(-2);

  return hour + ":" + minutes + ":" + seconds;
  // return `${year}-${month}-${day}`;

}

const AcyPriceChart = (props) => {

  const echartsElement = useRef();
  const [echartInstance, setEchartInstance] = useState(null);
  
  // get a reference to the echartInstance
  // https://github.com/hustcc/echarts-for-react#component-api--echarts-api
  useEffect(() => {
    if (echartsElement.current) {
      console.log("echartsElement", echartsElement)
      setEchartInstance(echartsElement.current.getEchartsInstance());
    }
  }, [echartsElement]);

  // update chart data from props
  // clear and setOption will enable plotting animation
  useEffect(() => {
    let options = {};
    if (props.data.length) {
      console.log("test update chartData", props.data)
      options = getOption(props.data);
    }
    if (echartInstance) {
      console.log("cleared and set option");
      echartInstance.clear();
      setTimeout(echartInstance.setOption(options),500);
    }
  }, [props.data, echartInstance]);

  const renderTooltip = v => {
    const { onHover, showTooltip } = props;
    if (onHover) onHover(v[0].data, v[0].dataIndex);
    // console.log("V",v);
    if (showTooltip) return `
    
    <div className = "flew-row ">
    <div style="color:black"> Time : ${v[0].axisValue}</div>
    <div style="color:black"> Price : $ ${v[0].data} </div>
    </div>
    `;
  };

  const getOption = (chartData) => {
    const { showXAxis, title, lineColor, showGradient, bgColor, range, format } = props;

    const dateList = chartData.map(item => item[0]);
    const valueList = chartData.map(item => item[1]);

    const options = {
      title: {
        text: valueList.length ? title : "No data",
        left: 'center',
        top: valueList.length ? 'auto' : 'center',
        textStyle: {
          color: '#b5b5b6',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          axis: 'x',
          label: {
            backgroundColor: 'black',
          },
        },
        formatter: renderTooltip,
      },
      xAxis: {
        axisLabel: {
          fontSize: 15,
        },
        show: true,
        splitNumber: 5,
        boundaryGap: false,
        data: dateList
        .map
        ((item, index) =>
         item = getTIMESTAMP(item)
        )
        ,
        axisTick: { show: false }, // 刻度
        axisLine: { show: false }, // 轴线
        splitLine: {
          show: false,
        },
        axisLabel: { color: "#b5b5b6"}
      },
      yAxis: {
        show: true,
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            color: "#29292c",
            type: "solid"
          }
        },
        scale: true,
        axisTick: { show: false }, // 刻度
        axisLine: { show: false }, // 轴线
        axisLabel: { color: "#b5b5b6"}
      },
      series: [
        {
          // shaded area setting is set via "showGradient" down below.
          data: valueList,
          type: 'line',
          smooth: false, // true 为平滑曲线，false为直线
          showSymbol: false, // 是否默认展示圆点
          itemStyle: {
            normal: {
              lineStyle: {
                color: lineColor || '#c6224e',
                width: 2,
              },
            },
          },
        },
      ],
      grid: {
        // left: 0,
        // right: 10,
        // top: 10,
        // bottom: 0,
      }
    };

    if (showGradient == true) {
      options.series[0].areaStyle = {
        // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        //   { offset: 0, color: lineColor || '#c6224e' },
        //   { offset: 1, color: bgColor || '#29292c' },
        // ]),
      };
    }

    return options;
  };


    return (
      <ReactEcharts
        style={{
          height: '100%',
          // marginLeft: "-40px"
          color:'black',
        }}
        option={{}} // it will be override by useEffect
        notMerge
        lazyUpdate={true}
        ref={echartsElement}
      />
    );
  
}

export default AcyPriceChart;
