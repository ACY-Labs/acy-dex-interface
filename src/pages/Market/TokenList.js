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

const {AcyTabPane } = AcyTabs;
let sampleToken = dataSourceCoin[0]


function MarketTokenList(props){
  const [tokenDisplayNumber, setTokenDisplayNumber] = useState(10)

  return (
    <div>
      <MarketSearchBar dataSourceCoin={dataSourceCoin} dataSourcePool={dataSourcePool}/>
      <div className={styles.marketRoot}>
          
          <h2>All Tokens</h2>
          <Table 
              dataSource={sortTable(dataSourceCoin, "tvl", true).slice(0, tokenDisplayNumber + 1)} 
              columns={columnsCoin.filter(item => item.visible == true)} 
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
          <div style={{height:"40px"}}></div>
      </div>
      
    </div>
      
  )
}

export default MarketTokenList;