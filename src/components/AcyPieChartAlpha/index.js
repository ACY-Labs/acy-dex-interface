import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入

function genData() {
  const tokenList = ['BTC', 'ACY'];
  const legendData = [];
  const seriesData = [{ value: 40 }, { value: 10 }];
  for (let i = 0; i < tokenList.length; i++) {
    legendData.push(tokenList[i]);
    seriesData[i].name = tokenList[i];
  }

  return {
    legendData,
    seriesData,
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
    const data = genData(50);

    return {
      grid: {
        left: '0',
        right: '0',
        bottom: '0',
        top: '0',
      },
      backgroundColor: 'rgba(128, 128, 128, 0)', // rgba设置透明度0.1
      series: [
        {
          type: 'pie',
          data: data.seriesData,
          emptyCircleStyle: {
            borderColor: '#fff',
          },
        },
      ],
    };
  };

  onChartClick = param => {
    console.log(param);
  };

  render() {
    const onEvents = {
      click: this.onChartClick,
    };
    return (
      <ReactEcharts
        style={{ width: '100%', height: '300px' }}
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
