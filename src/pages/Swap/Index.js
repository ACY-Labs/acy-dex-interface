import React, { Component } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { connect } from 'umi';
import { Button, Row, Col, Icon } from 'antd';
import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyPriceChart,
  AcyConfirm,
  AcyApprove,
  AcyBarChart,
} from '@/components/Acy';
import Media from 'react-media';
import AcyPieChart from '@/components/AcyPieChartAlpha';
import SwapComponent from '@/components/SwapComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import axios from 'axios';
import StakeHistoryTable from './components/StakeHistoryTable';
import styles from './styles.less';
import moment from 'moment';

const { AcyTabPane } = AcyTabs;

@connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))
class BasicProfile extends Component {
  state = {
    visible: false,
    visibleConfirmOrder: false,
    visibleLoading: false,
    alphaTable: 'Line',
    chartData: [],
    range: '1D',
    activeTime: 'Loading...',
    activeRate: 'Loading...',
    activeToken0: 'USDC',
    activeToken1: 'ETH',
    token0Address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    token1Address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    format: 'h:mm:ss a',
  };

  componentDidMount() {
    this.getPrice();
  }

  getPrice() {
    const { range, token0Address, token1Address, format } = this.state;
    console.log('AXIOS BOY');
    axios
      .post(
        `https://api.acy.finance/api/chart/swap?token0=${token0Address}&token1=${token1Address}&range=${range}`
      )
      .then(data => {
        console.log(data);
        const { swaps } = data.data.data;
        const lastDataPoint = swaps[swaps.length - 1];
        this.setState({
          chartData: swaps.map(item => [item.time, item.rate.toFixed(3)]),
          activeRate: lastDataPoint.rate.toFixed(3),
          activeTime: lastDataPoint.time,
        });
      });
  }

  lineTitleRender = () => {
    const { activeTime, activeRate, activeToken0, activeToken1, format } = this.state;
    return [
      <div>
        <div className={styles.maintitle}>
          <span className={styles.lighttitle}>
            {activeToken0}/{activeToken1}
          </span>
        </div>
        <div className={styles.secondarytitle}>
          <span className={styles.lighttitle}>{activeRate}</span>{' '}
          <span className={styles.percentage}>+12.45%</span>{' '}
          {moment(activeTime)
            .local()
            .format(format)}
        </div>
      </div>,
    ];
  };

  selectTime = pt => {
    const dateSwitchFunctions = {
      Line: () => {
        this.setState({ alphaTable: 'Line' });
      },
      Bar: () => {
        this.setState({ alphaTable: 'Bar' });
      },
    };

    dateSwitchFunctions[pt]();
  };

  // 时间段选择
  onhandPeriodTimeChoose = pt => {
    let _format = 'h:mm:ss a';
    switch (pt) {
      case '1D':
        _format = 'h:mm:ss a';
        break;
      case '1M':
        _format = 'DD/MM';
        break;
      default:
        _format = 'h:mm:ss a';
    }
    this.setState({ range: pt, format: _format }, () => {
      this.getPrice();
    });
  };

  // 选择Coin
  onClickCoin = () => {
    this.setState({
      visible: true,
    });
  };

  onCancel = () => {
    this.setState({
      visible: false,
    });
  };

  onHandModalConfirmOrder = falg => {
    this.setState({
      visibleConfirmOrder: !!falg,
    });
  };

