import React, { Component, useState, useCallback } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table,  Row, Col,Input, Divider} from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { useDetectClickOutside } from 'react-detect-click-outside';
import {Link} from 'react-router-dom'
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


export class BasicProfile extends Component {
    state = {
        visible: true,
        tabIndex: 0,
        transactionView: TransactionType.ALL
    }

    componentDidMount() {};

    onClickTransaction = (e) => {

      let destFilter = e.target.id
      
      this.setState({
        transactionView : e.target.id
      })
    };

    filterTransaction(table, category){
      if (category == TransactionType.ALL)
        return table
      else
        return table.filter(item => item.type == category)
    };

    render() {
        // const outsideClickRef = useDetectClickOutside({ onTriggered: this.onSearchBlur });
        const { visible, visibleSearchBar, tabIndex, transactionView} = this.state;
        return (
            <PageHeaderWrapper>
                <div className={styles.marketRoot}>
                    <MarketSearchBar dataSourceCoin={dataSourceCoin} dataSourcePool={dataSourcePool}/>
                    <div className={styles.chartsMain}>
                        <div className={styles.chartSectionMain}>
                              <div className={styles.graphStats}>
                                  <div className={styles.statName}>TVL</div>
                                  <div className={styles.statValue}>$2.19b</div>
                              </div>
                              <div className={styles.chartWrapper}>
                                  <AcyLineChart backData={graphSampleData} showGradient={true} lineColor='#e29227' bgColor='#29292c'/>
                              </div>
                              
                        </div>
                        <div className={styles.chartSectionMain}>
                                <div className={styles.graphStats}>
                                    <div className={styles.statName}>VOLUME 24H</div>
                                    <div className={styles.statValue}>$2.19b</div>
                                </div>
                                <div className={styles.chartWrapper}>
                                    <AcyBarChart backData={graphSampleData}/>
                                </div>
                                
                        </div> 
                    </div>
                    <Row className={styles.marketOverview} justify="space-around">
                        <Col span={8} >Volume 24H   <strong>$882.20m</strong> <span className={styles.priceChangeUp}>0.36%</span></Col>
                        <Col span={8} >Fees 24H <strong>$1.66m </strong>    <span className={styles.priceChangeUp}>0.36%</span></Col>
                        <Col span={8} >TVL  <strong>$2.90b</strong>  <span className={styles.priceChangeDown}>-0.36%</span></Col>
                    </Row>

                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                      <h2>Top Pools</h2>
                      <h3>
                        <Link to='/market/list/token' >
                          Explore
                        </Link>
                      </h3>
                    </div>
                    <Table dataSource={dataSourceCoin} columns={columnsCoin} footer={() => (<></>)}/>

                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                      <h2>Top Pools</h2>
                      <h3>
                        <Link to='/market/list/pool' >
                          Explore
                        </Link>
                      </h3>
                    </div>

                    <Table dataSource={dataSourcePool} columns={columnsPool} footer={() => (<></>)}/>

                    <h2>Transactions</h2>
                    <Table dataSource={this.filterTransaction(dataSourceTransaction, transactionView)} columns={transactionHeader(transactionView, this.onClickTransaction)} footer={() => (<></>)}/>
                </div>
            </PageHeaderWrapper>
        )
    };
}

export default BasicProfile;
