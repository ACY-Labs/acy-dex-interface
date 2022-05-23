import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; //渐变色
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入
import styles from './chart.less';
import { Icon} from 'antd';
import {
    COLORS
  } from '../test';

let defaultData = [
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

class TestChart extends Component {
  constructor(props) {
    super(props);
    console.log("test here:", this.props.loading)
    this.state = {
      imgType: 'line', // 默认折线图
      title: this.props.title, // x轴类目名称取参
      data: this.props.data,
      loading: this.props.loading,
      index: this.props.index
    };
  }
  componentDidMount() {}
  // getOption 这个函数主要用于配置 option，包括将数据配置进去
  // 也可以将其放在 state 中，然后通过 setState 更新
  // setState wrapper

  // re render when the data changes
  componentDidUpdate(prevProps, prevState){
    if (prevProps.data !== this.props.data) {
      // dummy state update to force re render
      this.setState({
        data: this.props.data
      })
    }
    if (prevProps.loading !== this.props.loading) {
        
        // dummy state update to force re render
        this.setState({
            loading: this.props.loading
        })
      }
  }

  renderTooltip = v => {
    // var inner = '<div style="padding: 25px 20px; border: 1px solid #FCEA00; background-color: rgba(0, 0, 0, 0.7);">'+v[0].value+'</div>'
    if (this.props.onHover) this.props.onHover(v[0].data, v[0].dataIndex);
    // console.log("TEST HERE",v[0].dataIndex);

    // if (this.props.showTooltip) return `<span style="color:#b5b5b6"> $ ${v[0].data} </span>`;
    // else return;
  };
  formatCurrency = (number) => number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  formatTimestamp = (second) => {
    let unix_timestamp = second
    var date = new Date(unix_timestamp * 1000);
    var hours = date.getFullYear();
    var minutes = "0" + (date.getMonth() == 0? '12' : date.getMonth());
    var seconds = "0" + date.getDate();
    var ret = minutes.slice(-2) + '.' + seconds.slice(-2) ;
    return ret;
  }
  formatFullTimestamp = (second) => {
    let unix_timestamp = second
    var date = new Date(unix_timestamp * 1000);
    var year = date.getFullYear();
    var month = "0" + (date.getMonth() == 0? '12' : date.getMonth());
    var date = "0" + date.getDate();
    var ret = year + '.' + month.slice(-2) + '.' + date.slice(-2) ;
    return ret;
  }

  getOption = () => {
    // 组装数据，返回配置 option
    const { imgType, xtitle, data } = this.state;

    let chartData = this.props.data;
    if (!this.props.data) {
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

    let showXAxis = this.props.showXAxis;
    let props = this.props;
    let component = this;

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
          formatter: this.renderTooltip,
        },
        xAxis: {
          show: showXAxis,
          splitNumber: 5,
          boundaryGap: false,
          data: dateList.map(function(item) {
            let unix_timestamp = item
            var date = new Date(unix_timestamp * 1000);
            var hours = date.getFullYear();
            var minutes = "0" + (date.getMonth() == 0? '12' : date.getMonth());
            var seconds = "0" + date.getDate();
            var ret = minutes.slice(-2) + '.' + seconds.slice(-2) ;
            return ret;
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
  onChartClick = (param, echarts) => {
    console.log(param);
  };
formatString = (value) => {
    let formattedStr;
    if (value >= 1000000000) {
      formattedStr = `$ ${(value / 1000000000).toFixed(2)}b`;
    }else if (value >= 1000000) {
      formattedStr = `$ ${(value / 1000000).toFixed(2)}m`;
    } else if (value >= 1000) {
      formattedStr = `$ ${(value / 1000).toFixed(2)}k`;
    } else {
      formattedStr = `$ ${(value).toFixed(2)}`;
    }
    return formattedStr;
  }
  render() {
    const onEvents = {
      click: this.onChartClick,
    };
    return (
        this.props.loading ? (
            <Icon type="loading" />
        ):(
        <ReactEcharts
            style={{ height: '100%' }}
            option={this.getOption()}
            notMerge
            lazyUpdate={false}
            theme={'theme_name'}
            ref={e => {
            //  echartsElement = e;
            }}
            onEvents={null}
        />
        )
    );
  }
}

export default TestChart;
