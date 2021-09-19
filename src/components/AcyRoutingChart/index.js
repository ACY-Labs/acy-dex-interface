import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts'; //渐变色
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title'; // 此处是按需引入
import style from './index.less';

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

class AcyLineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgType: 'line', // 默认折线图
      xtitle: this.props.xtitle, // x轴类目名称取参
      data: this.props.data,
    };
  }
  componentDidMount() {}
  // getOption 这个函数主要用于配置 option，包括将数据配置进去
  // 也可以将其放在 state 中，然后通过 setState 更新
  // setState wrapper

  renderTooltip = v => {
    // var inner = '<div style="padding: 25px 20px; border: 1px solid #FCEA00; background-color: rgba(0, 0, 0, 0.7);">'+v[0].value+'</div>'
    if (this.props.onHover) this.props.onHover(v[0].data, v[0].dataIndex);

    if (this.props.showTooltip) return `<span style="color:#b5b5b6"> $ ${v[0].data} </span>`;
    else return;
  };

  getOption = () => {
    // 组装数据，返回配置 option
    const { imgType, xtitle, data } = this.state;

    let chartData = this.props.data;
    if (!this.props.data) {
      chartData = defaultData;
    }
    var dateList = chartData.map(function(item) {
      return item[0];
    });
    var valueList = chartData.map(function(item) {
      return item[1];
    });

    let showXAxis = this.props.showXAxis;
    let props = this.props;
    let component = this;

    let options  = {
      animation :true,
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
          {
              type: 'graph',
              layout: 'none',
              symbolSize: 50,
              roam: true,
              label: {
                show: true,
                color:'#ffffff'
              },
              itemStyle:{
                color:'#2E3032'
              },
              edgeSymbol: ['none', 'none'],
              edgeSymbolSize: [4, 10],
              edgeLabel: {
                  fontSize: 20
              },
              data: [{
                  name: 'ETH',
                  x: 300,
                  y: 300
              }, 
              {
                name: 'BNB',
                x: 550,
                y: 250
              }, 
              {
                name: 'NONE',
                x: 550,
                y: 300,
                itemStyle:{
                  opacity:0
                }
              }, 
              {
                name: 'Matic',
                x: 550,
                y: 350
              },
              {
                  name: 'BTC',
                  x: 800,
                  y: 300
              }],
              // links: [],
              links: [{
                  source: 'ETH',
                  target: 'NONE',
                  lineStyle:{
                    color:'#757579'
                  },
                  label:{
                    show:true,
                    position:'middle',
                    formatter:'70%',
                    color:'#EB5C20',
                    fontSize:20,
                    verticalAlign:'bottom'
                  }
              },
              {
                source: 'NONE',
                target: 'BTC',
                lineStyle:{
                  color:'#757579'
                },
              },{
                source: 'ETH',
                target: 'BNB',
                lineStyle: {
                  curveness: 0.1,
                  color:'#757579'
                },
                label:{
                  show:true,
                  position:'middle',
                  formatter:'15%',
                  color:'#EB5C20',
                  fontSize:20,
                  verticalAlign:'bottom'
                }
            
          },{
            source: 'BNB',
            target: 'BTC',
            lineStyle: {
              curveness: 0.1,
              color:'#757579'
            }
        
      },{
        source: 'ETH',
        target: 'Matic',
        lineStyle: {
          curveness: -0.1,
          color:'#757579'
        },
        label:{
          show:true,
          position:'middle',
          formatter:'15%',
          color:'#EB5C20',
          fontSize:20,
          verticalAlign:'bottom'
        }
    
  },{
    source: 'Matic',
    target: 'BTC',
    lineStyle: {
      curveness: -0.1,
      color:'#757579'
    }

}],
          }
      ]
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
  render() {
    const onEvents = {
      click: this.onChartClick,
    };
    return (
      <ReactEcharts
        style={{ height: '100%' }}
        option={this.getOption()}
        notMerge
        lazyUpdate={false}
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
