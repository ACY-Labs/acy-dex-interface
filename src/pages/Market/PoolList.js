import React, { useEffect, useState } from 'react';
import {
  dataSourceCoin,
  dataSourcePool
} from './SampleData.js';
import { Icon} from 'antd';
import styles from './styles.less';
import { MarketSearchBar, PoolTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';
import {
  fetchGeneralPoolInfoDay,
  fetchGeneralTokenInfo,
  fetchGlobalTransaction,
  fetchMarketData,
  marketClient,
} from './Data/index.js';


const watchlistManagerPool = new WatchlistManager('pool');

function MarketPoolList(props) {
  const [watchlistPool, setWatchlistPool] = useState([]);
  const [poolInfo, setPoolInfo] = useState([])

  let refreshWatchlist = () => {
    let poolWatchlistData = watchlistManagerPool.getData();
    let newWatchlistPool = dataSourcePool.filter(item =>
      poolWatchlistData.toString().includes([item.coin1, item.coin2, item.percent].toString())
    );
    setWatchlistPool([...newWatchlistPool]);
  };

  useEffect(() => {
    // fetch pool data
    fetchGeneralPoolInfoDay(marketClient).then(poolList => {
      setPoolInfo(poolList)
    });


    let poolWatchlistData = watchlistManagerPool.getData();
    let newWatchlistPool = dataSourcePool.filter(item =>
      poolWatchlistData.toString().includes([item.coin1, item.coin2, item.percent].toString())
    );
    setWatchlistPool([...newWatchlistPool]);
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
