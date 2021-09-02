import React, { Component, useState, useCallback } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table,  Row, Col,Input, Divider} from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { useDetectClickOutside } from 'react-detect-click-outside';
import {
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
  } from '@/components/Acy';

import {
  TransactionType,
  abbrHash,
  abbrNumber,
  columnsCoin, 
  columnsPool,
  transactionHeader
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



function MarketTokenInfo(){

    const [transactionView, setTransactionView ] = useState(TransactionType.ALL) 

    const filterTransaction = (table, category) => {
        if (category == TransactionType.ALL)
          return table
        else
          return table.filter(item => item.type == category)
    }

    const onClickTransaction = useCallback((e) => {
        let destFilter = e.target.id
        setTransactionView(destFilter)
      }
    )

    return (
        <div className={styles.marketRoot}>
            <div>
                <div className={styles.rightButton}></div>
            </div>
            <div style={{display:"flex", justifyContent: "space-between"}}>
                <div className={styles.contentInfo} style={{background: "red"}}> hello</div>
                <div className={styles.contentCta} style={{background: "blue"}}> hello</div>
            </div>
            <div style={{display:"flex", justifyContent: "space-between"}}>
                <div className={styles.contentStats} style={{background:"green"}}> hello</div>
                <div className={styles.contentCharts} style={{background: "purple"}}> hello</div>
            </div>
        
            <h2>Pools</h2>
            <Table dataSource={dataSourcePool} columns={columnsPool} footer={() => (<></>)}/>

            <h2>Transactions</h2>
            <Table dataSource={filterTransaction(dataSourceTransaction, transactionView)} columns={transactionHeader(transactionView, onClickTransaction)} footer={() => (<></>)}/>
        </div>
    )
}

export default MarketTokenInfo;