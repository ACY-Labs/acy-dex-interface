import React, { Component, useState, useCallback } from 'react'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table,  Row, Col,Input, Divider, Icon} from 'antd';
import styles from './styles.less';
import moment from 'moment'
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


export const TransactionType = {
    ALL: "All",
    SWAP: "Swap",
    ADD: "Add",
    REMOVE: "Remove"
}

export function abbrHash(hash){
    let len = hash.length
    let first = hash.slice(0, 6)
    let last = hash.slice(len - 4, len - 1)
  
    return first + "..." + last
  }
  
export function abbrNumber(number){
      const THOUSAND = 0
      const MILLION = 1
  
      let currentDivision = -1
      let result = ""
      let tempNumber = number
  
      if (number >= 1000){
          tempNumber /= 1000
          currentDivision = 0
      }
          
      if (number>= 1000000){
          tempNumber /= 1000 
          currentDivision = 1
      }
  
      switch (currentDivision) {
          case 0:
              result = `${tempNumber.toFixed(2)}k`
              break;
          case 1:
              result = `${tempNumber.toFixed(2)}m`
              break;
          default:
              result = `${number.toFixed(2)}`
              break;
        }
          
      return result
      
  }

export function isDesktop(){
    const { innerWidth: width, innerHeight: height } = window;
    if (innerWidth < 768) return false
    return true
}


export function columnsCoin(isAscending, onSortChange){

    return [
        {
            title: <div className={styles.tableHeaderFirst}>Name</div>,
            dataIndex: 'name',
            key: 'name',
            render:(text, entry) => {
                return (
                    <div className={styles.tableDataFirstColumn}>
                        <AcyIcon name={entry.short.toLowerCase()} width={20} height={20}/>
                        <Link style={{color:"#b5b5b6"}}  className={styles.coinName} to='/market/info/token' >{entry.short}</Link>
                        <span className={styles.coinShort}> ({entry.name})</span>
                    </div>
                )
            },
            visible:true
        },
        {
            title: <div className={styles.tableHeader}>Price</div>,
            dataIndex: 'price',
            key: 'price',
            render:(text, entry) => {
                return (
                    <div className={styles.tableData}>
                        $ {abbrNumber(text)}
                    </div>
                )
            },
            visible: isDesktop()
        },
        {
            title: <div className={styles.tableHeader}>Price Change</div>,
            dataIndex: 'priceChange',
            key: 'priceChange',
            render: (priceChange) => {
                return (
                    <div className={styles.tableData}>
                        <span className={priceChange <  0 ? styles.priceChangeDown : styles.priceChangeUp}>{priceChange.toFixed(2)}</span>
                    </div>
                ) 
            },
            visible: isDesktop()
        },
        {
            title: <div className={styles.tableHeader}>Volume 24H</div>,
            dataIndex: 'volume24h',
            key: 'volume24h',
            render:(text, entry) => {
                return (
                    <div className={styles.tableData}>
                        $ {abbrNumber(text)}
                    </div>
                )
            },
            visible:true
        },
        {
            title: <div className={styles.tableHeader}  onClick={onSortChange}>
                TVL
                <Icon type={!isAscending ? "up" : "down"} style={{fontSize:'14px', marginLeft:'4px'}}/>
                </div>,
            dataIndex: 'tvl',
            key: 'tvl',
            render:(text, entry) => {
                return (
                    <div className={styles.tableData}>
                        $ {abbrNumber(text)}
                    </div>
                )
            },
            visible: isDesktop()
        }
    ]; 
}

export function columnsPool(isAscending, onSortChange) {
    return [
        {
            title: <div className={styles.tableHeaderFirst}>Pool</div>,
            dataIndex: 'pool',
            key: 'pool',
            render:(text, entry) => {
                return (
                    <div className={styles.tableDataFirstColumn}>
                        <AcyIcon name={entry.coin1.toLowerCase()} width={20} height={20}/>
                        <AcyIcon name={entry.coin2.toLowerCase()} width={20} height={20}/>
                        <Link style={{color:"#b5b5b6"}}  className={styles.coinName} to='/market/info/pool' >
                            <span className={styles.coinName}>{entry.coin1}/{entry.coin2}</span>
                        </Link>
                    </div>
                )
            },
            visible:true
        },
        {
            title: <div className={styles.tableHeader}  onClick={onSortChange}>
                TVL
                <Icon type={!isAscending ? "up" : "down"} style={{fontSize:'14px', marginLeft:'4px'}}/>
            </div>,
            dataIndex: 'tvl',
            key: 'tvl',
            render:(text, entry) => {
                return (
                    <div className={styles.tableData}>
                        $ {abbrNumber(entry.tvl)}
                    </div>
                )
            },
            visible: isDesktop()
        },
        {
            title: <div className={styles.tableHeader}>Volume 24H</div>,
            dataIndex: 'volume24h',
            key: 'volume24h',
            render:(text, entry) => {
                return (
                    <div className={styles.tableData}>
                        $ {abbrNumber(entry.volume24h)}
                    </div>
                )
            },
            visible:true
        },
        {
            title: <div className={styles.tableHeader}>Volume 7D</div>,
            dataIndex: 'volume7d',
            key: 'volume7d',
            render:(text, entry) => {
                return (
                    <div className={styles.tableData}>
                        $ {abbrNumber(entry.volume7d)}
                    </div>
                )
            },
            visible: isDesktop()
        },
    ]
}

