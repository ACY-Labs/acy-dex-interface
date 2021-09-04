import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; //渐变色
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入

class AcyLineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgType: 'line', // 默认折线图
      xtitle: this.props.xtitle, // x轴类目名称取参
      data: this.props.data,
    };

    console.log(this.props.data);
  }
  componentDidMount() {}
  // getOption 这个函数主要用于配置 option，包括将数据配置进去
  // 也可以将其放在 state 中，然后通过 setState 更新
  getOption = () => {
    // 组装数据，返回配置 option
    const { imgType, xtitle, data } = this.state;
    const dataName = xtitle === 'date' ? '时间' : '名称';
    const currentData = this.props.backData;

    var dateList = this.props.data.map(function(item) {
      return item[0];
    });
    var valueList = this.props.data.map(function(item) {
      return item[1];
    });
    let showXAxis = this.props.showXAxis;

    let options = {
      grid: {
        left: '2%',
        right: '2%',
        // bottom: '3%',
        top: 'top',
      },
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
        show: showXAxis,
        splitNumber: 5,
        boundaryGap: false,
        data: dateList.map(function(item) {
          return item.slice(item.length - 2, item.length);
        }),
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
          data: valueList,
          // areaStyle: {
          //   opacity: 0.8,
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     {
          //       offset: 0,
          //       color: '#c6224e',
          //     },
          //     {
          //       offset: 1,
          //       color: '#000',
          //     },
          //   ]),
          // },
          // emphasis: {
          //     focus: 'series'
          // },
          // silent:false,
          type: 'line',
          // symbol: 'none', //去掉折线图中的节点
          smooth: 1, //true 为平滑曲线，false为直线
          showSymbol: false, //是否默认展示圆点
          // symbol: 'image://data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',     //设定为实心点
          // symbolSize: 2,   //设定实心点的大小
          itemStyle: {
            normal: {
              lineStyle: {
                color: this.props.lineColor || '#c6224e',
                width: 3,
              },
            },
          },
        },
      ],
    };

    if (this.props.showGradient == true) {
      options.series[0].areaStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: this.props.lineColor || '#c6224e' },
          { offset: 1, color: this.props.bgColor || '#29292c' },
        ]),
      };
    }

    return options;
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
        key={this.props.data}
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
