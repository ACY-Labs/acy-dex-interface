import React, { useEffect, useState } from 'react';
import { fetchGeneralTokenInfo, marketClient } from './Data/index.js';
import { dataSourceCoin, dataSourcePool } from './SampleData.js';
import styles from './styles.less';
import { MarketSearchBar, TokenTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';

const watchlistManagerToken = new WatchlistManager('token');

function MarketTokenList(props) {
  const [watchlistToken, setWatchlistToken] = useState([]);
  const [tokenInfo, setTokenInfo] = useState([]);

  let refreshWatchlist = () => {
    let tokenWatchlistData = watchlistManagerToken.getData();
    let newWatchlistToken = dataSourceCoin.filter(item => tokenWatchlistData.includes(item.short));
    setWatchlistToken([...newWatchlistToken]);
  };

  useEffect(() => {
    // fetch token info
    fetchGeneralTokenInfo(marketClient).then(tokenInfo => {
      setTokenInfo(tokenInfo);
    });

    let tokenWatchlistData = watchlistManagerToken.getData();
    let newWatchlistToken = dataSourceCoin.filter(item => tokenWatchlistData.includes(item.short));
    setWatchlistToken([...newWatchlistToken]);
  }, []);

  return (
    <div className={styles.marketRoot}>
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        refreshWatchlist={refreshWatchlist}
      />
      <h2>Watchlist</h2>
      <TokenTable dataSourceCoin={watchlistToken} />
      <h2>All Tokens</h2>
      <TokenTable dataSourceCoin={tokenInfo} />
      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketTokenList;
