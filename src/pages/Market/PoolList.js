import React, { useEffect, useState } from 'react';
import { dataSourceCoin, dataSourcePool } from './SampleData.js';
import { Icon } from 'antd';
import styles from './styles.less';
import { MarketSearchBar, PoolTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';
import {
  fetchGeneralPoolInfoDay,
  fetchGeneralTokenInfo,
  fetchGlobalTransaction,
  fetchMarketData,
  marketClient,
  fetchPoolsFromId,
  fetchPoolDayData,
} from './Data/index.js';
import { convertPoolForList } from './Data/util.js';

const watchlistManagerPool = new WatchlistManager('pool');

function MarketPoolList(props) {
  const [watchlistPool, setWatchlistPool] = useState([]);
  const [poolInfo, setPoolInfo] = useState([]);

  let refreshWatchlist = () => {
    let poolWatchlistData = watchlistManagerPool.getData();
    let watchlistPromise = [];
    let watchlistData = [];
    
    for (let i = 0; i < poolWatchlistData.length; i++) {
      watchlistPromise.push(
        fetchPoolDayData(marketClient, poolWatchlistData[i], 7).then(data => {
          let weekDataLength = data.length;
          let volume7d = 0;

          for (let j = 0; j < weekDataLength; j++) {
            volume7d += parseFloat(data[j].dailyVolumeUSD);
          }

          console.log(data);
          watchlistData.push({
            coin1: data[0].token0.symbol,
            coin2: data[0].token1.symbol,
            address: poolWatchlistData[i],
            percent: 0.3,
            tvl: parseFloat(data[0].reserveUSD),
            volume24h: parseFloat(data[0].dailyVolumeUSD),
            volume7d: volume7d
          });
        })
      );
    }

    Promise.all(watchlistPromise).then(() => {
      setWatchlistPool(watchlistData);
    });
  };

  useEffect(() => {
    let poolWatchlistData = watchlistManagerPool.getData();
    let watchlistPromise = [];
    let watchlistData = [];

    // fetch pool data
    fetchGeneralPoolInfoDay(marketClient).then(poolList => {
      setPoolInfo(poolList);

      setWatchlistPool(poolList.filter(item => poolWatchlistData.includes(item.address)));
    });

    // get day information for token in watchlist
    for (let i = 0; i < poolWatchlistData.length; i++) {
      watchlistPromise.push(
        fetchPoolDayData(marketClient, poolWatchlistData[i], 7).then(data => {
          let weekDataLength = data.length;
          let volume7d = 0;

          for (let j = 0; j < weekDataLength; j++) {
            volume7d += parseFloat(data[j].dailyVolumeUSD);
          }

          console.log(data);
          watchlistData.push({
            coin1: data[0].token0.symbol,
            coin2: data[0].token1.symbol,
            address: poolWatchlistData[i],
            percent: 0.3,
            tvl: parseFloat(data[0].reserveUSD),
            volume24h: parseFloat(data[0].dailyVolumeUSD),
            volume7d: volume7d
          });
        })
      );
    }

    Promise.all(watchlistPromise).then(() => {
      setWatchlistPool(watchlistData);
    });
  }, []);

  return (
    <div className={styles.marketRoot}>
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        refreshWatchlist={refreshWatchlist}
      />
      <PoolTable dataSourcePool={watchlistPool} />
      <h2>All Pools</h2>
      {poolInfo.length > 0 ? <PoolTable dataSourcePool={poolInfo} /> : <Icon type="loading" />}

      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketPoolList;
