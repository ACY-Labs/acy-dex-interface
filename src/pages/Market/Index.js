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


export class BasicProfile extends Component {
    state = {
        visible: true,
        tabIndex: 0,
        transactionView: TransactionType.ALL,
        tokenDisplayNumber: 10,
        poolDisplayNumber: 10,
        transactionDisplayNumber: 10
    }

    componentDidMount() {};

    onClickTransaction = (e) => {

      let destFilter = e.target.id
      
      this.setState({
        transactionView : e.target.id
      })
    };

    expandTokenTable =  () => {
      let tokenDisplayNumber = this.state.tokenDisplayNumber + 5
      this.setState({
        tokenDisplayNumber: tokenDisplayNumber
      })
    }

    expandTransactionTable =  () => {
      let transactionDisplayNumber = this.state.transactionDisplayNumber + 5
      this.setState({
        transactionDisplayNumber: transactionDisplayNumber
      })
    }

    expandPoolTable =  () => {
      let poolDisplayNumber = this.state.poolDisplayNumber + 5
      this.setState({
        poolDisplayNumber: poolDisplayNumber
      })
    }

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
                                  <AcyLineChart  backData={graphSampleData} showXAxis={true} showGradient={true} lineColor='#e29227' bgColor='#29292c'/>
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
                      <h2>Top Tokens</h2>
                      <h3>
                        <Link to='/market/list/token' >
                          Explore
                        </Link>
                      </h3>
                    </div>
                    <Table 
                      dataSource={sortTable(dataSourceCoin, "tvl", true).slice(0, this.state.tokenDisplayNumber + 1)} 
                      columns={columnsCoin} 
                      pagination={false}
                      style={{
                        marginBottom: "20px"
                      }}
                      footer={() => (
                        <div className={styles.tableSeeMoreWrapper}>
                          <a className={styles.tableSeeMore} onClick={this.expandTokenTable}>See More...</a>
                        </div>
                      )} 
                    />

                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                      <h2>Top Pools</h2>
                      <h3>
                        <Link to='/market/list/pool' >
                          Explore
                        </Link>
                      </h3>
                    </div>

                    <Table 
                      dataSource={sortTable(dataSourcePool, "tvl", true).slice(0, this.state.poolDisplayNumber + 1)} 
                      columns={columnsPool} 
                      pagination={false}
                      style={{
                        marginBottom: "20px"
                      }}
                      footer={() => (
                        <div className={styles.tableSeeMoreWrapper}>
                          <a className={styles.tableSeeMore} onClick={this.expandPoolTable}>See More...</a>
                        </div>
                      )} 
                    />
                  
                    <h2>Transactions</h2>
                    <Table 
                      dataSource={sortTable(this.filterTransaction(dataSourceTransaction, transactionView), "time", true).slice(0, this.state.transactionDisplayNumber + 1)} 
                      columns={transactionHeader(transactionView, this.onClickTransaction)} 
                      pagination={false}
                      style={{
                        marginBottom: "20px"
                      }}
                      footer={() => (
                        <div className={styles.tableSeeMoreWrapper}>
                          <a className={styles.tableSeeMore} onClick={this.expandTransactionTable}>See More...</a>
                        </div>
                      )} 
                    />
                
                </div>
            </PageHeaderWrapper>
        )
    };
}

export default BasicProfile;
