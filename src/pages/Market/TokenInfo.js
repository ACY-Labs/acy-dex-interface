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

const {AcyTabPane } = AcyTabs;
let sampleToken = dataSourceCoin[0]


function MarketTokenInfo(props){
    const [tokenData, setTokenData] = useState(sampleToken)
    const [transactionView, setTransactionView ] = useState(TransactionType.ALL) 
    const [graphTabIndex, setGraphTabIndex] = useState(0)

    const filterTransaction = (table, category) => {
        if (category == TransactionType.ALL)
          return table
        else
          return table.filter(item => item.type == category)
    }

    // event handler callbacks
    const onClickTransaction = useCallback((e) => {
        let destFilter = e.target.id
        setTransactionView(destFilter)
      }
    );

    function switchChart(dest) {
        setGraphTabIndex(dest)
    }

    return (
        <div className={styles.marketRoot}>
            <MarketSearchBar dataSourceCoin={dataSourceCoin} dataSourcePool={dataSourcePool}/>
            <div>
                <div className={styles.rightButton}></div>
            </div>
            <div style={{display:"flex", justifyContent: "space-between", alignItems:"center", flexWrap:"wrap"}}>
                <div className={styles.contentInfo}>
                    <div style={{display:"flex", alignItems:"center"}}>
                        <AcyIcon name={tokenData.short.toLowerCase()} width={36} height={36}/>
                        <span style={{fontSize:"26px", fontWeight: "bold"}}>{tokenData.name}</span>
                        <span style={{fontSize:"26px", fontWeight: "thin", marginLeft:"10px"}}>({tokenData.short})</span>
                    </div>
                    <div>
                        <span style={{fontSize:"30px", fontWeight: "bold"}}> 
                            $ {abbrNumber(tokenData.price)} 
                        </span>
                        <span  style={{fontSize:"20px", fontWeight: "thin", marginLeft: "16px"}} className={tokenData.priceChange <  0 ? styles.priceChangeDown : styles.priceChangeUp}>
                            {(tokenData.priceChange).toFixed(2)} %
                        </span>
                    </div>
                </div>
                <div className={styles.contentCta}>
                    <div className={styles.ctaButton}>
                        <AcySmallButton 
                                color="#eb5c20"
                                textColor="white" 
                                borderColor="#eb5c20"
                                borderRadius="15px"
                                padding="5px"
                            >
                               Add Liquidity
                        </AcySmallButton>
                    </div>
                    <div className={styles.ctaButton}>
                            <AcySmallButton 
                                color="#eb5c20"
                                textColor="white" 
                                borderColor="#eb5c20"
                                borderRadius="15px"
                                padding="5px"
                            >
                               Trade
                        </AcySmallButton>
                    </div>
                </div>
            </div>
            <div style={{display:"flex", flexWrap:"wrap", "justifyContent": "space-between"}}>
                <div className={styles.contentStats}>
                    <div className={styles.statEntry}>
                        <div className={styles.statEntryName}>TVL</div>
                        <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.tvl)}</div>
                        <div className={styles.statEntryChange}>5.12%</div>
                    </div>
                    <div className={styles.statEntry}>
                        <div className={styles.statEntryName}>24h Trading Vol</div>
                        <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.volume24h)}</div>
                        <div className={styles.statEntryChange}>5.12%</div>
                    </div>
                    <div className={styles.statEntry}>
                        <div className={styles.statEntryName}>7d Trading Vol</div>
                        <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.volume24h)}</div>
                        <div className={styles.statEntryChange}>5.12%</div>
                    </div>
                    <div className={styles.statEntry}>
                        <div className={styles.statEntryName}>24h Fees</div>
                        <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.volume24h)}</div>
                        <div className={styles.statEntryChange}>5.12%</div>
                    </div>
                </div>
                <div className={styles.contentCharts}>
                    <div className={styles.contentChartsHeader}>
                        <div className={styles.contentChartsIndicator}>
                            <div className={styles.chartIndicatorValue}>$999.99m</div>
                            <div className={styles.chartIndicatorTime}>2020-11-20</div>
                        </div>
                        <div className={styles.contentChartsSelector}>
                            <AcySmallButton 
                                color={graphTabIndex == 0 ? "#eb5c20" : "transparent"} 
                                textColor="white" 
                                borderColor="#eb5c20"
                                borderRadius="15px 0 0 15px"
                                padding="5px"
                                onClick={() => switchChart(0)}
                                id="0"
                            >
                                Volume
                            </AcySmallButton>
                            <AcySmallButton 
                                color={graphTabIndex == 1 ? "#eb5c20" : "transparent"}  
                                textColor="white" 
                                borderColor="#eb5c20"
                                borderRadius="0 0 0 0"
                                padding="5px"
                                onClick={() => switchChart(1)}
                                id="1"
                            >
                                TVL
                            </AcySmallButton>
                            <AcySmallButton 
                                color={graphTabIndex == 2 ? "#eb5c20" : "transparent"} 
                                textColor="white" 
                                borderColor="#eb5c20"
                                borderRadius="0 15px 15px 0"
                                padding="5px"
                                onClick={() => switchChart(2)}
                                id="2"
                            >
                                Price
                            </AcySmallButton>
                        </div>
                    </div>
                    <div className={styles.contentChartsBody}>
                            {
                                graphTabIndex == 0 && 
                                <div className={styles.contentChartWrapper}>
                                    <AcyBarChart backData={graphSampleData}/>
                                </div>
                            }
                            {graphTabIndex == 1 && 
                                <div className={styles.contentChartWrapper}>
                                    <AcyLineChart backData={graphSampleData}/>
                                </div>}
                            {graphTabIndex == 2 && 
                                <div className={styles.contentChartWrapper}>
                                    <AcyBarChart backData={graphSampleData}/>
                                </div>
                            }
                        </div>
                </div>
            </div>
        
            <h2>Pools</h2>
            <Table dataSource={dataSourcePool} columns={columnsPool} footer={() => (<></>)}/>

            <h2>Transactions</h2>
            <Table dataSource={filterTransaction(dataSourceTransaction, transactionView)} columns={transactionHeader(transactionView, onClickTransaction)} footer={() => (<></>)}/>
        </div>
    )
}

export default MarketTokenInfo;