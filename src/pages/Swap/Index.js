import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect } from 'umi';
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
import { getTokens } from '@/constants/trade'
import { useWeb3React } from '@web3-react/core';

const Swap = props => {
  const { account,library } = useWeb3React();
  const { farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();
  const { chainId } = useChainId();
  // const supportedTokens = getTokens(chainId);
  const INITIAL_TOKEN_LIST = getTokens(chainId);
  const [supportedTokens,setSupportedTokens] = useState(INITIAL_TOKEN_LIST)

  const [activeToken1, setActiveToken1] = useState(supportedTokens[0]);
  const [activeToken0, setActiveToken0] = useState(supportedTokens[1]);
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [visibleConfirmOrder, setVisibleConfirmOrder] = useState(false);
  const [transactionList, setTransactionList] = useState([]);
  const [tableContent, setTableContent] = useState('Trade History');

  // useSWR hook example - needs further implementation in backend
  const txListUrl = `${apiUrlPrefix}/txlist/all?`
  const { data: txList, mutate: updateTxList } = useSWR([txListUrl], {
    fetcher: TxFetcher(account),
    // refreshInterval: 1000,
  })

  const txref = useRef();
  txref.current = txList;0
  

  // u1012seEffect(() => {
  //   library.on('block', (blockNum) => {
  //     updateTxList();
  //   })
  //   return () => {
  //     library.removeAllListeners('block');
  //   }
  // }, [library])

  useEffect(() => {
    if (!supportedTokens) return
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

  useEffect(() => {
    props.dispatch({
      type: "swap/updateTokens",
      payload: {
        token0: activeToken0,
        token1: activeToken1
      }
    });
    // const dayLength = 5;
    let reverseFlag = false;
    // timeMark one record the latest transaction time
    // timeMark two recort the oldest transaction time
    let timeMark = 0;
    let timeMark2 = 0;
    let timeData = [];
    let A = activeToken0.symbol;
    let B = activeToken1.symbol;
    if (A > B) {
      let temp = B;
      B = A;
      A = temp;
      reverseFlag = true;
    }
    axios.get(
      `${apiUrlPrefix}/chart/getRate`, { params: { token0: A, token1: B } }
    ).then(res => {
      if (res.data) {
        const historyData = res.data.History;
        timeMark = historyData[historyData.length - 1].time;
        timeMark2 = historyData[0].time

        for (let i = 0; i < historyData.length; i++) {

          while (i < 0) i++;
          const element = historyData[i];
          timeData.push(element);
        };

        //add 0 to the chartdata array
        const addData = []
        for (let i = timeMark - 24 * 60; i < timeMark2; i = i + 5) {
          let temp2 = [(i * 60 * 1000), 0];
          addData.push(temp2);
        }

        // drawing chart
        const tempChart = [];
        for (let a = 0; a < timeData.length; a++) {
          if (timeData[a].time > timeMark - 24 * 60) {
            const time = timeData[a].time * 60 * 1000;
            let temp;
            if (reverseFlag)
              temp = [time, 1.0 / timeData[a].exchangeRate];
            else
              temp = [time, timeData[a].exchangeRate];
            tempChart.push(temp);

          }
        }
      }

    })
  }, [activeToken0, activeToken1]);

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

  const [graphType, setGraphType] = useState("BTC")
  const graphTypes = ["Routes", activeToken1.symbol]
  const showGraph = item => {
    setGraphType(item)
  }

  const test_tradeHistory = [
    {
      date: '2022-08-06 22:47:42',
      type: 'buy',
      price: '$0.06212',
      price_bnb: '0.0001959',
      amount_mine: '5145.58',
      total_bnb: '1.00',
      maker: '0x522351493F2bc0Dd02498741Fb78696D6943D4f0',
    },
    {
      date: '2022-08-06 22:45:45',
      type: 'sell',
      price: '$0.06083',
      price_bnb: '0.0001918',
      amount_mine: '1312.06',
      total_bnb: '0.2517',
      maker: '0x73d0451D4137DD57D145F27cE6E9207D1da39309',
    },
    {
      date: '2022-08-06 22:42:48',
      type: 'buy',
      price: '$0.05996',
      price_bnb: '0.0001892',
      amount_mine: '3717.88',
      total_bnb: '0.7000',
      maker: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    }
  ]

  const test_poolsActivity = [
    {
      type: 'remove',
      fromSymbol: 'BONE',
      fromAmount: '22.11',
      toSymbol: 'ETH',
      toAmount: '0.0125323',
      token_value: '$21.49',
      ago: '4min',
    },
    {
      type: 'add',
      fromSymbol: 'USDC',
      fromAmount: '99.99',
      toSymbol: 'ETH',
      toAmount: '0.0046699',
      token_value: '$8',
      ago: '5min',
    },
    {
      type: 'add',
      fromSymbol: 'SYN',
      fromAmount: '4.427',
      toSymbol: 'ETH',
      toAmount: '3.7',
      token_value: '$6346',
      ago: '6min',
    },
  ]

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
              <AcySymbolNav data={['BTC', 'ETH', 'BNB']} onChange={showGraph} />
              <AcySymbol
                pairName='BTC'
                // showDrawer={onClickCoin}
                // latestPriceColor={priceChangePercentDelta * 1 >= 0 && '#0ecc83' || '#fa3c58'}
                // latestPrice={latestPrice}
                // latestPricePercentage={priceChangePercentDelt
                latestPriceColor={1}
                latestPrice={1}
                latestPricePercentage={1}
              // coinList={coinList}
              />
              {/* </div> */}

              <div style={{ borderTop: '0.75px solid #333333' }}>
                {graphType == "Routes" ?
                  // <SankeyGraph />
                  <></>
                  :
                  <div>
                    <ExchangeTVChart
                      chartTokenSymbol={activeToken1.symbol}
                      // chartTokenSymbol="BTC"
                      pageName="Swap"
                      fromToken={activeToken0.symbol}
                      toToken={activeToken1.symbol}
                    />
                  </div>
                }
              </div>
            </div>

            <div className={styles.bottomWrapper}>
              <div className={styles.chartTokenSelectorTab}>
                <ComponentTabs
                  option={tableContent}
                  options={['Routes', 'Trade History', 'Pools Activity']}
                  onChange={item => { setTableContent(item) }}
                />
              </div>
              <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', width: '100%', borderTop: '0.75px solid #333333', borderRadius: '0' }}>
                <div className={`${styles.colItem} ${styles.priceChart}`}>
                  <div className={styles.positionsTable}>

                    {tableContent == 'Routes' && (
                      <SankeyGraph />
                    )}
                    {tableContent == 'Trade History' && (
                      <TradeHistoryTable dataSource={test_tradeHistory} />
                    )}
                    {tableContent == 'Pools Activity' && (
                      <PoolsActivityTable dataSource={test_poolsActivity} />
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
                  onSelectToken0={token => {
                    setActiveToken0(token);
                  }}
                  onSelectToken1={token => {
                    setActiveToken1(token);
                  }}
                  onGetReceipt={onGetReceipt}
                  showGraph={showGraph}
                  token0={activeToken0}
                  token1={activeToken1}
                  setActiveToken0={setActiveToken0}
                  setActiveToken1={setActiveToken1}
                  tokenlist={supportedTokens}
                  setTokenlist={setSupportedTokens}
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
