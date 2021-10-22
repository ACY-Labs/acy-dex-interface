import React, { useEffect, useState } from 'react';
import { Icon } from 'antd';
import { fetchGeneralTokenInfo, marketClient, fetchTokenDaySimple } from './Data/index.js';
import { dataSourceCoin, dataSourcePool } from './SampleData.js';
import styles from './styles.less';
import { MarketSearchBar, TokenTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';
import { convertTokenForList } from './Data/util.js';
import ConnectWallet from './ConnectWallet';
const watchlistManagerToken = new WatchlistManager('token');

function MarketTokenList(props) {
  const [watchlistToken, setWatchlistToken] = useState([]);
  const [tokenInfo, setTokenInfo] = useState([]);

  let refreshWatchlist = () => {
    let tokenWatchlistData = watchlistManagerToken.getData();
    let watchlistData = [];
    let watchlistPromise = [];
    for (let i = 0; i < tokenWatchlistData.length; i++) {
      watchlistPromise.push(
        fetchTokenDaySimple(marketClient, tokenWatchlistData[i]).then(data => {
          let tokenData = data.tokenDayDatas;
          watchlistData.push(convertTokenForList(tokenData[0], tokenData[1]));
        })
      );
    }

    Promise.all(watchlistPromise).then(() => {
      setWatchlistToken(watchlistData);
    });
  };

  useEffect(() => {
    // fetch token info
    fetchGeneralTokenInfo(marketClient).then(tokenList => {
      setTokenInfo(tokenList);
    });

    let tokenWatchlistData = watchlistManagerToken.getData();
    let watchlistData = [];
    let watchlistPromise = [];
    for (let i = 0; i < tokenWatchlistData.length; i++) {
      watchlistPromise.push(
        fetchTokenDaySimple(marketClient, tokenWatchlistData[i]).then(data => {
          let tokenData = data.tokenDayDatas;
          watchlistData.push(convertTokenForList(tokenData[0], tokenData[1]));
        })
      );
    }

    Promise.all(watchlistPromise).then(() => {
      setWatchlistToken(watchlistData);
    });
  }, []);

  return (
    <div className={styles.marketRoot}>
      <ConnectWallet/>
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        refreshWatchlist={refreshWatchlist}
      />
      <h2>Watchlist</h2>
      <TokenTable dataSourceCoin={watchlistToken} />
      <h2>All Tokens</h2>
      {tokenInfo.length > 0 ? <TokenTable dataSourceCoin={tokenInfo} /> : <Icon type="loading" />}

      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketTokenList;
