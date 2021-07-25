import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; //渐变色
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入
var base = +new Date(1968, 9, 3);
var oneDay = 24 * 3600 * 1000;
var date = [];
var data = [Math.random() * 300];

for (var i = 1; i < 20000; i++) {
  var now = new Date((base += oneDay));
  date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
  data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
}
class AcyLineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgType: 'line', // 默认折线图
      xtitle: this.props.xtitle, // x轴类目名称取参
    };
  }
  componentDidMount() {
    function randomData() {
      now = new Date(+now + oneDay);
      value = value + Math.random() * 810000000 - 400000000;
      return {
        name: now.toString(),
        value: [
          [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
          Math.round(value),
        ],
      };
    }

    var data = [];
    var now = +new Date(1997, 9, 3);
    var oneDay = 24 * 3600 * 1000;
    var value = Math.random() * 1000;
    for (var i = 0; i < 1000; i++) {
      data.push(randomData());
    }
    this.setState({ data });
  }
  // getOption 这个函数主要用于配置 option，包括将数据配置进去
  // 也可以将其放在 state 中，然后通过 setState 更新
  getOption = () => {
    // 组装数据，返回配置 option
    const { imgType, xtitle, data } = this.state;
    const dataName = xtitle === 'date' ? '时间' : '名称';
    const currentData = this.props.backData;
    const clearData = {
      name: '清分量',
      type: imgType,
      barWidth: 10,
      data: currentData.map(a => a.cleanAmount) || [],
    };
    const { onchange } = this.props;
    const linkData = {
      name: '关联量',
      type: imgType,
      barWidth: 10,
      data: currentData.map(b => b.linkAmount) || [],
    };
    return {
      tooltip: {
        trigger: 'axis',
        alwaysShowContent: true,
        backgroundColor: null,
        // borderColor: '#FCEA00',
        borderWidth: 0,
        borderRadius: 0,
        //   extraCssText: 'box-shadow: 0 0 0 rgba(0, 0, 0, 0.3);',
        formatter: function(v) {
          // var inner = '<div style="padding: 25px 20px; border: 1px solid #FCEA00; background-color: rgba(0, 0, 0, 0.7);">'+v[0].value+'</div>'
          var out = '<div>' + v[0].value + '</div>';
          return <br />;
        },
      },
      xAxis: {
        type: 'time',
        show: false,
        type: 'category',
        boundaryGap: false,
        // data: data&&data.map(item=>item.key),
        axisTick: { show: false }, // 刻度
        axisLine: { show: false }, // 轴线
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        show: false,
        type: 'value',
        splitLine: {
          show: true,
        },
        axisTick: { show: false }, // 刻度
        axisLine: { show: false }, // 轴线
      },
      series: [
        {
          data: data || [],
          // areaStyle: {
          //     opacity: 0.8,
          //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          //         offset: 0,
          //         color: 'rgba(128, 255, 165)'
          //     }, {
          //         offset: 1,
          //         color: 'rgba(1, 191, 236,0)'
          //     }])
          // },
          // emphasis: {
          //     focus: 'series'
          // },
          // silent:false,
          type: 'line',
          // symbol: 'none', //去掉折线图中的节点
          smooth: 1, //true 为平滑曲线，false为直线
          showSymbol: true, //是否默认展示圆点
          // symbol: 'image://data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',     //设定为实心点
          // symbolSize: 2,   //设定实心点的大小
          itemStyle: {
            normal: {
              lineStyle: {
                color: '#c6224e',
                width: 1,
              },
              //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              //     { offset: 0, color: color[index] },
              //     { offset: 1, color: '#fff' },
              //   ]),
            },
          },
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
        style={{ height: '100%' }}
        option={this.getOption()}
        notMerge
        lazyUpdate
        theme={'theme_name'}
        ref={e => {
          this.echartsElement = e;
        }}
        onEvents={onEvents}
        // onChartReady={this.onChartReadyCallback}
        // onEvents={EventsDict}
      />
    );
  }
}

export default AcyLineChart;