  render() {
    const {
      visible,
      visibleConfirmOrder,
      visibleLoading,
      alphaTable,
      chartData,
      range,
      format,
    } = this.state;
    const { isMobile } = this.props;
    return (
      <PageHeaderWrapper>
        <div className={styles.main}>
          {isMobile && (
            <div>
              <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
                <div className={styles.trade}>
                  <SwapComponent
                    onSelectToken={this.getPrice}
                    onSelectToken0={token => {
                      this.setState({ activeToken0: token });
                    }}
                    onSelectToken1={token => {
                      this.setState({ activeToken1: token });
                    }}
                  />
                </div>
              </AcyCard>
            </div>
          )}
          <div>
            <AcyCard style={{ background: 'transparent' }} title={this.lineTitleRender()}>
              <div
                style={{
                  width: '100%',
                }}
              >
                <div
                  style={{
                    height: '576px',
                  }}
                >
                  <AcyPriceChart
                    data={chartData}
                    format={format}
                    showGradient={false}
                    showXAxis
                    lineColor="#e29227"
                    range={range}
                    showTooltip
                    onHover={(data, dataIndex) => {
                      this.setState({ activeTime: chartData[dataIndex][0], activeRate: data });
                    }}
                  />
                </div>
                <AcyPeriodTime
                  onhandPeriodTimeChoose={this.onhandPeriodTimeChoose}
                  className={styles.pt}
                  times={['1D', '1W', '1M']}
                />
              </div>
            </AcyCard>
          </div>
          {!isMobile && (
            <div>
              <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
                <div className={styles.trade}>
                  <SwapComponent />
                </div>
              </AcyCard>
            </div>
          )}
        </div>

        <div className={styles.option}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <AcyCard title="Routing">
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                  <div className={styles.routing}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '10px',
                        color: '#EB5C20',
                        borderRight: '1px solid #2c2f36',
                      }}
                    >
                      <AcyIcon.MyIcon width={(isMobile && 30) || 50} type="Eth" />
                    </div>
                    <div className={styles.routing_middle}>
                      <div className={styles.nodes}>
                        <div className={styles.nodes_item}>
                          <span>30%</span>
                          <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                          <div className={styles.node}>
                            <div>
                              <AcyIcon.MyIcon width={(isMobile && 30) || 50} type="Eth" />
                            </div>
                            <div>
                              <p className={styles.r_title}>93.246ETH</p>
                              <p className={styles.r_desc}>325,340$</p>
                            </div>
                          </div>
                          <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                        </div>
                        <div className={styles.nodes_item}>
                          <span>30%</span>
                          <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                          <div className={styles.node}>
                            <div>
                              <AcyIcon.MyIcon width={(isMobile && 30) || 50} type="Eth" />
                            </div>
                            <div>
                              <p className={styles.r_title}>93.246ETH</p>
                              <p className={styles.r_desc}>325,340$</p>
                            </div>
                          </div>
                          <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                        </div>
                        <div className={styles.nodes_item}>
                          <span>30%</span>
                          <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                          <div className={styles.node}>
                            <div>
                              <AcyIcon.MyIcon width={(isMobile && 30) || 50} type="Eth" />
                            </div>
                            <div>
                              <p className={styles.r_title}>93.246ETH</p>
                              <p className={styles.r_desc}>325,340$</p>
                            </div>
                          </div>
                          <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: '#EB5C20' }}>See More...</div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '10px',
                        color: '#EB5C20',
                        borderLeft: '1px solid #2c2f36',
                      }}
                    >
                      <AcyIcon.MyIcon width={(isMobile && 30) || 50} type="BTC" />
                    </div>
                  </div>
                </div>
              </AcyCard>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <AcyCard style={{ height: '428px', position: 'relative' }} title="Alpha & Fees">
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <AcyPeriodTime onhandPeriodTimeChoose={this.selectTime} times={['Line', 'Bar']} />
                </div>
                {alphaTable === 'Bar' ? (
                  <div style={{ height: '358px' }}>
                    <AcyBarChart showXAxis />
                  </div>
                ) : (
                  <AcyPieChart />
                )}
              </AcyCard>
            </Col>
          </Row>
        </div>
        <div className={styles.option}>
          <div style={{ marginTop: '-10px', marginBottom: '30px' }}>
            <StakeHistoryTable />
          </div>
        </div>
        {/* Routing */}

        {/* Alpha */}
        {/* <div className={styles.routing}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', color: '#EB5C20' }}>
            <span>
              Alpha
            </span>
          </div>
          <div style={{width:'300px',height:'300px'}}>
          <AcyPieChart />

          </div>
          <div className={styles.routing_middle}>

            <div className={styles.nodes}>
              <div className={styles.node}>
                <div>
                  <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                </div>
                <div>
                  <p className={styles.r_title}>93.246ETH</p>
                  <p className={styles.r_desc}>325,340$</p>
                </div>
              </div>
              <div className={styles.node} style={{ opacity: '0' }}></div>
              <div className={styles.node}>
              <div>
                  <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                </div>
                <div>
                  <p className={styles.r_title}>93.246ETH</p>
                  <p className={styles.r_desc}>325,340$</p>
                </div>
              </div>
            </div>

          </div>
          <div className={styles.routing_left}>
            <p className={styles.r_title}>93.246ETH</p>
            <p className={styles.r_desc}>325,340$</p>
            <div style={{ marginTop: '30px' }}>
              <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />

            </div>
          </div>
        </div> */}
        <AcyModal onCancel={this.onCancel} width={600} visible={visible}>
          <div className={styles.title}>
            <AcyIcon name="back" /> Select a token
          </div>
          <div className={styles.search}>
            <AcyInput
              placeholder="Enter the token symbol or address"
              suffix={<AcyIcon name="search" />}
            />
          </div>
          <div className={styles.coinList}>
            <AcyTabs>
              <AcyTabPane tab="All" key="1">
                <AcyCoinItem />
                <AcyCoinItem />
                <AcyCoinItem />
                <AcyCoinItem />
              </AcyTabPane>
              <AcyTabPane tab="Favorite" key="2" />
              <AcyTabPane tab="Index" key="3" />
              <AcyTabPane tab="Synth" key="4" />
            </AcyTabs>
          </div>
        </AcyModal>

        <AcyConfirm
          onCancel={this.onHandModalConfirmOrder}
          title="Comfirm Order"
          visible={visibleConfirmOrder}
        >
          <div className={styles.confirm}>
            <p>ETH： 566.228</p>
            <p>BTC：2.669</p>
            <p>Price：212.123</p>
            <p>Price Impact：2.232%</p>
            <p>Liquidity Provide Fee: 0.321%</p>
            <p>Alpha: 0.371%</p>
            <p>Maximum sold: 566.221</p>
            <Button size="large" type="primary">
              Confirm
            </Button>
          </div>
        </AcyConfirm>

        <AcyApprove
          onCancel={() => this.setState({ visibleLoading: false })}
          visible={visibleLoading}
        />
      </PageHeaderWrapper>
    );
  }
}

export default props => (
  <Media query="(max-width: 599px)">
    {isMobile => <BasicProfile {...props} isMobile={isMobile} />}
  </Media>
);
