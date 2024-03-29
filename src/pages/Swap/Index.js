import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect, useHistory } from 'umi';
import { Button } from 'antd';
import { AcyCard, AcyConfirm, AcyApprove, } from '@/components/Acy';
import Media from 'react-media';
import { getTransactionsByAccount, appendNewSwapTx } from '@/utils/txData';
import SwapComponent from '@/components/SwapComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ComponentTabs from '@/components/ComponentTabs';
import axios from 'axios';
import styles from './styles.less';
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';
import useSWR from 'swr';
import { TxFetcher } from '@/utils/utils';
import SankeyGraph from './components/SankeyGraph';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import { TradeHistoryTable, PoolsActivityTable } from './components/TableComponent.js';
import { useChainId } from '@/utils/helpers';
import { getTokens } from '@/constants/future_option_power'
import { useWeb3React } from '@web3-react/core';

const apiUrlPrefix = "https://stats.acy.finance/api"

const Swap = props => {
  // const { farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();
  const { account, library, active } = useWeb3React()

  // test on polygon
  const chainId = 137;
  const tokens = getTokens(chainId)

  const [activeToken0, setActiveToken0] = useState(tokens[1]);
  const [activeToken1, setActiveToken1] = useState(tokens[0]);
  const [token0Addr, setToken0Addr] = useState(tokens[1].address);
  const [token1Addr, setToken1Addr] = useState(tokens[0].address);
  const [activeSymbol, setActiveSymbol] = useState("BTC")
  const [activeSymbol1, setActiveSymbol1] = useState("ETH")
  const [activeToken, setActiveToken] = useState(activeToken0.address < activeToken1.address ? activeToken0 : activeToken1);
  const [hasPair, setHasPair] = useState(true);
  const [activeExist, setActiveExist] = useState(true);
  // const [activeToken, setActiveToken] = useState("BTCUSD");
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [visibleConfirmOrder, setVisibleConfirmOrder] = useState(false);
  const [transactionList, setTransactionList] = useState([]);
  const [tableContent, setTableContent] = useState('Trade History');
  const [tradeHistory, setTradeHistory] = useState([])
  //for chart 24h data tab
  const [curPrice, setCurPrice] = useState(0);
  const [priceDeltaPercent, setPriceDeltaPercent] = useState(0);
  const [deltaIsMinus, setDeltaIsMinus] = useState(false);
  const [dailyHigh, setDailyHigh] = useState(0)
  const [dailyLow, setDailyLow] = useState(0)
  const [showChart, setShowChart] = useState(true)
  const [favTokens, setFavTokens] = useState(JSON.parse(localStorage.getItem('tokens_symbol')))

  // useSWR hook example - needs further implementation in backend
  // const txListUrl = `${apiUrlPrefix}/txlist/all?`
  // const { data: txList, mutate: updateTxList } = useSWR([txListUrl], {
  //   fetcher: TxFetcher(account),
  //   // refreshInterval: 1000,
  // })

  // const txref = useRef();
  // txref.current = txList;

  useEffect(() => {
    if (active) {
      library.on("block", () => {
        // updateTxList()
      });
      return () => {
        library.removeAllListeners('block');
      };
    }
  }, [
    active,
    library,
    chainId,
    // updateTxList,
  ])

  useEffect(() => {
    setVisibleLoading(false);
    setVisibleConfirmOrder(false);
    setTransactionList([]);
  }, [chainId])

  const refContainer = useRef();
  refContainer.current = transactionList;

  // connect to provider, listen for wallet to connect
  const connectWalletByLocalStorage = useConnectWallet();
  useMemo(() => {
    if (!account) {
      connectWalletByLocalStorage();
    }
    getTransactionsByAccount(account, library, 'SWAP').then(data => {
      setTransactionList(data);
    })
  }, [account]);

  // useEffect(() => {
  //   props.dispatch({
  //     type: "swap/updateTokens",
  //     payload: {
  //       token0: activeToken0,
  //       token1: activeToken1
  //     }
  //   });
  //   // const dayLength = 5;
  //   let reverseFlag = false;
  //   // timeMark one record the latest transaction time
  //   // timeMark two recort the oldest transaction time
  //   let timeMark = 0;
  //   let timeMark2 = 0;
  //   let timeData = [];
  //   let A = activeToken0.symbol;
  //   let B = activeToken1.symbol;
  //   if (A > B) {
  //     let temp = B;
  //     B = A;
  //     A = temp;
  //     reverseFlag = true;
  //   }
  //   axios.get(
  //     `${apiUrlPrefix}/chart/getRate`, { params: { token0: A, token1: B } }
  //   ).then(res => {
  //     if (res.data) {
  //       const historyData = res.data.History;
  //       timeMark = historyData[historyData.length - 1].time;
  //       timeMark2 = historyData[0].time

  //       for (let i = 0; i < historyData.length; i++) {

  //         while (i < 0) i++;
  //         const element = historyData[i];
  //         timeData.push(element);
  //       };

  //       //add 0 to the chartdata array
  //       const addData = []
  //       for (let i = timeMark - 24 * 60; i < timeMark2; i = i + 5) {
  //         let temp2 = [(i * 60 * 1000), 0];
  //         addData.push(temp2);
  //       }

  //       // drawing chart
  //       const tempChart = [];
  //       for (let a = 0; a < timeData.length; a++) {
  //         if (timeData[a].time > timeMark - 24 * 60) {
  //           const time = timeData[a].time * 60 * 1000;
  //           let temp;
  //           if (reverseFlag)
  //             temp = [time, 1.0 / timeData[a].exchangeRate];
  //           else
  //             temp = [time, timeData[a].exchangeRate];
  //           tempChart.push(temp);

  //         }
  //       }
  //     }

  //   })
  // }, [activeToken0, activeToken1]);

  useEffect(() => {
    const getTradeHistory = async () => {
      let address0 = activeToken0.address < activeToken1.address ? activeToken0.address : activeToken1.address
      let address1 = activeToken0.address < activeToken1.address ? activeToken1.address : activeToken0.address
      let history = await axios.get(`${apiUrlPrefix}/rates?token0=${address0}&token1=${address1}&chainId=${chainId}`)
        .then((res) => res.data.rates)
        .catch((e) => [])
      setTradeHistory(history)
    }
    getTradeHistory()
  }, [activeToken0, activeToken1]);


  // for activeToken chosen from tokenSelectorModal, set token0 as selected and token1 as USDT
  // should not be activated when triggered by tab for nopair
  // useEffect(() => {
  //   console.log("check trade activetoken1 useeffect activetoken", tokens[0], activeToken)
  //   if (activeToken != activeToken0 && activeToken1 && hasPair) {
  //     setActiveToken0(activeToken)
  //     setActiveToken1(tokens[0])
  //   }
  // }, [activeToken])

  const onHandModalConfirmOrder = falg => {
    setVisibleConfirmOrder(!!falg);
  };

  const updateTransactionList = async (receipt) => {
    appendNewSwapTx(refContainer.current, receipt, account, library).then((data) => {
      if (data && data.length > 0) setTransactionList(data);
    })
  }

  const onGetReceipt = async (receipt, library, account) => {
    updateTransactionList(receipt);
  };

  const onTabSelect = (e) => {
    setActiveToken(activeToken0.symbol == e ? activeToken0 : activeToken1)
  }

  const [graphType, setGraphType] = useState("BTC")
  const graphTypes = [activeToken1.symbol]
  const showGraph = item => {
    setGraphType(item)
  }

  const test_poolsActivity = [
    {
      type: 'remove',
      token: 'BONE',
      tokenAmount: '22.11',
      poolAmount: '0.0125323',
      token_value: '$21.49',
    },
    {
      type: 'add',
      token: 'USDC',
      tokenAmount: '99.99',
      poolAmount: '0.0046699',
      token_value: '$8',
    },
    {
      type: 'add',
      token: 'SYN',
      tokenAmount: '4.427',
      poolAmount: '3.7',
      token_value: '$6346',
    },
  ]

  const history = useHistory()
  useEffect(() => {
    const hash = history.location.hash.replace('#', '').split('&')
    if (history.location.hash) {
      setActiveToken({ symbol: hash[0].split('/')[0].replaceAll('%20', ' '), address: hash[1].substring(0, 42) })
      setActiveToken0({ symbol: hash[0].split('/')[0].replaceAll('%20', ' '), address: hash[1].substring(0, 42) })
      setActiveToken1({ symbol: hash[0].split('/')[1].replaceAll('%20', ' '), address: hash[2].substring(0, 42) })
    }
  }, [history.location.hash])


  useEffect(() => {
    //initialize activeExist to rerender chart and check is chart is available or not
    setActiveExist(true)
  }, [activeToken0, activeToken1])

  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
        <div className={styles.rowFlexContainer}>
          <div className={`${styles.colItem} ${styles.priceChart}`}>

            <div>
              {/* <div className={styles.chartTokenSelectorTab}> */}
              {/* <PerpetualTabs
                  option={graphType}
                  options={graphTypes}
                  onChange={showGraph}
                /> */}
              {hasPair ?
                <AcySymbol
                  activeSymbol={`${activeToken0.symbol}/${activeToken1.symbol}`}
                  setActiveSymbol={setActiveToken}
                  activfeToken0={activeToken0}
                  activeToken1={activeToken1}
                  setActiveToken0={setActiveToken0}
                  setActiveToken1={setActiveToken1}
                  pageName={"Trade"}
                  // pairName='BTC'
                  // showDrawer={onClickCoin}
                  latestPriceColor={priceDeltaPercent * 1 >= 0 && '#0ecc83' || '#fa3c58'}
                  latestPrice={curPrice}
                  latestPricePercentage={priceDeltaPercent}
                  dailyLow={dailyLow}
                  dailyHigh={dailyHigh}
                  showChart={showChart}
                  setShowChart={() => setShowChart(!showChart)}
                  setFavTokens={()=>{setFavTokens(JSON.parse(localStorage.getItem('tokens_symbol')))}}
                />
                : <div>
                  <AcySymbolNav data={[activeToken0.symbol, activeToken1.symbol]} onChange={onTabSelect} />
                  <AcySymbol
                    activeSymbol={activeToken.symbol}
                    pageName="Trade"
                    // activeSymbol={activeToken0.symbol}
                    // setActiveSymbol={setActiveSymbol}
                    activeToken0={activeToken0}
                    activeToken1={activeToken1}
                    setActiveSymbol={setActiveToken}
                    setActiveToken0={setActiveToken0}
                    setActiveToken1={setActiveToken1}
                    latestPriceColor={priceDeltaPercent * 1 >= 0 && '#0ecc83' || '#fa3c58'}
                    latestPrice={curPrice}
                    latestPricePercentage={priceDeltaPercent}
                    dailyLow={dailyLow}
                    dailyHigh={dailyHigh}
                    showChart={showChart}
                    setShowChart={() => setShowChart(!showChart)}
                    setFavTokens={()=>{setFavTokens(JSON.parse(localStorage.getItem('tokens_symbol')))}}
                  />
                </div>
              }
              {/* </div> */}
              {activeExist ?
                <div style={{ borderTop: '0.75px solid #333333' }}>
                  {graphType == "Routes" ?
                    // <SankeyGraph />
                    <></>
                    : showChart &&
                    <div>
                      <ExchangeTVChart
                        chainId={chainId}
                        pageName="Trade"
                        activeSymbol={activeToken1.symbol}
                        //the token with smaller addr is fromToken, the bigger one is toToken
                        token0Addr={activeToken0.address}
                        token1Addr={activeToken1.address}
                        // fromTokenAddr={activeToken0.address < activeToken1.address ? activeToken0.address : activeToken1.address}
                        // toTokenAddr={activeToken0.address < activeToken1.address ? activeToken1.address : activeToken0.address}
                        activeToken={activeToken}
                        //property for trade
                        hasPair={hasPair}
                        setHasPair={setHasPair}
                        activeExist={activeExist}
                        setActiveExist={setActiveExist}
                        //for chart 24 tab
                        setCurPrice={setCurPrice}
                        setPriceDeltaPercent={setPriceDeltaPercent}
                        setDailyHigh={setDailyHigh}
                        setDailyLow={setDailyLow}
                      />
                    </div>
                  }
                </div>
                : <div className={styles.chartUnavailable}>Chart Unavailable</div>}
            </div>

            <div className={styles.bottomWrapper}>
              <div className={styles.chartTokenSelectorTab}>
                <ComponentTabs
                  option={tableContent}
                  options={['Trade History', 'Pools Activity']}
                  onChange={item => { setTableContent(item) }}
                />
              </div>
              <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', width: '100%', borderTop: '0.75px solid #333333', borderRadius: '0' }}>
                <div className={`${styles.colItem} ${styles.priceChart}`}>
                  <div className={styles.positionsTable}>

                    {/* {tableContent == 'Routes' && (
                      <SankeyGraph />
                    )} */}
                    {tableContent == 'Trade History' && (
                      <TradeHistoryTable
                        dataSource={tradeHistory}
                        token0={activeToken0.address < activeToken1.address ? activeToken0.symbol : activeToken1.symbol}
                        token1={activeToken0.address < activeToken1.address ? activeToken1.symbol : activeToken0.symbol} />
                    )}
                    {tableContent == 'Pools Activity' && (
                      <PoolsActivityTable dataSource={test_poolsActivity} pool="ETH" />
                    )}
                  </div>
                </div>
              </AcyCard>
            </div>

          </div>

          <div className={`${styles.colItem} ${styles.swapComponent}`}>
            <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', border: 'none' }}>
              <div className={styles.trade}>
                <SwapComponent
                  token0={activeToken0}
                  token1={activeToken1}
                  onSelectToken0={token => { setActiveToken0(token); }}
                  onSelectToken1={token => { setActiveToken1(token); }}
                  account={account}
                  library={library}
                  chainId={chainId}
                  onGetReceipt={onGetReceipt}
                  activeSymbol={activeSymbol}
                  activeToken0={activeToken0}
                  activeToken1={activeToken1}
                  setActiveToken={setActiveToken}
                  setActiveToken0={setActiveToken0}
                  setActiveToken1={setActiveToken1}
                  setActiveSymbol={setActiveSymbol}
                // showGraph={showGraph}
                />
              </div>
            </AcyCard>
          </div>

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

        </div>
      </div>
    </PageHeaderWrapper>
  );
}

export default connect(({ profile, transaction, swap, loading }) => ({
  profile,
  transaction,
  swap,
  loading: loading.effects['profile/fetchBasic'],
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <Swap {...props} isMobile={isMobile} />}
  </Media>
))
