import React, { Component, useState, useCallback, useEffect } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table, Row, Col, Input, Divider } from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { useDetectClickOutside } from 'react-detect-click-outside';
import {
  AcyButton,
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyCuarrencyCard,
  AcyConnectWalletBig,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyLineChart,
  AcyBarChart,
  AcyConfirm,
  AcyApprove,
  AcySmallButton,
} from '@/components/Acy';

import {
  TransactionType,
  abbrHash,
  abbrNumber,
  columnsCoin,
  columnsPool,
  transactionHeader,
  sortTable,
} from './Util.js';

import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';

import { MarketSearchBar, SmallTable, TokenTable } from './UtilComponent.js';

import { WatchlistManager } from './WatchlistManager.js';

const { AcyTabPane } = AcyTabs;
const watchlistManagerToken = new WatchlistManager('token');

let sampleToken = dataSourceCoin[0];

function MarketTokenList(props) {
  const [watchlistToken, setWatchlistToken] = useState([]);

  let refreshWatchlist = () => {
    let tokenWatchlistData = watchlistManagerToken.getData();
    let newWatchlistToken = dataSourceCoin.filter(item => tokenWatchlistData.includes(item.short));
    setWatchlistToken([...newWatchlistToken]);
  };

  useEffect(() => {
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
      <TokenTable dataSourceCoin={dataSourceCoin} />
      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketTokenList;
