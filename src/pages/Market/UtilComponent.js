import React, { Component, useState, useCallback } from 'react'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table,  Row, Col,Input, Divider} from 'antd';
import styles from './styles.less';
import moment from 'moment'
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
    abbrNumber
} from './Util.js'

const {AcyTabPane } = AcyTabs;

export class SmallTable extends React.Component {
  state={
    mode: this.props.mode,
    tableData: this.props.data,
    displayNumber: this.props.displayNumber
  }

  expandSmallTable = () => {
    this.setState({
      displayNumber : this.state.displayNumber + 2
    })
  }

  renderBody = (entry) => {

    let content = (<></>)

    if(this.props.data.length == 0){
      return  
    }

    if (this.state.mode == "token"){
      content = (
        <div>
          <AcyIcon name={entry.short.toLowerCase()} width={20} height={20}/>
          <Link className={styles.coinName} to='/market/info/token' >{entry.name}</Link>
          <span className={styles.coinShort}> / {entry.short}</span>
        </div>
      )
    } else {
      content = (
        <div>
          <AcyIcon name={entry.coin1.toLowerCase()} width={20} height={20}/>
          <AcyIcon name={entry.coin2.toLowerCase()} width={20} height={20}/>
          <Link className={styles.coinName} to='/market/info/pool' >
            <span className={styles.coinName}>{entry.coin1}/{entry.coin2}</span>
          </Link>
        </div>
      )  
    }


    
    return (
      <div className={styles.smallTableRow}>
        <div className={styles.smallTableBody}>{content}</div>
        <div className={styles.smallTableBody}>{abbrNumber(entry.volume24h)}</div>
        <div className={styles.smallTableBody}>{abbrNumber(entry.tvl)}</div>
        <div className={styles.smallTableBody}>{abbrNumber(entry.price)}</div>
      </div>
    )
  }

  render() {
    return (
      <div className={styles.smallTable}>
        <div className={styles.smallTableRow}>
          <div className={styles.smallTableHeader}>{this.state.mode == "token" ? "Token" : "Pool"}</div>
          <div className={styles.smallTableHeader}>Volume 24H</div>
          <div className={styles.smallTableHeader}>TVL</div>
          <div className={styles.smallTableHeader}>Price</div>
        </div>


        {
          this.state.tableData.slice(0, this.state.displayNumber).map(item => this.renderBody(item))
        }

        <a className={styles.smallTableSeeMore} onClick={this.expandSmallTable}>See more...</a>
      </div>      
    );
  }
}

// react functional component
export const MarketSearchBar  = (props) => {
    // states
    const [visibleSearchBar, setVisibleSearchBar] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchCoinReturns, setSearchCoinReturns] = useState([...props.dataSourceCoin])
    const [searchPoolReturns, setSearchPoolReturns] = useState([...props.dataSourcePool])
    const [displayNumber, setDisplayNumber] = useState(3)

    // some helper functions
    const matchQueryCoin = (data, query) => {
      let lowercase = query.toLowerCase()
      let newData = data.filter((item) => {
        if (lowercase.length == 0){
          return true;
        }
        return item.name.toLowerCase().includes(lowercase) || item.short.toLowerCase().includes(lowercase)
      })

      return newData
    }

    const matchQueryPool= (data, query) => {
      let lowercase = query.toLowerCase()
      let newData = data.filter((item) => {
        if (lowercase.length == 0){
          return true;
        }
        return item.coin1.toLowerCase().includes(lowercase) || item.coin2.toLowerCase().includes(lowercase)
      })

      return newData
    }

    // callback event handlers
    const onSearchFocus = useCallback(() => {
      setVisibleSearchBar(true)
    })

    const onInput = useCallback((e) => {
      setSearchQuery(e.target.value)
    })

    // refs
    const outsideClickRef = useDetectClickOutside({ onTriggered: () => { setVisibleSearchBar(false) } });

    // the DOM itself
    return (
      <div 
          className={styles.searchSection} 
          style={
            {
              marginBottom: "10px"
            }
          } 
          
      >
          {/* this is the gray background */}
          {visibleSearchBar && <div className={styles.searchBackground}/>}

          <div ref={outsideClickRef}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchInnerWrapper}>
                <Input 
                    placeholder="Search" 
                    size="large"
                    style={{
                        backgroundColor: "#373739",
                    }}
                    onFocus={onSearchFocus}
                    onChange={onInput}
                    className={styles.searchBar}
                    value={"" || searchQuery}
                />
              </div>            
            </div>
            {/* Search modal */}
            <div 
              style={
                {"width":"100%", 
                "position": "relative", 
                "marginTop": "10px",
                "zIndex": 10
              }}

              
            >
              {
                visibleSearchBar && (
                  <div  
                    className={styles.searchModal} 
                    style={
                      {"position": "absolute", 
                      "left": 0, 
                      "right":0}
                    }
                  >
                    <AcyTabs>
                      <AcyTabPane tab="Search" key="1">
                        {
                          searchCoinReturns.length > 0 ? <SmallTable mode="token" data={props.dataSourceCoin} displayNumber={displayNumber}/> 
                          : <div style={{fontSize:"20px", margin: "20px"}}>No results</div>
                        }
                        <Divider className={styles.searchModalDivider}/>
                        {
                          searchPoolReturns.length > 0 ? <SmallTable mode="pool" data={props.dataSourcePool} displayNumber={displayNumber}/>
                          : <div style={{fontSize:"20px", margin: "20px"}}>No results</div>
                        }
                      </AcyTabPane>
                      <AcyTabPane tab="Watchlist" key="2">
                        <SmallTable mode="token" data={props.dataSourceCoin} displayNumber={displayNumber}/>
                        <Divider className={styles.searchModalDivider}/>
                        <SmallTable mode="pool" data={props.dataSourcePool} displayNumber={displayNumber}/>
                      </AcyTabPane>
                    </AcyTabs>
                    
                  </div>
                )
              }
              
            </div>
          </div>
          
          
      </div>
    )
}
