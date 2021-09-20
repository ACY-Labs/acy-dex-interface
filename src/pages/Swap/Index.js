import React, { Component } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { connect } from 'umi';
import { Button, Row, Col, Icon, Skeleton } from 'antd';
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
} from '@/components/Acy';
import Media from 'react-media';
<<<<<<< HEAD
import AcyPieChart from '@/components/AcyPieChartAlpha';
import AcyRoutingChart from '@/components/AcyRoutingChart';
import { BigNumber } from '@ethersproject/bignumber';

=======
>>>>>>> b51a2f0cd4915e15a1343484a7869989fe0dfb20
import SwapComponent from '@/components/SwapComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import axios from 'axios';
import supportedTokens from '@/constants/TokenList';
import moment from 'moment';
import StakeHistoryTable from './components/StakeHistoryTable';
import styles from './styles.less';

const { AcyTabPane } = AcyTabs;

function abbrNumber(number) {
  const THOUSAND = 0;
  const MILLION = 1;

  let currentDivision = -1;
  let result = '';
  let tempNumber = number;

  if (number >= 1000) {
    tempNumber /= 1000;
    currentDivision = 0;
  }

  if (number >= 1000000) {
    tempNumber /= 1000;
    currentDivision = 1;
  }

  switch (currentDivision) {
    case 0:
      result = `${tempNumber.toFixed(2)}k`;
      break;
    case 1:
      result = `${tempNumber.toFixed(2)}m`;
      break;
    default:
      result = `${number.toFixed(2)}`;
      break;
  }

  return result;
}