// header for the transaction table
export function transactionHeader(selectedTransaction, onClickHandler, isAscending, onSortChange){

  let styleArrangement = {
   "All" : "normal",
   "Swap" : "normal",
   "Add" : "normal",
   "Remove" : "normal",
  }

  styleArrangement[selectedTransaction] = "bold"

  return [
    {
      title: (
        <div className={styles.tableHeaderFirst}>
            <div className={styles.transactionHeader}>
                <a 
                  className={styles.transactionType} 
                  style={{fontWeight: styleArrangement["All"]}}
                  onClick={onClickHandler}
                  id={TransactionType.ALL}
                >
                  All
                </a>
                <a
                  className={styles.transactionType} 
                  style={{fontWeight: styleArrangement["Swap"]}}
                  onClick={onClickHandler}
                  id={TransactionType.SWAP}
                >
                  Swap
                </a>
                <a 
                  className={styles.transactionType} 
                  style={{fontWeight: styleArrangement["Add"]}}
                  onClick={onClickHandler}
                  id={TransactionType.ADD}
                >
                  Add
                </a>
                <a 
                  className={styles.transactionType} 
                  style={{fontWeight: styleArrangement["Remove"]}}
                  onClick={onClickHandler}
                  id={TransactionType.REMOVE}
                >
                  Remove
                </a>
              </div>
        </div>
        ),
      dataIndex: '',
      key: 'transactionName',
      render:(text, entry) => {
  
          return (
              <div className={styles.tableDataFirstColumn}>
                  {entry.type} {entry.coin1} {
                    entry.type == TransactionType.SWAP ? "for" : "and"
                  } {entry.coin2}
              </div>
          )
      },
      visible:true
    },
    {
      title: <div className={styles.tableHeader}>Total Value</div>,
      dataIndex: 'totalValue',
      key: 'totalValue',
      render:(text, entry) => {
        return (
            <div className={styles.tableData}>
                $ {abbrNumber(entry.totalValue)}
            </div>
        )
      },
      visible: isDesktop()
    },
    {
      title: <div className={styles.tableHeader}>Token Amount</div>,
      dataIndex: 'coin1Amount',
      key: 'coin1Amount',
      render:(text, entry) => {
        return (
            <div className={styles.tableData}>
                {abbrNumber(entry.coin1Amount)} {entry.coin1}
            </div>
        )
      },
      visible: isDesktop()
    },
    {
      title: <div className={styles.tableHeader}>Token Amount</div>,
      dataIndex: 'coin2Amount',
      key: 'coin2Amount',
      render:(text, entry) => {
        return (
            <div className={styles.tableData}>
                {abbrNumber(entry.coin2Amount)} {entry.coin2}
            </div>
        )
      },
      visible: isDesktop()
    },
    {
      title: <div className={styles.tableHeader}>Account</div>,
      dataIndex: 'account',
      key: 'account',
      render:(text, entry) => {
        return (
            <div className={styles.tableData} style={{textOverflow:"ellipsis"}}>
                {abbrHash(text)}
            </div>
        )
      },
      visible: isDesktop()
    },
    {
      title: <div className={styles.tableHeader}  onClick={onSortChange}>
      Time
      <Icon type={!isAscending ? "up" : "down"} style={{fontSize:'14px', marginLeft:'4px'}}/>
  </div>,
      dataIndex: 'time',
      key: 'time',
      render:(text, entry) => {
  
        function getRelTime(timeString){
          let a = moment(new Date(timeString))  
          return a.fromNow()
        }
  
  
        return (
            
            <div className={styles.tableData} >
                {getRelTime(text)}
            </div>
        )
      },
      visible:true
    },
  
  ]
}

// sort the table
// Reverse means high to low
export function sortTable(table, key, isReverse){
    return table.sort((a, b) => {
        if (isReverse){
            return b[key] - a[key]
        }
        else{
            return a[key] - b[key]
        }
    })
}

export function sortTableTime(table, key, isReverse){
    return table.sort((a, b) => {
        if (isReverse){
            return new Date(b[key]).getTime() - new Date(a[key]).getTime()
        }
        else{
            return new Date(a[key]).getTime() - new Date(b[key]).getTime()
        }
    })
}