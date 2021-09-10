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
  SmallTable
} from './UtilComponent.js';

import {
  WatchlistManager
} from './WatchlistManager.js'

const {AcyTabPane } = AcyTabs;
const watchlistManagerPool = new WatchlistManager("pool")

function MarketPoolList(props){
    const [poolDisplayNumber, setPoolDisplayNumber] = useState(10)
    const [watchlistPool, setWatchlistPool] = useState([])
    const [poolSortAscending, setPoolSortAscending] = useState(true)
    const [watchlistSortAscending, setWatchlistSortAscending] = useState(true)

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
            <h2>Watchlist</h2>
            <Table 
              dataSource={sortTable(watchlistPool, "tvl", watchlistSortAscending)} 
              columns={columnsPool(watchlistSortAscending, () => {setWatchlistSortAscending(!watchlistSortAscending)}).filter(item => item.visible == true)} 
              pagination={false}
              style={{
              marginBottom: "20px"
              }}
              footer={() => (
              <div className={styles.tableSeeMoreWrapper}>
                  <a className={styles.tableSeeMore} onClick={() => {setTokenDisplayNumber(tokenDisplayNumber +  5)}}>See More...</a>
              </div>
              )} 
            />
            <h2>All Pools</h2>
            <Table 
                dataSource={sortTable(dataSourcePool, "tvl", poolSortAscending).slice(0, poolDisplayNumber + 1)} 
                columns={columnsPool(poolSortAscending, () => {setPoolSortAscending(!poolSortAscending)}).filter(item => item.visible == true)} 
                pagination={false}
                style={{
                marginBottom: "20px"
                }}
                footer={() => (
                <div className={styles.tableSeeMoreWrapper}>
                    <a className={styles.tableSeeMore} onClick={() => {setPoolDisplayNumber(poolDisplayNumber +  5)}}>See More...</a>
                </div>
                )} 
            />
            <div style={{height:"40px"}}></div>
        </div>
    )
}

export default MarketPoolList;