@connect(({ profile, transaction, loading }) => ({
  profile,
  transaction,
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
    activePercentageChange: '+0.00',
    activeToken1: {
      symbol: 'USDC',
      address: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
      addressOnEth: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimal: 6,
      logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDC.svg',
    },
    activeToken0: {
      symbol: 'ETH',
      address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimal: 18,
      logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/ETH.svg',
    },
    format: 'h:mm:ss a',
    routeData: [],
    isReceiptObtained: false,

    // previous token shown on routing, used to maintain the route display to the previous tokens
    pastToken0: 'USDC',
    pastToken1: 'ETH',

    // price point for the token (for now uses the USDC/ETH)
    pricePoint: 0,
  };

  componentDidMount() {

    this.getPrice();
  }

  // workaround way to get USD price (put token1 as USDC)
  // NEEDS ETHEREUM ADDRESS, RINKEBY DOES NOT WORK HERE
  getRoutePrice(token0Address, token1Address) {
    axios
      .post(
        `https://api.acy.finance/api/chart/swap?token0=${token0Address}&token1=${token1Address}&range=1D`
      )
      .then(data => {
        console.log(data);
        
        // const { swaps } = data.data.data;
        // const lastDataPoint = swaps[swaps.length - 1];
        // console.log('ROUTE PRICE POINT', lastDataPoint);
        // this.setState({
        //   pricePoint: lastDataPoint.rate,
        // });
      });
  }

  getPrice() {
    const { range, activeToken0, activeToken1 } = this.state;

    axios
      .post(
        `https://api.acy.finance/api/chart/swap?token0=${activeToken0.addressOnEth}&token1=${
          activeToken1.addressOnEth
        }&range=${range}`
      )
      .then(data => {
        const { swaps } = data.data.data;
        const lastDataPoint = swaps[swaps.length - 1];
        this.setState({
          chartData: swaps.map(item => [item.time, item.rate.toFixed(3)]),
          activeRate: lastDataPoint.rate.toFixed(3),
          activeTime: lastDataPoint.time,
        });
      })
      .catch(e => {
        this.setState({
          chartData: [],
          activeRate: 'No data',
          activeTime: 'No data',
        });
      });
  }

  lineTitleRender = () => {
    const {
      activeTime,
      activeRate,
      activePercentageChange,
      activeToken0,
      activeToken1,
      format,
    } = this.state;

    let token0logo = null;
    let token1logo = null;
    for (let j = 0; j < supportedTokens.length; j++) {
      if (activeToken0.symbol === supportedTokens[j].symbol) {
        token0logo = supportedTokens[j].logoURI;
      }
      if (activeToken1.symbol === supportedTokens[j].symbol) {
        token1logo = supportedTokens[j].logoURI;
      }
    }

    return [
      <div>
        <div className={styles.maintitle}>
          <div style={{ display: 'flex' }}>
            <img
              src={token0logo}
              alt=""
              style={{
                width: 24,
                maxWidth: '24px',
                maxHeight: '24px',
                marginRight: '0.25rem',
                marginTop: '0.1rem',
              }}
            />
            <img
              src={token1logo}
              alt=""
              style={{ width: 24, maxHeight: '24px', marginRight: '0.5rem', marginTop: '0.1rem' }}
            />
          </div>
          <span className={styles.lighttitle}>
            {activeToken0.symbol}/{activeToken1.symbol}
          </span>
        </div>
        <div className={styles.secondarytitle}>
          <span className={styles.lighttitle}>{activeRate}</span>{' '}
          <span className={styles.percentage}>{activePercentageChange}%</span>{' '}
          {moment(activeTime)
            .locale('en')
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
      case '1W':
        _format = 'ha DD MMM';
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

  onGetReceipt = receipt => {
    console.log('RECEIPT', receipt);
    let newRouteData = [];

    let decimal = supportedTokens.filter(
      item => item.address.toLowerCase() == receipt.logs[0].address.toLowerCase()
    )[0].decimal;

    let routeDataEntry = {
      from: receipt.logs[0].address.toLowerCase(),
      to: receipt.logs[1].address.toLowerCase(),
      value: parseInt(receipt.logs[0].data.replace('0x', ''), 16) / Math.pow(10, decimal),
    };

    newRouteData.push(routeDataEntry);

    // get eth addresses
    let token0EthAddress = supportedTokens.filter(
      item => item.address.toLowerCase() == receipt.logs[0].address.toLowerCase()
    )[0].addressOnEth;

    // if token is USDC, set price point to the same value
    // this check is needed because the swap History API cannot support same coins
    if (token0EthAddress.toLowerCase() == '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
      console.log('usdc as token 0');
      this.setState({
        pricePoint: 1,
      });
    } else this.getRoutePrice(token0EthAddress, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');

    this.setState({
      routeData: [...newRouteData],
      isReceiptObtained: true,
      pastToken0: this.state.activeToken0.symbol,
      pastToken1: this.state.activeToken1.symbol,
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
    const {
      isMobile,
      transaction: { transactions },
    } = this.props;
    return (
      <PageHeaderWrapper>
        <div className={styles.main}>
          {isMobile && (
            <div>
              <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
                <div className={styles.trade}>
                  <SwapComponent
                    onSelectToken0={token => {
                      this.setState({ activeToken0: token }, () => {
                        this.getPrice();
                      });
                    }}
                    onSelectToken1={token => {
                      this.setState({ activeToken1: token }, () => {
                        this.getPrice();
                      });
                    }}
                    onGetReceipt={this.onGetReceipt}
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
                    height: '480px',
                  }}
                  className={styles.showPeriodOnHover}
                >
                  <AcyPriceChart
                    data={chartData}
                    format={format}
                    showXAxis
                    showGradient
                    lineColor="#e29227"
                    range={range}
                    onHover={(data, dataIndex) => {
                      const prevData = dataIndex === 0 ? 0 : chartData[dataIndex - 1][1];
                      this.setState({
                        activeTime: chartData[dataIndex][0],
                        activeRate: data,
                        activePercentageChange:
                          dataIndex === 0
                            ? '0'
                            : `${(((data - prevData) / prevData) * 100).toFixed(2)}`,
                      });
                    }}
                  />
                  <AcyPeriodTime
                    onhandPeriodTimeChoose={this.onhandPeriodTimeChoose}
                    className={styles.pt}
                    times={['1D', '1W', '1M']}
                  />
                </div>
              </div>
            </AcyCard>
          </div>
          {!isMobile && (
            <div>
              <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
                <div className={styles.trade}>
                  <SwapComponent
                    onSelectToken0={token => {
                      this.setState({ activeToken0: token }, () => {
                        this.getPrice();
                      });
                    }}
                    onSelectToken1={token => {
                      this.setState({ activeToken1: token }, () => {
                        this.getPrice();
                      });
                    }}
                    onGetReceipt={this.onGetReceipt}
                  />
                </div>
              </AcyCard>
            </div>
          )}
        </div>
        <div className={styles.exchangeBottomWrapper}>

          <div className={styles.exchangeItem}>
            <h3>
              <AcyIcon.MyIcon width={30} type="arrow"/>
              <span className={styles.span}>FLASH ROUTE</span>
               
            </h3>
            <div style={{ height: '350px' }}>
              <AcyRoutingChart />
            </div>
          </div>

          {this.state.isReceiptObtained && (
            <div className={styles.option}>
              <div>
                <AcyCard title="">
                  {/* {this.state.isReceiptObtained ? (<AcyRoutingChart /> */}
                  {false ? (<AcyRoutingChart />
                    // <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    //   <div className={styles.routing}>
                    //     <div
                    //       style={{
                    //         display: 'flex',
                    //         alignItems: 'center',
                    //         marginRight: '10px',
                    //         color: '#EB5C20',
                    //         borderRight: '1px solid #2c2f36',
                    //       }}
                    //     >
                    //       <img
                    //         src={
                    //           supportedTokens.filter(
                    //             entry => entry.symbol == this.state.pastToken0
                    //           )[0].logoURI
                    //         }
                    //         width={(isMobile && 30) || 50}
                    //         height={(isMobile && 30) || 50}
                    //         style={{ marginRight: '10px' }}
                    //       />
                    //       {/* <AcyIcon.MyIcon width={(isMobile && 30) || 50} type="USDC" /> */}
                    //     </div>
                    //     <div className={styles.routing_middle}>
                    //       <div className={styles.nodes}>
                    //         {this.state.routeData.map(item => {
                    //           return (
                    //             <div className={styles.nodes_item}>
                    //               <span>100%</span>
                    //               <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                    //               <div className={styles.node}>
                    //                 <div>
                    //                   <img
                    //                     src={
                    //                       supportedTokens.filter(
                    //                         entry =>
                    //                           entry.address.toLowerCase() == item.from.toLowerCase()
                    //                       )[0].logoURI
                    //                     }
                    //                     width={(isMobile && 30) || 50}
                    //                     height={(isMobile && 30) || 50}
                    //                     style={{ padding: '10px' }}
                    //                   />
                    //                 </div>
                    //                 <div>
                    //                   <p className={styles.r_title}>
                    //                     {item.value}{' '}
                    //                     {
                    //                       supportedTokens.filter(
                    //                         entry =>
                    //                           entry.address.toLowerCase() == item.from.toLowerCase()
                    //                       )[0].symbol
                    //                     }
                    //                   </p>
                    //                   <p className={styles.r_desc}>
                    //                     {abbrNumber(this.state.pricePoint * item.value)} $
                    //                   </p>
                    //                 </div>
                    //               </div>
                    //               <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                    //             </div>
                    //           );
                    //         })}
                    //       </div>
                    //     </div>
                    //     <div
                    //       style={{
                    //         display: 'flex',
                    //         alignItems: 'center',
                    //         marginRight: '10px',
                    //         color: '#EB5C20',
                    //         borderLeft: '1px solid #2c2f36',
                    //       }}
                    //     >
                    //       <img
                    //         src={
                    //           supportedTokens.filter(
                    //             entry => entry.symbol == this.state.pastToken1
                    //           )[0].logoURI
                    //         }
                    //         width={(isMobile && 30) || 50}
                    //         height={(isMobile && 30) || 50}
                    //         style={{ marginLeft: '10px' }}
                    //       />
                    //     </div>
                    //   </div>
                    // </div>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        padding: '30px',
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      The routing will be shown here after a receipt is obtained.
                    </div>
                  )}
                </AcyCard>
              </div>
            </div>
          )}
          <div className={styles.exchangeItem}>
              <h3>
                <AcyIcon.MyIcon width={30} type="arrow"/> 
                <span className={styles.span}>HISTORY TRANSACTION</span> 
              </h3>
              <StakeHistoryTable isMobile={isMobile} dataSource={transactions} />
          </div>
        </div>

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
