import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; // 渐变色
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入
import moment from 'moment';

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

class AcyPriceChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgType: 'line', // 默认折线图
      xtitle: this.props.xtitle, // x轴类目名称取参
      data: this.props.data,
    };
  }

  componentDidMount() { }

  renderTooltip = v => {
    const { onHover, showTooltip } = this.props;
    if (onHover) onHover(v[0].data, v[0].dataIndex);

    if (showTooltip) return `<span style="color:#b5b5b6"> $ ${v[0].data} </span>`;
  };

  getOption = () => {
    const { showXAxis, title, lineColor, showGradient, bgColor, range, format } = this.props;
    let { data: chartData } = this.props;
    if (!chartData) {
      chartData = defaultData;
    }

    const dateList = chartData.map(item => item[0]);
    const valueList = chartData.map(item => item[1]);

    const options = {
      title: {
        text: title,
        left: 'center',
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
        formatter: this.renderTooltip,
      },
      xAxis: {
        axisLabel: {
          fontSize: 15,
        },
        show: showXAxis,
        splitNumber: 5,
        boundaryGap: false,
        data: dateList.map((item, index) =>
          index !== 0 && index !== dateList.length - 1 ? moment(item)
            .locale('en')
            .local()
            .format(format)
            : ""
        ),
        axisTick: { show: false }, // 刻度
        axisLine: { show: false }, // 轴线
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        // show: false,
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            color: "#757579",
            type: "dashed"
          }
        },
        scale: true,
        axisTick: { show: false }, // 刻度
        axisLine: { show: false }, // 轴线
      },
      series: [
        {
          data: valueList,
          type: 'line',
          smooth: 1, // true 为平滑曲线，false为直线
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
        left: 0,
        right: 0,
        top: 0,
        // bottom: 0,
      }
    };

    if (showGradient == true) {
      options.series[0].areaStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: lineColor || '#c6224e' },
          { offset: 1, color: bgColor || '#29292c' },
        ]),
      };
    }

    return options;
  };

  render() {
    return (
      <ReactEcharts
        style={{ height: '100%' }}
        option={this.getOption()}
        notMerge
        lazyUpdate={false}
        ref={e => {
          this.echartsElement = e;
        }}
      />
    );
  }
}

export default AcyPriceChart;
