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
  sortTable,
  sortTableTime
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
    constructor(props){
      super(props)
      this.rootElemRef = React.createRef();
    }

    state = {
        visible: true,
        visibleNavbar: true,
        tabIndex: 0,
        transactionView: TransactionType.ALL,
        tokenDisplayNumber: 10,
        poolDisplayNumber: 10,
        transactionDisplayNumber: 10,
        tokenSortAscending: false, 
        poolSortAscending: false,
        transactionSortAscending: true
    }

    componentDidMount() {
      window.addEventListener("scroll", () => {
        console.log(window)
      })
    };

    componentWillUnmount() {
      window.removeEventListener("scroll", () => {
        console.log(window)
      })
    }

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
            <div className={styles.marketRoot}>
            <MarketSearchBar dataSourceCoin={dataSourceCoin} dataSourcePool={dataSourcePool} visible={true}/>
                <div className={styles.chartsMain}>
                    <div className={styles.chartSectionMain}>
                          <div className={styles.graphStats}>
                              <div className={styles.statName}>TVL</div>
                              <div className={styles.statValue}>$2.19b</div>
                          </div>
                          <div className={styles.chartWrapper}>
                              <AcyLineChart  backData={graphSampleData} showXAxis={true} showGradient={true} lineColor='#e29227' bgColor='#2f313583'/>
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
                    <Link style={{color:"#b5b5b6"}}  to='/market/list/token' >
                      Explore
                    </Link>
                  </h3>
                </div>
                <Table 
                  dataSource={sortTable(dataSourceCoin, "tvl", !this.state.tokenSortAscending).slice(0, this.state.tokenDisplayNumber + 1)} 
                  columns={columnsCoin(this.state.tokenSortAscending, () => {this.setState({tokenSortAscending : !this.state.tokenSortAscending})}).filter(item => item.visible == true)} 
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
                    <Link style={{color:"#b5b5b6"}}  to='/market/list/pool' >
                      Explore
                    </Link>
                  </h3>
                </div>

                <Table 
                  dataSource={sortTable(dataSourcePool, "tvl", !this.state.poolSortAscending).slice(0, this.state.poolDisplayNumber + 1)} 
                  columns={columnsPool(this.state.poolSortAscending, () => {this.setState({poolSortAscending : !this.state.poolSortAscending})}).filter(item => item.visible == true)} 
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
                  dataSource={sortTableTime(this.filterTransaction(dataSourceTransaction, transactionView), "time", this.state.transactionSortAscending).slice(0, this.state.transactionDisplayNumber + 1)} 
                  columns={transactionHeader(transactionView, this.onClickTransaction,this.state.transactionSortAscending, () => {this.setState({transactionSortAscending : !this.state.transactionSortAscending})}).filter(item => item.visible == true)} 
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
            <div style={{height:"20px"}}></div>
            </div>
        )
    };
}

export default BasicProfile;
