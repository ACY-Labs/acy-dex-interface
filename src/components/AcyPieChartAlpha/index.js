import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; //渐变色
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入

function genData() {
  var tokenList = ['BTC', 'ACY'];
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
      grid: {
        left: '0',
        right: '0',
        bottom: '0',
        top: '0',
      }, 
      backgroundColor:'rgba(128, 128, 128, 0)', //rgba设置透明度0.1
      series: [
        {
          type: 'pie',
          data: data.seriesData,
          emptyCircleStyle:{
            borderColor:'#fff'
          }
        },
      ],
    };
  };
  onChartClick = (param, echarts) => {
    alert(1);
    console.log(param);
  };
  render() {
    const onEvents = {
      click: this.onChartClick,
    };
    return (
      <ReactEcharts
      style={{width:'100%',height:'300px'}}
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
