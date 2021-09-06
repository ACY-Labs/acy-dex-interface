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
    abbrNumber,
    isDesktop
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
          <Link style={{color:"#b5b5b6"}}  className={styles.coinName} to='/market/info/token' >{entry.short}</Link>
          <span className={styles.coinShort}> ({entry.name})</span>
        </div>
      )
    } else {
      content = (
        <div>
          <AcyIcon name={entry.coin1.toLowerCase()} width={20} height={20}/>
          <AcyIcon name={entry.coin2.toLowerCase()} width={20} height={20}/>
          <Link style={{color:"#b5b5b6"}}  className={styles.coinName} to='/market/info/pool' style={{color: "#b5b5b6"}}>
            <span className={styles.coinName}>{entry.coin1}/{entry.coin2}</span>
          </Link>
        </div>
      )  
    }


    
    return (
      <tr className={styles.smallTableRow}>
        <td className={styles.smallTableBody}>{content}</td>
        <td className={styles.smallTableBody} style={{display:(isDesktop() == true ? "table-cell" : "none")}}>{abbrNumber(entry.volume24h)}</td>
        <td className={styles.smallTableBody} style={{display:(isDesktop() == true ? "table-cell" : "none")}}>{abbrNumber(entry.tvl)}</td>
        <td className={styles.smallTableBody} style={{display:(isDesktop() == true ? "table-cell" : "none")}}>{abbrNumber(entry.price)}</td>
      </tr>
    )
  }

  render() {
    return (
      <table className={styles.smallTable}>
        <tbody>
          <tr className={styles.smallTableRow}>
            <td className={styles.smallTableHeader}>{this.state.mode == "token" ? "Token" : "Pool"}</td>
            <td className={styles.smallTableHeader} style={{display:(isDesktop() == true ? "table-cell" : "none")}}>Volume 24H</td>
            <td className={styles.smallTableHeader} style={{display:(isDesktop() == true ? "table-cell" : "none")}}>TVL</td>
            <td className={styles.smallTableHeader} style={{display:(isDesktop() == true ? "table-cell " : "none")}}>Price</td>
          </tr>


          {
            this.state.tableData.slice(0, this.state.displayNumber).map(item => this.renderBody(item))
          }

          <tr>
            <a className={styles.smallTableSeeMore} onClick={this.expandSmallTable}>See more...</a>
          </tr>
        </tbody>
      </table>      
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
      <div className={styles.marketNavbar}>
        <div className={styles.marketNavbarMenu}>
          <Link style={{color:"#b5b5b6", fontWeight: "bold"}} to='/market' >Overview</Link>
          <Link style={{color:"#b5b5b6", fontWeight: "bold"}} to='/market/list/pool' >Pools</Link>
          <Link style={{color:"#b5b5b6", fontWeight: "bold"}} to='/market/list/token' >Tokens</Link>
        </div>
        <div 
            className={styles.searchSection}           
        >
            {/* this is the gray background */}
            {visibleSearchBar && <div className={styles.searchBackground}/>}

            <div style={{display:"flex", alignItems:"center", flexDirection:"column", width:"100%"}}ref={outsideClickRef}>
              <div className={styles.searchWrapper}>
                <div className={styles.searchInnerWrapper}>
                  <Input 
                      placeholder="Search" 
                      size="large"
                      style={{
                          backgroundColor: "#373739",
                          borderRadius:'40px',
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
                        "right":0,
                        "top": "10px"}
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
      </div>

    )
}
