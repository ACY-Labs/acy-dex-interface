import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; //渐变色
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入

function genData() {
  var tokenList = ['USDC', 'WETH', 'ETH', 'WBTC', 'USDT'];
  var legendData = [];
  var seriesData = [];
  for (var i = 0; i < tokenList.length; i++) {
    legendData.push(tokenList[i]);
    seriesData.push({
      name: tokenList[i],
      value: Math.round(Math.random() * 100000),
    });
  }

  return {
    legendData: legendData,
    seriesData: seriesData,
  };
}

class AcyPieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgType: 'line', // 默认折线图
      xtitle: this.props.xtitle || 'default x axis', // x轴类目名称取参
    };
  }
  componentDidMount() {}
  // getOption 这个函数主要用于配置 option，包括将数据配置进去
  // 也可以将其放在 state 中，然后通过 setState 更新
  getOption = () => {
    var data = genData(50);

    return {
      title: {
        text: 'Gauge relative weight',
        left: 'center',
        textStyle: {
          color: '#b5b5b6',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {d}%',
      },
      backgroundColor: 'transparent',
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: data.seriesData,
        },
      ],
    };
  };
  onChartClick = (param, echarts) => {
    console.log(param);
  };
  render() {
    const onEvents = {
      click: this.onChartClick,
    };
    return (
      <ReactEcharts
        style={{ minHeight: '400px', width: '100%' }}
        option={this.getOption()}
        notMerge
        lazyUpdate
        theme={'dark'}
        ref={e => {
          this.echartsElement = e;
        }}
        onEvents={onEvents}
      />
    );
  }
}

export default AcyPieChart;
