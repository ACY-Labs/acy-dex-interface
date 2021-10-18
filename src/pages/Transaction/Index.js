import React, { Component, useState, useEffect } from 'react';
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
import AcyPieChart from '@/components/AcyPieChartAlpha';
import AcyRoutingChart from '@/components/AcyRoutingChart';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { uniqueFun } from '@/utils/utils';
import { getTokenContract } from '@/acy-dex-swap/utils/index';

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

const Swap = props => {

  const [pricePoint, setPricePoint] = useState(0);
  const [pastToken1, setPastToken1] = useState('ETH');
  const [pastToken0, setPastToken0] = useState('USDC');
  const [isReceiptObtained, setIsReceiptObtained] = useState(false);
  const [routeData, setRouteData] = useState([]);
  const [format, setFormat] = useState('h:mm:ss a');
  const [activeToken1, setActiveToken1] = useState(supportedTokens[1]);
  const [activeToken0, setActiveToken0] = useState(supportedTokens[0]);
  const [activePercentageChange, setActivePercentageChange] = useState('+0.00');
  const [activeRate, setActiveRate] = useState('Loading...');
  const [activeTime, setActiveTime] = useState('Loading...');
  const [range, setRange] = useState('1D');
  const [chartData, setChartData] = useState([]);
  const [alphaTable, setAlphaTable] = useState('Line');
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleConfirmOrder, setVisibleConfirmOrder] = useState(false);

  useEffect(() => {
    getPrice();
    // 还原存储的交易信息
    const {
      transaction: { transactions },
      dispatch,
    } = props;
    let newData = [...transactions];
    if (localStorage.getItem('transactions')) {
      newData.push(...JSON.parse(localStorage.getItem('transactions')));
    }
    // 更新数据
    dispatch({
      type: 'transaction/addTransaction',
      payload: {
        transactions: [...uniqueFun(newData, 'hash')],
      },
    });
  }, [])

  useEffect(() => {
    getPrice()
  }, activeToken1);

  useEffect(() => {
    getPrice()
  }, activeToken0);

  useEffect(() => {
    getPrice()
  }, format);

  // workaround way to get USD price (put token1 as USDC)
  // NEEDS ETHEREUM ADDRESS, RINKEBY DOES NOT WORK HERE
  const getRoutePrice = (token0Address, token1Address) => {
    axios
      .post(
        `https://api.acy.finance/api/chart/swap?token0=${token0Address}&token1=${token1Address}&range=1D`
      )
      .then(data => {
        console.log(data);

        // const { swaps } = data.data.data;
        // const lastDataPoint = swaps[swaps.length - 1];
        // console.log('ROUTE PRICE POINT', lastDataPoint);
        // setState({
        //   pricePoint: lastDataPoint.rate,
        // });
      });
  }

  const getPrice = () => {
    // FIXME: current api doesn't take token0/1 sequence into consideration, always return ratio based on alphabetical order of token symbol
    axios.post(
      `https://api.acy.finance/api/chart/swap?token0=${activeToken0.addressOnEth}&token1=${activeToken1.addressOnEth
      }&range=${range}`
    )
      .then(data => {
        let { swaps } = data.data.data;
        // invert the nominator and denominator when toggled on the token image (top right of the page)
        if (activeToken1.symbol < activeToken0.symbol) {
          console.log("swapping token position")
          swaps = Array.from(swaps, o => ({ ...o, "rate": 1 / o.rate }))
        }
        console.log(activeToken0.symbol, activeToken1.symbol)
        console.log(swaps)
        const lastDataPointIndex = swaps.length - 1;

        let precisionedData = swaps.map(item => [item.time, item.rate.toFixed(3)])
        // add precision if the ratio is close to zero
        if (Math.max(...precisionedData.map(item => item[1])) === 0) {
          precisionedData = swaps.map(item => [item.time, item.rate.toFixed(6)])
        }
        setChartData(precisionedData);
        setActiveRate(precisionedData[lastDataPointIndex][1]);
        setActiveTime(precisionedData[lastDataPointIndex][0]);
      })
      .catch(e => {
        setChartData([]);
        setActiveRate('No data');
        setActiveTime('No data');
      });
  }

  const lineTitleRender = () => {

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

    const swapTokenPosition = () => {
      const tempSwapToken = activeToken0;
      setActiveToken0(activeToken1);
      setActiveToken1(tempSwapToken);
    }

    return [
      <div>
        <div className={styles.maintitle}>
          <div className={styles.lighttitle} style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }} onClick={swapTokenPosition}>
            <img
              src={token0logo}
              alt=""
              style={{ width: 24, maxWidth: '24px', maxHeight: '24px', marginRight: '0.25rem', marginTop: '0.1rem' }}
            />
            <img
              src={token1logo}
              alt=""
              style={{ width: 24, maxHeight: '24px', marginRight: '0.5rem', marginTop: '0.1rem' }}
            />
            <span>
              {activeToken0.symbol}&nbsp;/&nbsp;{activeToken1.symbol}
            </span>
          </div>

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

  const selectTime = pt => {
    const dateSwitchFunctions = {
      Line: () => {
        setAlphaTable('Line');
      },
      Bar: () => {
        setAlphaTable('Bar');
      },
    };

    dateSwitchFunctions[pt]();
  };

  // 时间段选择
  const onhandPeriodTimeChoose = pt => {
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
    setRange(pt);
    setFormat(_format);
  };

  // 选择Coin
  const onClickCoin = () => {
    setVisible(true);
  };

  const onCancel = () => {
    setVisible(false);
  };

  const onHandModalConfirmOrder = falg => {
    setVisibleConfirmOrder(!!falg);
  };

  const getTokenSymbol = async (address, library, account) => {
    const tokenContract = getTokenContract(address, library, account);
    return tokenContract.symbol();
  };

  const getTokenDecimal = async (address, library, account) => {
    const tokenContract = getTokenContract(address, library, account);
    return tokenContract.decimals();
  };

  const onGetReceipt = async (receipt, library, account) => {
    console.log('RECEIPT', receipt);

    const { inTokenAddr, amount, outTokenAddr, nonZeroToken, nonZeroTokenAmount } = receipt;
    let newRouteData = [];
    
    // let routeDataEntry = {
    //   from: await getTokenSymbol(inTokenAddr, library, account),
    //   to: await getTokenSymbol(outTokenAddr, library, account),
    //   value:
    //     parseInt(amount.toString().replace('0x', ''), 16) /
    //     Math.pow(10, await getTokenDecimal(inTokenAddr, library, account)),
    // };
    // newRouteData.push(routeDataEntry);
    for (let i = 0; i < nonZeroToken.length; i++) {
      // token
      newRouteData.push({
        from:await getTokenSymbol(inTokenAddr, library, account),
        middle: await getTokenSymbol(nonZeroToken[i], library, account),
        to: await getTokenSymbol(outTokenAddr, library, account),
        value:
          parseInt(nonZeroTokenAmount[i].toString().replace('0x', ''), 16)
      });
      // token amount
    }
    
    
    // get eth addresses
    let token0EthAddress = supportedTokens.filter(
      item => item.address.toLowerCase() == inTokenAddr.toLowerCase()
    )[0].addressOnEth;
    // if token is USDC, set price point to the same value
    // this check is needed because the swap History API cannot support same coins
    if (token0EthAddress.toLowerCase() == '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
      console.log('usdc as token 0');
      setPricePoint(1);
    } else getRoutePrice(token0EthAddress, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
    setPastToken0(activeToken0.symbol);
    console.log("end of operation")
    setIsReceiptObtained(true);
    setRouteData(newRouteData);
    
  };
  const {
    isMobile,
    transaction: { transactions },
  } = props;
  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
        {isMobile && (
          <div>
            <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
              <div className={styles.trade}>
                <SwapComponent
                  onSelectToken0={token => {
                    setActiveToken0(token);
                  }}
                  onSelectToken1={token => {
                    setActiveToken1(token);
                  }}
                  onGetReceipt={onGetReceipt}
                />
              </div>
            </AcyCard>
          </div>
        )}
        <div>
          <AcyCard style={{ background: 'transparent' }} title={lineTitleRender()}>
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
                    setActiveTime(chartData[dataIndex][0]);
                    setActiveRate(data);
                    setActivePercentageChange(dataIndex === 0
                      ? '0'
                      : `${(((data - prevData) / prevData) * 100).toFixed(2)}`);
                  }}
                />
                <AcyPeriodTime
                  onhandPeriodTimeChoose={onhandPeriodTimeChoose}
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
                    setActiveToken0(token);
                  }}
                  onSelectToken1={token => {
                    setActiveToken1(token);

                  }}
                  onGetReceipt={onGetReceipt}
                />
              </div>
            </AcyCard>
          </div>
        )}
      </div>
      <div className={styles.exchangeBottomWrapper}>
        {isReceiptObtained && (
          <div className={styles.exchangeItem}>
            <h3>
              <AcyIcon.MyIcon width={30} type="arrow" />
              <span className={styles.span}>FLASH ROUTE</span>
            </h3>
            <div>
              {isReceiptObtained ? (
                <AcyRoutingChart data={routeData} />
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
            </div>
          </div>
        )}
        <div className={styles.exchangeItem}>
          <h3>
            <AcyIcon.MyIcon width={30} type="arrow" />
            <span className={styles.span}>HISTORY TRANSACTION</span>
          </h3>
          <StakeHistoryTable
            isMobile={isMobile}
            dataSource={transactions.filter(item => item.inputTokenNum != undefined)}
          />
        </div>
      </div>

      <AcyModal onCancel={onCancel} width={600} visible={visible}>
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
        onCancel={onHandModalConfirmOrder}
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
        onCancel={() => setVisibleLoading(false)}
        visible={visibleLoading}
      />
    </PageHeaderWrapper>
  );
}
export default connect(({ profile, transaction, loading }) => ({
  profile,
  transaction,
  loading: loading.effects['profile/fetchBasic'],
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <Swap {...props} isMobile={isMobile} />}
  </Media>
))

