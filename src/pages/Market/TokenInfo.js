import {
  AcyBarChart,
  AcyIcon,
  AcyLineChart,
  AcyPeriodTime,
  AcySmallButton,
  AcyTokenIcon,
} from '@/components/Acy';
import { Breadcrumb, Icon, Spin } from 'antd';
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import {
  fetchTokenDayData,
  fetchPoolDayData,
  marketClient,
  fetchTokenInfo,
  fetchFilteredTransaction,
} from './Data/index.js';
import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';
import styles from './styles.less';
import { abbrNumber, openInNewTab, sortTable, calcPercentChange, FEE_PERCENT } from './Util.js';
import { convertPoolForList } from './Data/util.js';
import { MarketSearchBar, PoolTable, TransactionTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';
import ConnectWallet from './ConnectWallet';
import ConstantLoader from '@/constants';
const scanUrlPrefix = ConstantLoader().scanUrlPrefix;

const watchlistManagerToken = new WatchlistManager('token');

function MarketTokenInfo(props) {
  let { address } = useParams();

  const [tokenData, setTokenData] = useState({});
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
  const [selectChartDataPrice, setSelectChartDataPrice] = useState(
    graphSampleData[graphSampleData.length - 1][1]
  );
  const [selectChartIndexPrice, setSelectChartIndexPrice] = useState(graphSampleData.length - 1);

  // additional datas
  const [volume24h, setVolume24h] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [volume7d, setVolume7d] = useState(0);
  const [txCount, setTxCount] = useState(0)
  const [vol24Change, setVol24Change] = useState(0);
  const [tvlChange, setTvlChange] = useState(0);

  const [dayDatas, setDayDatas] = useState({});
  const [poolData, setPoolData] = useState([]);
  const [tx, setTx] = useState([]);

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
    let todayTimestamp = Math.floor(Date.now() / 1000);
    let volumeChange = [0, 0, 0, 0];
    let txChange = [0,0,0]
    let tokenAddress = address


    

    // request the token info
    fetchTokenDayData(marketClient, address).then(([data, pairs0, pairs1]) => {
      let newData = [...data].reverse();
      data = newData;

      let length = data.length;

      let priceToday = parseFloat(data[length - 1].priceUSD);
      let pricePrev = parseFloat(data[length - 2].priceUSD);
      let priceChange = ((priceToday - pricePrev) / pricePrev) * 100;

      // calculate volume 7d and set
      let volume7d = 0;
      for (let i = 1; i <= 7; i++) {
        volume7d += parseFloat(data[length - i].dailyVolumeUSD);
      }
      setVolume7d(volume7d);

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
      setTvlChange(calcPercentChange(tvlGraphData[length - 1][1],tvlGraphData[length - 2][1]))

      // process and set pool data
      let pairLen0 = pairs0.length;
      let pairLen1 = pairs1.length;
      let pairAddresses = [...pairs0.map(item => item.id), ...pairs1.map(item => item.id)];
      let pairData = [];
      let pairPromises = [];
      for (let i = 0; i < pairLen0; i++) {
        pairPromises.push(
          fetchPoolDayData(marketClient, pairs0[i].id, 7).then(pair0DayData => {
            if (pair0DayData.length > 0) {
              // calculate volume 7d
              let dayDataLen0 = pair0DayData.length;
              let p0VolumeWeek = 0;
              for (let j = 0; j < dayDataLen0; j++) {
                p0VolumeWeek += parseFloat(pair0DayData[j].dailyVolumeUSD);
              }

              // push to list
              let newPair = {
                coin1: pairs0[i].token0.symbol,
                coin2: pairs0[i].token1.symbol,
                address: pairs0[i].id,
                percent: 0,
                tvl: parseFloat(pair0DayData[0].reserveUSD),
                volume24h: parseFloat(pair0DayData[0].dailyVolumeUSD),
                volume7d: p0VolumeWeek,
                price: 0,
              };
              pairData.push(newPair);
            }
          })
        );
      }

      for (let i = 0; i < pairLen1; i++) {
        pairPromises.push(
          fetchPoolDayData(marketClient, pairs1[i].id, 7).then(pair1DayData => {
            if (pair1DayData.length > 0) {
              // calculate volume 7d
              let dayDataLen1 = pair1DayData.length;
              let p1VolumeWeek = 0;
              for (let j = 0; j < dayDataLen1; j++) {
                p1VolumeWeek += parseFloat(pair1DayData[j].dailyVolumeUSD);
              }

              // push to list
              let newPair = {
                coin1: pairs1[i].token0.symbol,
                coin2: pairs1[i].token1.symbol,
                address: pairs1[i].id,
                percent: 0,
                tvl: parseFloat(pair1DayData[0].reserveUSD),
                volume24h: parseFloat(pair1DayData[0].dailyVolumeUSD),
                volume7d: p1VolumeWeek,
                price: 0,
              };

              pairData.push(newPair);
            }
          })
        );
      }

      // wait untill all pool requests are finished then update UI
      Promise.all(pairPromises).then(() => {
        pairData = sortTable(pairData, 'tvl', true);
        setPoolData(pairData);
      });

      fetchFilteredTransaction(marketClient, pairAddresses).then(transactions => {
        console.log('TOIKEN TRANSAC', transactions);
        setTx(transactions);
      });

      // set token data last
      setTokenData({
        name: data[length - 1].token.name,
        short: data[length - 1].token.symbol,
        address: address,
        price: parseFloat(data[length - 1].priceUSD),
        priceChange: priceChange,
        volume24h: parseFloat(data[length - 1].dailyVolumeUSD),
        tvl: parseFloat(data[length - 1].totalLiquidityUSD),
      });
    });

    // get volume and tvl
    let snapshotsPromise = [];
    snapshotsPromise.push(
      fetchTokenInfo(marketClient, tokenAddress, todayTimestamp).then(tokenInfoPresent => {
        volumeChange[0] = parseFloat(tokenInfoPresent.tradeVolumeUSD);
        txChange[0] = parseInt(tokenInfoPresent.txCount)
      })
    );
    snapshotsPromise.push(
      fetchTokenInfo(marketClient, tokenAddress, todayTimestamp - 86400).then(tokenInfo24h => {
        volumeChange[1] = parseFloat(tokenInfo24h.tradeVolumeUSD);
        txChange[1] = parseInt(tokenInfo24h.txCount)
      })
    );
    snapshotsPromise.push(
      fetchTokenInfo(marketClient, tokenAddress, todayTimestamp - (86400 * 2)).then(tokenInfo48h => {
        volumeChange[2] = parseFloat(tokenInfo48h.tradeVolumeUSD);
        txChange[2] = parseInt(tokenInfo48h.txCount)
      })
    );
    snapshotsPromise.push(
      fetchTokenInfo(marketClient, tokenAddress, todayTimestamp - (86400 * 7)).then(tokenInfo7d => {
        volumeChange[3] = parseFloat(tokenInfo7d.tradeVolumeUSD);
      })
    );

    Promise.all(snapshotsPromise).then(() => {
      setVolume24h(volumeChange[0] - volumeChange[1]);
      setVol24Change(
        calcPercentChange(volumeChange[0] - volumeChange[1], volumeChange[1] - volumeChange[2])
      );

      // setVolume7d(volumeChange[0] - volumeChange[3]);

      setTxCount(txChange[0] - txChange[1])
    });

    // set the watchlists
    updateWatchlistStatus();
  }, []);

  const selectGraph = pt => {
    let index = ['Volume', 'TVL', 'Price'].indexOf(pt);
    switchChart(index);
  };

  return (
    <div className={styles.marketRoot}>
      <ConnectWallet/>
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
                  openInNewTab(`${scanUrlPrefix}/token/${tokenData.address}`);
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
                <AcyTokenIcon symbol={tokenData.short} width={36} />
                <span style={{ fontSize: '26px', fontWeight: 'bold', marginLeft: '10px', color: "white" }}>
                  {tokenData.short}
                </span>
                <div style={{width:5}}></div>
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
                  {`${vol24Change.toFixed(2)} %`}
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
                <div className={styles.statEntryValue}>{abbrNumber(txCount)}</div>
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
                Price
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
          {tx.length > 0 ? (
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
