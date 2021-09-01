import React, { Component, useState, useCallback } from 'react'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table,  Row, Col,Input, Divider} from 'antd';
import styles from './styles.less';
import moment from 'moment'
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

import { useDetectClickOutside } from 'react-detect-click-outside';

const {AcyTabPane } = AcyTabs;

const TransactionType = {
    ALL: "All",
    SWAP: "Swap",
    ADD: "Add",
    REMOVE: "Remove"
}

function abbrHash(hash){
  let len = hash.length
  let first = hash.slice(0, 6)
  let last = hash.slice(len - 4, len - 1)

  return first + "..." + last
}

function abbrNumber(number){
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

const dataSource = [
    {
      "name": "Ether",
      "short": "ETH",
      "price": 3170,
      "priceChange": -0.79,
      "volume24h": 804110000,
      "tvl": 899640000
    },
    {
      "name": "USD Coin",
      "short": "USDC",
      "price": 1,
      "priceChange": 0,
      "volume24h": 741750000,
      "tvl": 547500000
    },
    {
      "name": "Wrapped BTC",
      "short": "WBTC",
      "price": 47960,
      "priceChange": -0.88,
      "volume24h": 47960000,
      "tvl": 220550000
    },
    {
      "name": "Tether USD",
      "short": "USDT",
      "price": 1,
      "priceChange": 0,
      "volume24h": 210430000,
      "tvl": 217030000
    },
    {
      "name": "Ether",
      "short": "ETH",
      "price": 3170,
      "priceChange": -0.79,
      "volume24h": 804110000,
      "tvl": 899640000
    },
    {
      "name": "USD Coin",
      "short": "USDC",
      "price": 1,
      "priceChange": 0,
      "volume24h": 741750000,
      "tvl": 547500000
    },
    {
      "name": "Wrapped BTC",
      "short": "WBTC",
      "price": 47960,
      "priceChange": -0.88,
      "volume24h": 47960000,
      "tvl": 220550000
    },
    {
      "name": "Tether USD",
      "short": "USDT",
      "price": 1,
      "priceChange": 0,
      "volume24h": 210430000,
      "tvl": 217030000
    },
    {
      "name": "Ether",
      "short": "ETH",
      "price": 3170,
      "priceChange": -0.79,
      "volume24h": 804110000,
      "tvl": 899640000
    },
    {
      "name": "USD Coin",
      "short": "USDC",
      "price": 1,
      "priceChange": 0,
      "volume24h": 741750000,
      "tvl": 547500000
    },
    {
      "name": "Wrapped BTC",
      "short": "WBTC",
      "price": 47960,
      "priceChange": -0.88,
      "volume24h": 47960000,
      "tvl": 220550000
    },
    {
      "name": "Tether USD",
      "short": "USDT",
      "price": 1,
      "priceChange": 0,
      "volume24h": 210430000,
      "tvl": 217030000
    },
    {
      "name": "Ether",
      "short": "ETH",
      "price": 3170,
      "priceChange": -0.79,
      "volume24h": 804110000,
      "tvl": 899640000
    },
    {
      "name": "USD Coin",
      "short": "USDC",
      "price": 1,
      "priceChange": 0,
      "volume24h": 741750000,
      "tvl": 547500000
    },
    {
      "name": "Wrapped BTC",
      "short": "WBTC",
      "price": 47960,
      "priceChange": -0.88,
      "volume24h": 47960000,
      "tvl": 220550000
    },
    {
      "name": "Tether USD",
      "short": "USDT",
      "price": 1,
      "priceChange": 0,
      "volume24h": 210430000,
      "tvl": 217030000
    },
    {
      "name": "Ether",
      "short": "ETH",
      "price": 3170,
      "priceChange": -0.79,
      "volume24h": 804110000,
      "tvl": 899640000
    },
    {
      "name": "USD Coin",
      "short": "USDC",
      "price": 1,
      "priceChange": 0,
      "volume24h": 741750000,
      "tvl": 547500000
    },
    {
      "name": "Wrapped BTC",
      "short": "WBTC",
      "price": 47960,
      "priceChange": -0.88,
      "volume24h": 47960000,
      "tvl": 220550000
    },
    {
      "name": "Tether USD",
      "short": "USDT",
      "price": 1,
      "priceChange": 0,
      "volume24h": 210430000,
      "tvl": 217030000
    }
  ]

const dataSourcePool = [
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000,
        price: 3570
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000,
        price: 23523
    },
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000,
        price: 3523
    },
    {
      coin1:"USDC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 3570
  },
  {
      coin1:"WBTC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 23523
  },
  {
      coin1:"USDC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 3523
  },
  {
    coin1:"USDC",
    coin2:"ETH",
    tvl: 370900000,
    volume24h: 68680000,
    volume7d:667220000,
    price: 3570
  },
  {
      coin1:"WBTC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 23523
  },
  {
      coin1:"USDC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 3523
  },
]

