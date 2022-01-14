import {
  AcyBarChart,
  AcyIcon,
  AcyLineChart,
  AcySmallButton,
  AcyPeriodTime,
  AcyTokenIcon,
} from '@/components/Acy';
import { Breadcrumb, Icon, Spin } from 'antd';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';
import styles from './styles.less';
import { abbrNumber, isDesktop, openInNewTab, calcPercentChange, FEE_PERCENT } from './Util.js';
import { MarketSearchBar, TransactionTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';
import {
  fetchPoolInfo,
  fetchPoolDayData,
  fetchPoolDayDataForPair,
  fetchTransactionsForPair,
  marketClient,
} from './Data/index.js';
import {SCAN_URL_PREFIX} from "@/constants";
import { useWeb3React } from '@web3-react/core';
import {useConnectWallet} from "@/components/ConnectWallet";
import { useConstantLoader } from '@/constants'
// const scanUrlPrefix = SCAN_URL_PREFIX();


const watchlistManagerPool = new WatchlistManager('pool');

let poolData = dataSourcePool[0];

function MarketPoolInfo(props) {
  let { address } = useParams();
  //const { chainId: walletChainId } = useWeb3React();
  const { account, marketNetwork: walletChainId } = useConstantLoader();

  const connectWalletByLocalStorage = useConnectWallet();
  useEffect(() => {
    if(!account){
      connectWalletByLocalStorage();
    }
  }, [account]);

  const [poolData, setPoolData] = useState({});
  const [graphTabIndex, setGraphTabIndex] = useState(0);
  const [isWatchlist, setIsWatchlist] = useState(false);

  const [selectChartDataVol, setSelectChartDataVol] = useState(
    graphSampleData[graphSampleData.length - 1][1]
  );
  const [selectChartIndexVol, setSelectChartIndexVol] = useState(graphSampleData.length - 1);

  const [selectChartDataTvl, setSelectChartDataTvl] = useState(
    graphSampleData[graphSampleData.length - 1][1]
  );
  const [selectChartIndexTvl, setSelectChartIndexTvl] = useState(graphSampleData.length - 1);

  const [selectChartDataLiq, setSelectChartDataLiq] = useState(
    graphSampleData[graphSampleData.length - 1][1]
  );
  const [selectChartIndexLiq, setSelectChartIndexLiq] = useState(graphSampleData.length - 1);

  // additional datas
  const [token0Price, setToken0Price] = useState(0);
  const [token1Price, setToken1Price] = useState(0);
  const [reserve0, setReserve0] = useState(0);
  const [reserve1, setReserve1] = useState(0);
  const [dayDatas, setDayDatas] = useState({});
  const [volume24h, setVolume24h] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [volChange, setVolChange] = useState(0);
  const [tvlChange, setTvlChange] = useState(0);
  const [tx, setTx] = useState(null);
  const [token0Address, setToken0Address] = useState('');
  const [token1Address, setToken1Address] = useState('');
  const [pairArray,setPairArray] = useState({});

  // const refContainer = useRef();
  // refContainer.current = data;

  const navHistory = useHistory();

  function switchChart(dest) {
    setGraphTabIndex(dest);
  }

  const toggleWatchlist = data => {
    let oldArray = watchlistManagerPool.getData();
      if (oldArray.includes(data)) {
        oldArray = oldArray.filter(item => item != data);
      } else {
        oldArray.push(data);
      }
      watchlistManagerPool.saveData(oldArray);
      updateWatchlistStatus();
  };

  const updateWatchlistStatus = () => {
    let data = watchlistManagerPool.getData();
    if (data.includes(address))
      setIsWatchlist(true);
    else setIsWatchlist(false);
  };

  useEffect(() => {
    if (!address || !walletChainId) return;
    console.log(">>> start fetching data")

    // extract the pool day datas
    fetchPoolDayDataForPair(address).then(data => {

      console.log("fetching pool day INFO", data);
      let newData = [...data].reverse();
      console.log("printing", newData);
      data = newData;

      // extract graph datas
      let length = data.length;
      let volumeGraphData = [];
      let tvlGraphData = [];

      console.log(data);

      for (let i = 0; i < length; i++) {
        // new Date(item.date * 1000).toLocaleDateString('en-CA')
        let dataDate = new Date(data[i].date * 1000).toLocaleDateString('en-CA');

        volumeGraphData.push([dataDate, parseFloat(data[i].dailyVolumeUSD)]);
        tvlGraphData.push([dataDate, parseFloat(data[i].reserveUSD)]);
      }

      // set the graphdata
      setDayDatas({
        volumeDayData: volumeGraphData,
        tvlDayData: tvlGraphData,
      });

      console.log('VOLUME GRAPH', volumeGraphData);

      setSelectChartDataVol(abbrNumber(volumeGraphData[length - 1][1]));
      setSelectChartIndexVol(length - 1);
      setSelectChartDataTvl(abbrNumber(tvlGraphData[length - 1][1]));
      setSelectChartIndexTvl(length - 1);


      setVolume24h(parseFloat(data[data.length-1].dailyVolumeUSD));
      setTvl(parseFloat(data[data.length-1].reserveUSD));
      if (data.length > 1) {
        setTvlChange(calcPercentChange(parseFloat(data[data.length-1].reserveUSD),parseFloat(data[data.length-2].reserveUSD)));
        setVolChange(calcPercentChange(parseFloat(data[data.length-1].dailyVolumeUSD),parseFloat(data[data.length-2].dailyVolumeUSD)));
      }
    });

    let snapshotPromise = [];
    let volumeChanges = [0, 0, 0];
    let reserveChanges = [0, 0];
    let todayTimestamp = Math.floor(Date.now() / 1000);

    // extract the pair data
    snapshotPromise.push(
      fetchPoolInfo(address).then(pairInfo => {
        console.log("fetching pool INFOO: ", pairInfo);

        if(pairInfo){
        setPoolData({
          coin1: pairInfo.token0.symbol,
          coin2: pairInfo.token1.symbol,
          logoURI1 : pairInfo.token0.logoURI,
          logoURI2 : pairInfo.token1.logoURI,
          address: address,
          percent: 0,
          tvl: 0,
          volume24h: 0,
          volume7d: 0,
          price: 0,
        });

        setPairArray({
          token0 : pairInfo.token0.symbol,
          token0 : pairInfo.token1.symbol
        })

        volumeChanges[0] = parseFloat(pairInfo.untrackedVolumeUSD);
        reserveChanges[0] = parseFloat(pairInfo.reserveUSD);

        setToken0Price(parseFloat(pairInfo.token0Price));
        setToken1Price(parseFloat(pairInfo.token1Price));
        setToken0Address(pairInfo.token0.id);
        setToken1Address(pairInfo.token1.id);
        setReserve0(parseFloat(pairInfo.reserve0));
        setReserve1(parseFloat(pairInfo.reserve1));
      }
      }
      )
      
    );

    // extract snapshot form a day ago
    // snapshotPromise.push(
    //   fetchPoolInfo(address).then(pairInfo => {
    //     if(pairInfo){
    //     volumeChanges[1] = parseFloat(pairInfo.untrackedVolumeUSD);
    //     reserveChanges[1] = parseFloat(pairInfo.reserveUSD);
    //     }
    //   })
    // );

    // snapshotPromise.push(
    //   fetchPoolInfo(address).then(pairInfo => {
    //     volumeChanges[2] = parseFloat(pairInfo.untrackedVolumeUSD);
    //   })
    // );

    // Promise.all(snapshotPromise).then(() => {
    //   setVolume24h(volumeChanges[0] - volumeChanges[1]);
    //   setVolChange(
    //     calcPercentChange(volumeChanges[0] - volumeChanges[1], volumeChanges[1] - volumeChanges[2])
    //   );

    //   setTvl(reserveChanges[0]);
    //   setTvlChange(calcPercentChange(reserveChanges[0], reserveChanges[1]));
    // });

    // fetch transactions for this pool
    // console.log(pairArray);
    

    // set the watchlists
    updateWatchlistStatus();
  }, [walletChainId]);

  useEffect(() => {

    if(poolData.coin1 && poolData.coin2){
      fetchTransactionsForPair(poolData.coin1, poolData.coin2).then(transactions => {
        console.log('Pool TRANSAC', transactions);
        setTx(transactions);
      });
    }

  },[poolData]);

  const selectGraph = pt => {
    let index = ['Volume', 'TVL', 'Liquidity'].indexOf(pt);
    switchChart(index);
  };

  const redirectToLiq = useCallback(() => navHistory.push('/liquidity'), [history]);
  const redirectToEx = useCallback(() => navHistory.push('/exchange'), [history]);
  const redirectToToken = tokenAddress => {
    navHistory.push(`/market/info/token/${tokenAddress}`);
  }

  return (
    <div className={styles.marketRoot}>
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        onRefreshWatchlist={() => {
          updateWatchlistStatus();
        }}
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
              Pools
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item style={{ fontWeight: 'bold' }}>
            {poolData.coin1 ? `${poolData.coin1}/${poolData.coin2}` : <Icon type="loading" />}
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.rightButton}>
          {poolData.coin1 ? (
            <>
              <AcyIcon
                name={isWatchlist ? 'star_active' : 'star'}
                width={16}
                style={{ marginLeft: '10px' }}
                onClick={() => toggleWatchlist(address)}
              />
              <AcyIcon
                name="redirect"
                style={{ marginLeft: '10px' }}
                width={16}
                onClick={() => {
                  openInNewTab(`${SCAN_URL_PREFIX()}token/${poolData.address}`);
                }}
              />
            </>
          ) : (
            <Icon type="loading" />
          )}
        </div>
      </div>

      {/* <div>
        <div className={styles.rightButton} />
      </div> */}
      {Object.keys(poolData).length === 0 ? (
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
                <AcyTokenIcon symbol={poolData.logoURI1} width={36} height={36} />
                <AcyTokenIcon symbol={poolData.logoURI2} width={36} height={36} />
                <span
                  style={{ fontSize: '26px', fontWeight: 'bold', marginLeft: '10px', color: "white" }}
                  className={styles.coinName}
                >
                  {poolData.coin1}{' '}/{' '}{poolData.coin2}
                </span>
                {/* <div
              className={styles.percentBadge}
              style={{ marginLeft: '20px', fontSize: '18px', lineHeight: '20px' }}
            >
              {poolData.percent} %
            </div> */}
              </div>
            </div>
          </div>
          <div className={styles.exchangeValuePadder}>
            <div className={styles.exchangeValueWrapper}>
              <div
                className={styles.exchangeValueCard}
                onClick={() => redirectToToken(token0Address)}
              >
                <AcyTokenIcon symbol={poolData.logoURI1} width={18} />
                <strong style={{ marginLeft: '7px' }}>
                  1 {poolData.coin1} = {abbrNumber(token0Price/token1Price)} {poolData.coin2}
                </strong>
              </div>
              <div className={styles.exchangeValueRight}>
                <div
                  className={styles.exchangeValueCard}
                  style={{
                    width: isDesktop() ? '30%' : '100%',
                    marginTop: isDesktop() ? 0 : '10px',
                    marginBottom: isDesktop() ? 0 : '10px',
                  }}
                  onClick={() => redirectToToken(token1Address)}
                >
                  <AcyTokenIcon symbol={poolData.logoURI2} width={18} />
                  <strong style={{ marginLeft: '7px' }}>
                    1 {poolData.coin2} = {abbrNumber(token1Price/token0Price)} {poolData.coin1}
                  </strong>
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
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className={styles.contentStats}>
              <div className={styles.statEntry}>
                <strong>Total tokens locked</strong>
                <div className={styles.tokenLockEntry}>
                  <div className={styles.tokenLockName}>
                    {/* change data later */}
                    <AcyTokenIcon symbol={poolData.logoURI1} width={18} />
                    <div style={{ marginLeft: 10 }}>{poolData.coin1}</div>
                  </div>
                  <div>{abbrNumber(reserve0)}</div>
                </div>
                <div className={styles.tokenLockEntry}>
                  <div className={styles.tokenLockName}>
                    {/* change data later */}
                    <AcyTokenIcon symbol={poolData.logoURI2} width={18} />
                    <div style={{ marginLeft: 10 }}>{poolData.coin2}</div>
                  </div>
                  <div>{abbrNumber(reserve1)}</div>
                </div>
              </div>
              <div className={styles.statEntry}>
                <div className={styles.statEntryName}>TVL</div>
                <div className={styles.statEntryValue}>$ {abbrNumber(tvl)}</div>
                <div
                  className={styles.statEntryChange}
                  style={{ color: tvlChange >= 0 ? 'greenyellow' : 'red' }}
                >
                  {!isNaN(tvlChange) ? `${tvlChange.toFixed(2)} %` : '0.00 %'}
                </div>
              </div>
              <div className={styles.statEntry}>
                <div className={styles.statEntryName}>24h Trading Vol</div>
                <div className={styles.statEntryValue}>$ {abbrNumber(volume24h)}</div>
                <div
                  className={styles.statEntryChange}
                  style={{ color: volChange >= 0 ? 'greenyellow' : 'red' }}
                >
                  {' '}
                  {!isNaN(volChange) ? `${volChange.toFixed(2)} %` : '0.00 %'}
                </div>
              </div>
              <div className={styles.statEntry}>
                <div className={styles.statEntryName}>24h Fees</div>
                <div className={styles.statEntryValue}>$ {abbrNumber(volume24h * FEE_PERCENT)}</div>
                <div className={styles.statEntryChange} style={{ visibility: 'hidden' }}>
                  00{' '}
                </div>
              </div>
            </div>
            {Object.keys(dayDatas).length === 0 ? (
              <Spin />
            ) : (
              <div className={styles.contentCharts}>
                <div className={styles.contentChartsHeader}>
                  {graphTabIndex == 0 && (
                    <div className={styles.contentChartsIndicator}>
                      <div className={styles.chartIndicatorValue}>$ {selectChartDataVol}</div>
                      <div className={styles.chartIndicatorTime}>
                        {dayDatas.length && (dayDatas.volumeDayData[dayDatas.length-1][0])}
                      </div>
                    </div>
                  )}
                  {graphTabIndex == 1 && (
                    <div className={styles.contentChartsIndicator}>
                      <div className={styles.chartIndicatorValue}>$ {selectChartDataTvl}</div>
                      <div className={styles.chartIndicatorTime}>
                        {dayDatas.length && (dayDatas.tvlDayData[dayDatas.length-1][0])}
                      </div>
                    </div>
                  )}
                  {/* {graphTabIndex == 2 && (
            <div className={styles.contentChartsIndicator}>
              <div className={styles.chartIndicatorValue}>$ {selectChartDataLiq}</div>
              <div className={styles.chartIndicatorTime}>
                {graphSampleData[selectChartIndexLiq][0]}
              </div>
            </div>
          )} */}
                  <div className={styles.contentChartsSelector}>
                    <AcyPeriodTime onhandPeriodTimeChoose={selectGraph} times={['Volume', 'TVL']} />
                    {/* <AcySmallButton
              color={graphTabIndex == 0 ? '#1b1b1c' : '#757579'}
              textColor="white"
              borderColor="#757579"
              borderRadius="15px 0 0 15px"
              padding="2px 5px"
              onClick={() => switchChart(0)}
              id="0"
            >
              Volume
            </AcySmallButton>
            <AcySmallButton
              color={graphTabIndex == 1 ? '#1b1b1c' : '#757579'}
              textColor="white"
              borderColor="#757579"
              borderRadius="0 0 0 0"
              padding="2px 5px"
              onClick={() => switchChart(1)}
              id="1"
            >
              TVL
            </AcySmallButton>
            <AcySmallButton
              color={graphTabIndex == 2 ? '#1b1b1c' : '#757579'}
              textColor="white"
              borderColor="#757579"
              borderRadius="0 15px 15px 0"
              padding="2px 5px"
              onClick={() => switchChart(2)}
              id="2"
            >
              Liquidity
            </AcySmallButton> */}
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
                  {/* {graphTabIndex == 2 && (
                <div className={styles.contentChartWrapper}>
                  <AcyBarChart
                    backData={graphSampleData}
                    barColor="#1e5d91"
                    showXAxis
                    onHover={(data, index) => {
                      setSelectChartDataLiq(abbrNumber(data));
                      setSelectChartIndexLiq(index);
                    }}
                  />
                </div>
              )} */}
                </div>
              </div>
            )}
          </div>
          <h2>Transactions</h2>
          {!tx? (
         <Icon type="loading" />
           ) : (
           <TransactionTable dataSourceTransaction={tx} />
            )}
        </>
      )}

      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketPoolInfo;
