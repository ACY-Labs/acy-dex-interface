import React, { useEffect, useState } from 'react';
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

  let refreshWatchlist = () => {
    let poolWatchlistData = watchlistManagerPool.getData();
    let newWatchlistPool = dataSourcePool.filter(item =>
      poolWatchlistData.toString().includes([item.coin1, item.coin2, item.percent].toString())
    );
    setWatchlistPool([...newWatchlistPool]);
  };

  useEffect(() => {
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
      <PoolTable dataSourcePool={dataSourcePool} />
      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketPoolList;