const dataSourceTransaction = [
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 47161258.74,
      "coin1Amount": 85.87749323,
      "coin2Amount": 54.80565495,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.ADD,
      "totalValue": 4474529.957,
      "coin1Amount": 49.6015762,
      "coin2Amount": 43.15266777,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.REMOVE,
      "totalValue": 16327816.91,
      "coin1Amount": 84.65384009,
      "coin2Amount": 93.41124956,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.SWAP,
      "totalValue": 87309303.84,
      "coin1Amount": 14.83691711,
      "coin2Amount": 39.48470716,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.ADD,
      "totalValue": 99005732.19,
      "coin1Amount": 29.01098914,
      "coin2Amount": 87.67634172,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.REMOVE,
      "totalValue": 7473159.335,
      "coin1Amount": 55.39709945,
      "coin2Amount": 81.03417077,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 5613827.965,
      "coin1Amount": 70.82938395,
      "coin2Amount": 62.49065479,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.ADD,
      "totalValue": 15457824.56,
      "coin1Amount": 53.76396751,
      "coin2Amount": 97.18653896,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.REMOVE,
      "totalValue": 76920106.68,
      "coin1Amount": 99.747006,
      "coin2Amount": 79.16787602,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.SWAP,
      "totalValue": 29714083.38,
      "coin1Amount": 14.14255762,
      "coin2Amount": 1.538641803,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.ADD,
      "totalValue": 27964831.48,
      "coin1Amount": 22.24316101,
      "coin2Amount": 1.411491578,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.REMOVE,
      "totalValue": 61016077.45,
      "coin1Amount": 54.64088962,
      "coin2Amount": 70.79323119,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 15447008.9,
      "coin1Amount": 85.32625649,
      "coin2Amount": 95.80244682,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.ADD,
      "totalValue": 51389385.09,
      "coin1Amount": 45.10863203,
      "coin2Amount": 14.45977451,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.REMOVE,
      "totalValue": 62947249.33,
      "coin1Amount": 32.81104431,
      "coin2Amount": 18.84867075,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.SWAP,
      "totalValue": 83789531.87,
      "coin1Amount": 55.22081984,
      "coin2Amount": 15.7711983,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.ADD,
      "totalValue": 88422526.24,
      "coin1Amount": 78.28128104,
      "coin2Amount": 88.20335576,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.REMOVE,
      "totalValue": 95835971.82,
      "coin1Amount": 9.532991159,
      "coin2Amount": 40.64787591,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 57385063.19,
      "coin1Amount": 63.52037022,
      "coin2Amount": 93.65125987,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    }
  ]

var data = [
    ['2000-06-05', 116],
    ['2000-06-06', 129],
    ['2000-06-07', 135],
    ['2000-06-08', 86],
    ['2000-06-09', 73],
    ['2000-06-10', 85],
    ['2000-06-11', 73],
    ['2000-06-12', 68],
    ['2000-06-13', 92],
    ['2000-06-14', 130],
    ['2000-06-15', 245],
    ['2000-06-16', 139],
    ['2000-06-17', 115],
    ['2000-06-18', 111],
    ['2000-06-19', 309],
    ['2000-06-20', 206],
    ['2000-06-21', 137],
    ['2000-06-22', 1000],
    ['2000-06-23', 85],
    ['2000-06-24', 94],
    ['2000-06-25', 71],
    ['2000-06-26', 106],
    ['2000-06-27', 84],
    ['2000-06-28', 93],
    ['2000-06-29', 85],
    ['2000-06-30', 73],
    ['2000-07-01', 83],
    ['2000-07-02', 125],
    ['2000-07-03', 107],
    ['2000-07-04', 82],
    ['2000-07-05', 44],
    ['2000-07-06', 72],
    ['2000-07-07', 106],
    ['2000-07-08', 107],
    ['2000-07-09', 66],
    ['2000-07-10', 91],
    ['2000-07-11', 92],
    ['2000-07-12', 113],
    ['2000-07-13', 107],
    ['2000-07-14', 131],
    ['2000-07-15', 111],
    ['2000-07-16', 64],
    ['2000-07-17', 69],
    ['2000-07-18', 88],
    ['2000-07-19', 77],
    ['2000-07-20', 83],
    ['2000-07-21', 111],
    ['2000-07-22', 57],
    ['2000-07-23', 55],
    ['2000-07-24', 60],
  ];
  

