import React, { Component, useState, useCallback, useEffect } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table,  Row, Col,Input, Divider} from 'antd';
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
    AcySmallButton
  } from '@/components/Acy';

import {
  TransactionType,
  abbrHash,
  abbrNumber,
  columnsCoin, 
  columnsPool,
  transactionHeader,
  sortTable
} from './Util.js';

import {
  dataSourceCoin, 
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';


import {
  MarketSearchBar,
  SmallTable,
  PoolTable
} from './UtilComponent.js';

import {
  WatchlistManager
} from './WatchlistManager.js'

const {AcyTabPane } = AcyTabs;
const watchlistManagerPool = new WatchlistManager("pool")

function MarketPoolList(props){
    const [watchlistPool, setWatchlistPool] = useState([])

    let refreshWatchlist = () => {
      let poolWatchlistData = watchlistManagerPool.getData()
      let newWatchlistPool = dataSourcePool.filter(item => poolWatchlistData.toString().includes([item.coin1, item.coin2, item.percent].toString()))
      setWatchlistPool([...newWatchlistPool])
    }
  
    useEffect(() => {
      let poolWatchlistData = watchlistManagerPool.getData()
      let newWatchlistPool = dataSourcePool.filter(item => poolWatchlistData.toString().includes([item.coin1, item.coin2, item.percent].toString()))
      setWatchlistPool([...newWatchlistPool])
    }, [])
  
    return (
        <div className={styles.marketRoot}>
            <MarketSearchBar dataSourceCoin={dataSourceCoin} dataSourcePool={dataSourcePool} refreshWatchlist={refreshWatchlist}/>
            <PoolTable dataSourcePool={watchlistPool}></PoolTable>
            <h2>All Pools</h2>
            <PoolTable dataSourcePool={dataSourcePool}></PoolTable>
            <div style={{height:"40px"}}></div>
        </div>
    )
}

export default MarketPoolList;