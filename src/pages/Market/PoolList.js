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

function MarketPoolList(props){
    const [poolDisplayNumber, setPoolDisplayNumber] = useState(10)

    return (
        <div className={styles.marketRoot}>
            <MarketSearchBar dataSourceCoin={dataSourceCoin} dataSourcePool={dataSourcePool}/>
            <h2>All Pools</h2>
            <Table 
                dataSource={sortTable(dataSourcePool, "tvl", true).slice(0, poolDisplayNumber + 1)} 
                columns={columnsPool.filter(item => item.visible == true)} 
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
        </div>
    )
}

export default MarketPoolList;