const columnsCoin = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render:(text, entry) => {
            return (
                <div className={styles.firstColumn}>
                    <AcyIcon name={entry.short.toLowerCase()} width={20} height={20}/>
                    <span className={styles.coinName}>{entry.name}</span>
                    <span className={styles.coinShort}> / {entry.short}</span>
                </div>
            )
        }
    },
    {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render:(text, entry) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(text)}
                </div>
            )
        }
    },
    {
        title: 'Price Change',
        dataIndex: 'priceChange',
        key: 'priceChange',
        render: (priceChange) => {
            return (
                <span className={priceChange <  0 ? styles.priceChangeDown : styles.priceChangeUp}>{priceChange.toFixed(2)}</span>
            ) 
        }
    },
    {
        title: 'Volume 24H',
        dataIndex: 'volume24h',
        key: 'volume24h',
        render:(text, entry) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(text)}
                </div>
            )
        }
    },
    {
        title: 'TVL',
        dataIndex: 'tvl',
        key: 'tvl',
        render:(text, entry) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(text)}
                </div>
            )
        }
    }
];

const columnsPool = [
    {
        title: 'Pool',
        dataIndex: 'pool',
        key: 'pool',
        render:(text, entry) => {
            return (
                <div className={styles.tableData}>
                    <AcyIcon name={entry.coin1.toLowerCase()} width={20} height={20}/>
                    <AcyIcon name={entry.coin2.toLowerCase()} width={20} height={20}/>
                    <span className={styles.coinName}>{entry.coin1}/{entry.coin2}</span>
                </div>
            )
        }
    },
    {
        title: 'TVL',
        dataIndex: 'tvl',
        key: 'tvl',
        render:(text, entry) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(entry.tvl)}
                </div>
            )
        }
    },
    {
        title: 'Volume 24H',
        dataIndex: 'volume24h',
        key: 'volume24h',
        render:(text, entry) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(entry.volume24h)}
                </div>
            )
        }
    },
    {
        title: 'Volume 7D',
        dataIndex: 'volume7d',
        key: 'volume7d',
        render:(text, entry) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(entry.volume7d)}
                </div>
            )
        }
    },
]

// header for the transaction table
function transactionHeader(selectedTransaction, onClickHandler){

  let styleArrangement = {
   "All" : "normal",
   "Swap" : "normal",
   "Add" : "normal",
   "Remove" : "normal",
  }

  styleArrangement[selectedTransaction] = "bold"

  return [
    {
      title: (<div className={styles.transactionHeader}>
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
              </div>),
      dataIndex: '',
      key: 'transactionName',
      render:(text, entry) => {
  
          return (
              <div className={styles.tableData}>
                  {entry.type} {entry.coin1} {
                    entry.type == TransactionType.SWAP ? "for" : "and"
                  } {entry.coin2}
              </div>
          )
      }
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render:(text, entry) => {
        return (
            <div className={styles.tableData}>
                $ {abbrNumber(entry.totalValue)}
            </div>
        )
      }
    },
    {
      title: 'Token Amount',
      dataIndex: 'coin1Amount',
      key: 'coin1Amount',
      render:(text, entry) => {
        return (
            <div className={styles.tableData}>
                {abbrNumber(entry.coin1Amount)} {entry.coin1}
            </div>
        )
      }
    },
    {
      title: 'Token Amount',
      dataIndex: 'coin2Amount',
      key: 'coin2Amount',
      render:(text, entry) => {
        return (
            <div className={styles.tableData}>
                {abbrNumber(entry.coin2Amount)} {entry.coin2}
            </div>
        )
      }
    },
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
      render:(text, entry) => {
        return (
            <div className={styles.tableData} style={{textOverflow:"ellipsis"}}>
                {abbrHash(text)}
            </div>
        )
      }
    },
    {
      title: 'Time',
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
      }
    },
  
  ]
}

