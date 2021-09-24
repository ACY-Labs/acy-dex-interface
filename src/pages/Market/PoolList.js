import React, { useEffect, useState } from 'react';
import {
  fetchGeneralPoolInfoDay, marketClient
} from './Data/index.js';
import {
  dataSourceCoin,
  dataSourcePool
} from './SampleData.js';
import styles from './styles.less';
import { MarketSearchBar, PoolTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';


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
    fetchGeneralPoolInfoDay(marketClient).then(poolInfo => {
      setPoolInfo(poolInfo)
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
      <PoolTable dataSourcePool={poolInfo} />
      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketPoolList;
