import {
  AcyBarChart,
  AcyIcon,
  AcyLineChart,
  AcyPeriodTime,
  AcySmallButton,
  AcyTokenIcon,
} from '@/components/Acy';
import { Breadcrumb, Icon, Spin } from 'antd';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import {
  fetchTokenDayData,
  fetchPoolDayData,
  marketClient,
  fetchTokenInfo,
  fetchTransactionsForToken,
} from './Data/index.js';
import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  // graphSampleData,
} from './SampleData.js';
import styles from './styles.less';
import { abbrNumber, openInNewTab, sortTable, calcPercentChange, FEE_PERCENT } from './Util.js';
import { TranslateToUSD } from "@/utils/utils";
import { convertPoolForList } from './Data/util.js';
import { MarketSearchBar, PoolTable, TransactionTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';
import ConnectWallet from './ConnectWallet';
import {useConstantLoader, SCAN_URL_PREFIX} from "@/constants";


const watchlistManagerToken = new WatchlistManager('token');

function MarketTokenInfo(props) {
  let { address } = useParams();
  //const {chainId, tokenList} = useConstantLoader();
  const {marketNetwork:chainId, marketTokenList:tokenList} = useConstantLoader();

  const token = useMemo(() => {
    if (!address || !chainId) 
      return;
    
    console.log("address nd chainId of this page", address, chainId)
    const token = tokenList.find(t => t.address.toLowerCase() == address.toLowerCase())
    console.log("page token", token)
    if (token)
      return token;
    }, [address, chainId])
  
  const [graphSampleData, setGraphSampleData] = useState(0);
  const [tokenData, setTokenData] = useState({});
  const [graphTabIndex, setGraphTabIndex] = useState(0);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [selectChartDataVol, setSelectChartDataVol] = useState("");
  const [selectChartIndexVol, setSelectChartIndexVol] = useState(0);
  const [selectChartDataTvl, setSelectChartDataTvl] = useState("");
  const [selectChartIndexTvl, setSelectChartIndexTvl] = useState(0);
  const [selectChartDataPrice, setSelectChartDataPrice] = useState("");
  const [selectChartIndexPrice, setSelectChartIndexPrice] = useState(0);
  //const [marketNetwork,setmarketNetwork] = useState('');

  // additional datas
  const [volume24h, setVolume24h] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [volume7d, setVolume7d] = useState(0);
  const [txCount, setTxCount] = useState(0)
  const [vol24Change, setVol24Change] = useState(0);
  const [tvlChange, setTvlChange] = useState(0);

  const [dayDatas, setDayDatas] = useState({});
  const [poolData, setPoolData] = useState([]);
  const [tx, setTx] = useState(null);

  const navHistory = useHistory();

  function switchChart(dest) {
    setGraphTabIndex(dest);
  }

  const redirectToLiq = useCallback(() => navHistory.push('/liquidity'), [history]);
  const redirectToEx = useCallback(() => navHistory.push('/exchange'), [history]);

  const toggleWatchlist = data => {
    let oldArray = watchlistManagerToken.getData();
    if (oldArray.includes(data)) {
      oldArray = oldArray.filter(item => item != data);
      setIsWatchlist(false);
    } else {
      oldArray.push(data);
      setIsWatchlist(true);
    }
    watchlistManagerToken.saveData(oldArray);
  };

  const updateWatchlistStatus = () => {
    let data = watchlistManagerToken.getData();
    if (data.includes(address)) setIsWatchlist(true);
    else setIsWatchlist(false);
  };

  

  useEffect(() => {
    if (!token)
      return;
    console.log("entering useEffect")
    let todayTimestamp = Math.floor(Date.now() / 1000);
    let volumeChange = [0, 0, 0, 0];
    let txChange = [0, 0, 0]
    let tokenAddress = address


    // request the token info
    fetchTokenDayData(address).then((data) => {
      // let newData = data.reverse();
      // data = newData;

      let length = data.length;

      let priceToday = parseFloat(data[length - 1].priceUSD);
      let priceChange = 0;
      if (data.length > 1) {
        const pricePrev = parseFloat(data[length - 2].priceUSD);
        priceChange = ((priceToday - pricePrev) / pricePrev) * 100;
      }

      // calculate volume 7d and set
      let volume7d = 0;
      if (data.length >= 7) {
        for (let i = 1; i <= 7; i++) {
          volume7d += parseFloat(data[length - i].dailyVolumeUSD);
        }
        setVolume7d(volume7d);
      }

      // extract graph datas
      let volumeGraphData = [];
      let tvlGraphData = [];
      let priceGraphData = [];

      for (let i = 0; i < length; i++) {
        // new Date(item.date * 1000).toLocaleDateString('en-CA')
        let dataDate = new Date(data[i].date * 1000).toLocaleDateString('en-CA');

        volumeGraphData.push([dataDate, parseFloat(data[i].dailyVolumeUSD)]);
        tvlGraphData.push([dataDate, parseFloat(data[i].totalLiquidityUSD)]);
        priceGraphData.push([dataDate, parseFloat(data[i].priceUSD)]);
      }

      // set the graphdata
      setDayDatas({
        volumeDayData: volumeGraphData,
        tvlDayData: tvlGraphData,
        priceDayData: priceGraphData,
      });

      // set default selected values
      setSelectChartDataVol(abbrNumber(volumeGraphData[length - 1][1]));
      setSelectChartDataTvl(abbrNumber(tvlGraphData[length - 1][1]));
      setSelectChartDataPrice(abbrNumber(priceGraphData[length - 1][1]));

      setTvl(parseFloat(tvlGraphData[length - 1][1]));
      if (tvlGraphData.length > 1) {
        setTvlChange(calcPercentChange(tvlGraphData[length - 1][1], tvlGraphData[length - 2][1]))
      }

      // fetchFilteredTransaction(marketClient, pairAddresses).then(transactions => {
      //   console.log('TOIKEN TRANSAC', transactions);
      //   setTx(transactions);
      // });

      // transactions format
      //
      // account: "0x1111111254fb6c44bac0bed2854e76f90643097d"
      // coin1: "UNI"
      // coin1Amount: 25
      // coin2: "WETH"
      // coin2Amount: 0.1087164206682329
      // time: "2021-12-25T02:11:37.000Z"
      // totalValue: 440.34388977032756
      // transactionID: "0x76b933eb95fd4d32752cae0b4f58c7c120d2d095a18eb39e673eae1430e6ec13"
      // type: "Swap"

      // axios.get(`${apiUrlPrefix}/txlist/token?symbol=${symbol}&range=${range}`).then(res => {
      //   const data = res.data.data;
      //   const formattedTransactions = data.map(tx => {
      //     const {address: account, hash: transactionID, token1Number: coin1Amount, token1Symbol: coin1, token2Number: coin2Amount, token2Symbol: coin2, transactionTime: time, action: type} = tx
      //     const totalValue = TranslateToUSD(symbol, coin2Amount);
      //     return {account, transactionID, coin1Amount, coin1, coin2Amount, coin2, time, type}
      //   })
      //   setTx(formattedTransactions);
      // })

      // set token data last

      setTokenData({
        name: token.name,
        short: token.symbol,
        address: address,
        logoURI: token.logoURI,
        price: parseFloat(data[length - 1].priceUSD),
        priceChange: priceChange,
        volume24h: parseFloat(data[length - 1].dailyVolumeUSD),
        tvl: parseFloat(data[length - 1].totalLiquidityUSD),
      });

      setVolume24h(volumeGraphData[volumeGraphData.length - 1][1]);
      
      if (volumeGraphData.length > 1) {
        setVol24Change(
          calcPercentChange(volumeGraphData[volumeGraphData.length - 1][1] - volumeGraphData[volumeGraphData.length - 2][1], volumeGraphData[volumeGraphData.length - 2][1] - volumeGraphData[volumeGraphData.length - 3][1])
        );
      }
    });

    fetchPoolDayData(address).then(parsedPairData => {
      // // process and set pool data
      parsedPairData = sortTable(parsedPairData, 'tvl', true);
      console.log("parsedPairData", parsedPairData)
      setPoolData(parsedPairData)
    })

    fetchTransactionsForToken(token.symbol).then(transactions => {
      transactions = sortTable(transactions, "time", true);
      console.log("print transactions", transactions)
      setTx(transactions);

      const oneDayAgo = new Date().getTime() - 86400000;
      const txCount = transactions.filter(t => new Date(t.time).getTime() > oneDayAgo).length;
      console.log("txCount", txCount)
      setTxCount(txCount == 50 ? "50 +" : txCount);
    });

    // set the watchlists
    updateWatchlistStatus();
  }, [token]);

  const selectGraph = pt => {
    let index = ['Volume', 'TVL', 'Price'].indexOf(pt);
    switchChart(index);
  };

  const getNetwork = (index) => {
    // 输出接收到子组件的参数
    console.log(index);
    //setmarketNetwork(index);
  }
  const networkShow = false;

  return (
    <div className={styles.marketRoot}>
      <ConnectWallet />
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        onRefreshWatchlist={() => {
          updateWatchlistStatus();
        }}
        getNetwork={getNetwork}
        networkShow = {networkShow}
      />
      <div className={styles.infoHeader}>
        <Breadcrumb
          separator={<span style={{ color: '#b5b5b6' }}>&gt;</span>}
          style={{ marginBottom: '20px', color: '#b5b5b6' }}
        >
          <Breadcrumb.Item>
            <Link style={{ color: '#b5b5b6' }} to="/market">
              Overview
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link style={{ color: '#b5b5b6' }} to="/market/list/pool">
              Tokens
            </Link>
          </Breadcrumb.Item>

          <Breadcrumb.Item style={{ fontWeight: 'bold' }}>
            {' '}
            {tokenData.short ? tokenData.short : <Icon type="loading" />}
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.rightButton}>
          {tokenData.short ? (
            <>
              <AcyIcon
                name={isWatchlist ? 'star_active' : 'star'}
                style={{ marginLeft: '10px' }}
                width={16}
                onClick={() => toggleWatchlist(address)}
              />
              {/* <AcyIcon name="cmc" style={{ marginLeft: '10px' }} width={16} /> */}
              <AcyIcon
                name="redirect"
                style={{ marginLeft: '10px' }}
                width={16}
                onClick={() => {
                  openInNewTab(`${SCAN_URL_PREFIX()}/token/${tokenData.address}`);
                }}
              />
            </>
          ) : (
            <Icon type="loading" />
          )}
        </div>
      </div>

      {Object.keys(tokenData).length === 0 ? (
        <Spin />
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div className={styles.contentInfo}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AcyTokenIcon symbol={tokenData.logoURI} width={36} />
                <span style={{ fontSize: '26px', fontWeight: 'bold', marginLeft: '10px', color: "white" }}>
                  {tokenData.short}
                </span>
                <div style={{ width: 5 }}></div>
                <span style={{ fontSize: '26px', fontWeight: 'thin', marginLeft: '10px' }}>
                  ({tokenData.name})
                </span>
              </div>
              <div>
                <span style={{ fontSize: '30px', fontWeight: 'bold' }}>
                  $ {tokenData.price.toFixed(3)}
                </span>
                <span
                  style={{ fontSize: '20px', fontWeight: 'thin', marginLeft: '16px' }}
                  className={
                    tokenData.priceChange < 0 ? styles.priceChangeDown : styles.priceChangeUp
                  }
                >
                  {tokenData.priceChange.toFixed(2)} %
                </span>
              </div>
            </div>
            <div className={styles.contentCta}>
              <div className={styles.ctaButton}>
                <AcySmallButton
                  color="#2e3032"
                  borderColor="#2e3032"
                  borderRadius="15px"
                  padding="10px"
                  onClick={redirectToLiq}
                >
                  <AcyIcon name="addlq" width={16} style={{ marginRight: '10px' }} />
                  Add Liquidity
                </AcySmallButton>
              </div>
              <div className={styles.ctaButton}>
                <AcySmallButton
                  color="#1e5d91"
                  borderColor="#1e5d91"
                  borderRadius="15px"
                  padding="10px"
                  onClick={redirectToEx}
                >
                  Trade
                </AcySmallButton>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className={styles.contentStats}>
              <div className={styles.statEntry}>
                <div className={styles.statEntryName}>TVL</div>
                <div className={styles.statEntryValue}>$ {abbrNumber(tvl)}</div>
                <div
                  className={styles.statEntryChange}
                  style={{ color: tvlChange >= 0 ? 'greenyellow' : 'red' }}
                >
                  {`${tvlChange.toFixed(2)} %`}
                </div>
              </div>
              <div className={styles.statEntry}>
                <div className={styles.statEntryName}>24h Trading Vol</div>
                <div className={styles.statEntryValue}>$ {abbrNumber(volume24h)}</div>
                <div
                  className={styles.statEntryChange}
                  style={{ color: vol24Change >= 0 ? 'greenyellow' : 'red' }}
                >
                  {' '}
                  {`${vol24Change.toFixed(2)} %`}
                </div>
              </div>
              <div className={styles.statEntry}>
                <div className={styles.statEntryName}>7d Trading Vol</div>
                <div className={styles.statEntryValue}>$ {abbrNumber(volume7d)}</div>
                <div className={styles.statEntryChange} style={{ visibility: 'hidden' }}>
                  00{' '}
                </div>
              </div>
              <div className={styles.statEntry}>
                <div className={styles.statEntryName}>24h Transactions</div>
                <div className={styles.statEntryValue}>{txCount}</div>
                <div className={styles.statEntryChange} style={{ visibility: 'hidden' }}>
                  00{' '}
                </div>
              </div>
            </div>
            <div className={styles.contentCharts}>
              <div className={styles.contentChartsHeader}>
                {graphTabIndex == 0 && (
                  <div className={styles.contentChartsIndicator}>
                    <div className={styles.chartIndicatorValue}>$ {selectChartDataVol}</div>
                    <div className={styles.chartIndicatorTime}>
                      {dayDatas.volumeDayData[selectChartIndexVol][0]}
                    </div>
                  </div>
                )}
                {graphTabIndex == 1 && (
                  <div className={styles.contentChartsIndicator}>
                    <div className={styles.chartIndicatorValue}>$ {selectChartDataTvl}</div>
                    <div className={styles.chartIndicatorTime}>
                      {dayDatas.tvlDayData[selectChartIndexTvl][0]}
                    </div>
                  </div>
                )}
                {graphTabIndex == 2 && (
                  <div className={styles.contentChartsIndicator}>
                    <div className={styles.chartIndicatorValue}>$ {selectChartDataPrice}</div>
                    <div className={styles.chartIndicatorTime}>
                      {dayDatas.priceDayData[selectChartIndexPrice][0]}
                    </div>
                  </div>
                )}

                <div className={styles.contentChartsSelector}>
                  <AcyPeriodTime
                    onhandPeriodTimeChoose={selectGraph}
                    times={['Volume', 'TVL', 'Price']}
                  />
                </div>
              </div>
              <div className={styles.contentChartsBody}>
                {graphTabIndex == 0 && (
                  <div className={styles.contentChartWrapper}>
                    <AcyBarChart
                      data={dayDatas.volumeDayData}
                      barColor="#1e5d91"
                      showXAxis
                      onHover={(data, index) => {
                        setSelectChartDataVol(abbrNumber(data));
                        setSelectChartIndexVol(index);
                      }}
                    />
                  </div>
                )}
                {graphTabIndex == 1 && (
                  <div className={styles.contentChartWrapper}>
                    <AcyLineChart
                      showXAxis={true}
                      data={dayDatas.tvlDayData}
                      showGradient={true}
                      lineColor="#1e5d91"
                      bgColor="#00000000"
                      onHover={(data, index) => {
                        setSelectChartDataTvl(abbrNumber(data));
                        setSelectChartIndexTvl(index);
                      }}
                    />
                  </div>
                )}
                {graphTabIndex == 2 && (
                  <div className={styles.contentChartWrapper}>
                    <AcyLineChart
                      showXAxis={true}
                      data={dayDatas.priceDayData}
                      showGradient={true}
                      lineColor="#1e5d91"
                      bgColor="#00000000"
                      onHover={(data, index) => {
                        setSelectChartDataPrice(abbrNumber(data));
                        setSelectChartIndexPrice(index);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <h2>Pools</h2>
          {poolData.length > 0 ? <PoolTable dataSourcePool={poolData} /> : <Icon type="loading" />}

          <h2>Transactions</h2>
          {tx ? (
            <TransactionTable dataSourceTransaction={tx} />
          ) : (
            <Icon type="loading" />
          )}
        </>
      )}

      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketTokenInfo;