class SmallTable extends React.Component {
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
          <span className={styles.coinName}>{entry.name}</span>
          <span className={styles.coinShort}> / {entry.short}</span>
        </div>
      )
    } else {
      content = (
        <div>
          <AcyIcon name={entry.coin1.toLowerCase()} width={20} height={20}/>
          <AcyIcon name={entry.coin2.toLowerCase()} width={20} height={20}/>
          <span className={styles.coinName}>{entry.coin1}/{entry.coin2}</span>
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
const MarketSearchBar  = () => {
    // states
    const [visibleSearchBar, setVisibleSearchBar] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchCoinReturns, setSearchCoinReturns] = useState([...dataSource])
    const [searchPoolReturns, setSearchPoolReturns] = useState([...dataSourcePool])
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
                      <AcyTabPane tab="Market" key="1">
                        {
                          searchCoinReturns.length > 0 ? <SmallTable mode="token" data={dataSource} displayNumber={displayNumber}/> 
                          : <div style={{fontSize:"20px", margin: "20px"}}>No results</div>
                        }
                        <Divider className={styles.searchModalDivider}/>
                        {
                          searchPoolReturns.length > 0 ? <SmallTable mode="pool" data={dataSourcePool} displayNumber={displayNumber}/>
                          : <div style={{fontSize:"20px", margin: "20px"}}>No results</div>
                        }
                      </AcyTabPane>
                      <AcyTabPane tab="Watchlist" key="2">
                        <SmallTable mode="token" data={dataSource} displayNumber={displayNumber}/>
                        <Divider className={styles.searchModalDivider}/>
                        <SmallTable mode="pool" data={dataSourcePool} displayNumber={displayNumber}/>
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

export class BasicProfile extends Component {
    state = {
        visible: true,
        tabIndex: 0,
        transactionView: TransactionType.ALL
    }
    componentDidMount() {}
    onClickTransaction = (e) => {
      let destFilter = e.target.id
      
      this.setState({
        transactionView : e.target.id
      })
    }

    filterTransaction(table, category){
      if (category == TransactionType.ALL)
        return table
      else
        return table.filter(item => item.type == category)
    }
    render() {
        // const outsideClickRef = useDetectClickOutside({ onTriggered: this.onSearchBlur });
        const { visible, visibleSearchBar, tabIndex, transactionView} = this.state;
        return (
            <PageHeaderWrapper>
                <div className={styles.marketRoot}>
                    <MarketSearchBar/>
                    <div className={styles.charts}>
                        <div className={styles.chartSection}>
                              <div className={styles.graphStats}>
                                  <div className={styles.statName}>TVL</div>
                                  <div className={styles.statValue}>$2.19b</div>
                              </div>
                              <div className={styles.chartWrapper}>
                                  <AcyLineChart backData={data}/>
                              </div>
                              
                        </div>
                        <div className={styles.chartSection}>
                                <div className={styles.graphStats}>
                                    <div className={styles.statName}>VOLUME 24H</div>
                                    <div className={styles.statValue}>$2.19b</div>
                                </div>
                                <div className={styles.chartWrapper}>
                                    <AcyBarChart backData={data}/>
                                </div>
                                
                        </div> 
                    </div>
                    <Row className={styles.marketOverview} justify="space-around">
                        <Col span={8} >Volume 24H   <strong>$882.20m</strong> <span className={styles.priceChangeUp}>0.36%</span></Col>
                        <Col span={8} >Fees 24H <strong>$1.66m </strong>    <span className={styles.priceChangeUp}>0.36%</span></Col>
                        <Col span={8} >TVL  <strong>$2.90b</strong>  <span className={styles.priceChangeDown}>-0.36%</span></Col>
                    </Row>

                    <h2>Top Coins</h2>
                    <Table dataSource={dataSource} columns={columnsCoin} footer={() => (<></>)}/>

                    <h2>Top Pools</h2>
                    <Table dataSource={dataSourcePool} columns={columnsPool} footer={() => (<></>)}/>

                    <h2>Transactions</h2>
                    <Table dataSource={this.filterTransaction(dataSourceTransaction, transactionView)} columns={transactionHeader(transactionView, this.onClickTransaction)} footer={() => (<></>)}/>
                </div>
            </PageHeaderWrapper>
        )
    }
}

export default BasicProfile
