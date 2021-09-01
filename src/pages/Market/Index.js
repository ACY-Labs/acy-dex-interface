import React, { Component } from 'react'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table,  Row, Col} from 'antd';
import styles from './styles.less';
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
        volume7d:667220000
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000
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
        render:(text, record) => {
            return (
                <div className={styles.firstColumn}>
                    <AcyIcon name={record.short.toLowerCase()} width={20} height={20}/>
                    <span className={styles.coinName}>{record.name}</span>
                    <span className={styles.coinShort}> / {record.short}</span>
                </div>
            )
        }
    },
    {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render:(text, record) => {
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
                <span className={priceChange <  0 ? styles.priceChangeDown : styles.priceChangeUp}>{priceChange}</span>
            ) 
        }
    },
    {
        title: 'Volume 24H',
        dataIndex: 'volume24h',
        key: 'volume24h',
        render:(text, record) => {
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
        render:(text, record) => {
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
        render:(text, record) => {
            return (
                <div className={styles.tableData}>
                    <AcyIcon name={record.coin1.toLowerCase()} width={20} height={20}/>
                    <AcyIcon name={record.coin2.toLowerCase()} width={20} height={20}/>
                    <span className={styles.coinName}>{record.coin1}/{record.coin2}</span>
                </div>
            )
        }
    },
    {
        title: 'TVL',
        dataIndex: 'tvl',
        key: 'tvl',
        render:(text, record) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(record.tvl)}
                </div>
            )
        }
    },
    {
        title: 'Volume 24H',
        dataIndex: 'volume24h',
        key: 'volume24h',
        render:(text, record) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(record.volume24h)}
                </div>
            )
        }
    },
    {
        title: 'Volume 7D',
        dataIndex: 'volume7d',
        key: 'volume7d',
        render:(text, record) => {
            return (
                <div className={styles.tableData}>
                    $ {abbrNumber(record.volume7d)}
                </div>
            )
        }
    },
]

export class BasicProfile extends Component {
    state = {
        visible: true,
        visibleConfirmOrder: false,
        visibleLoading: false,
        tabIndex: 0,
      };
    componentDidMount() {}

    renderCoinTableEntry = (record) => {
        return (
            <Row className={styles.marketBody} justify="space-between">
                <Col span={5} className={styles.nameColumn}>
                    <AcyIcon name={record.short.toLowerCase()} width={20} height={20}/>
                    <span className={styles.coinName}>{record.name}</span>
                    <span className={styles.coinShort}> / {record.short}</span>
                </Col>
                <Col span={5} className={styles.priceColumn}>$ {abbrNumber(record.price)}</Col>
                <Col span={4} className={styles.priceChangeColumn}>
                    <span className={record.priceChange <  0 ? styles.priceChangeDown : styles.priceChangeUp}>{record.priceChange.toFixed(2)}</span>
                </Col>
                <Col span={5} className={styles.volColumn}>$ {abbrNumber(record.volume24h)}</Col>
                <Col span={5} className={styles.tvlColumn}>$ {abbrNumber(record.tvl)}</Col>
            </Row>
        )
    }

    renderPoolTableEntry = (record) => {
        return (
            <Row className={styles.marketBody} justify="space-between">
                <Col span={6} className={styles.nameColumn}>
                    <AcyIcon name={record.coin1.toLowerCase()} width={20} height={20}/>
                    <AcyIcon name={record.coin2.toLowerCase()} width={20} height={20}/>
                    <span className={styles.coinName}>{record.coin1}/{record.coin2}</span>
                </Col>
                <Col span={6} className={styles.tvlColumn}>$ {abbrNumber(record.tvl)}</Col>
                <Col span={6} className={styles.volColumn}>$ {abbrNumber(record.volume24h)}</Col>
                <Col span={6} className={styles.priceColumn}>$ {abbrNumber(record.volume7d)}</Col>
            </Row>
        )
    }

    render() {
        const { visible, visibleConfirmOrder, visibleLoading, tabIndex,maxLine } = this.state;
        return (
            <PageHeaderWrapper>
                <div className={styles.marketRoot}>
                    <Row>
                        <Col span={12}>
                            <div className={styles.chartSection}>
                                <div className={styles.graphStats}>
                                    <div className={styles.statName}>TVL</div>
                                    <div className={styles.statValue}>$2.19b</div>
                                </div>
                                <div className={styles.chartWrapper}>
                                    <AcyLineChart backData={data}/>
                                </div>
                                
                            </div>
                        </Col>
                        <Col span={12} >
                            <div className={styles.chartSection}>
                                <div className={styles.graphStats}>
                                    <div className={styles.statName}>VOLUME 24H</div>
                                    <div className={styles.statValue}>$2.19b</div>
                                </div>
                                <div className={styles.chartWrapper}>
                                    <AcyBarChart backData={data}/>
                                </div>
                                
                            </div>    
                        </Col>
                    </Row>
                    <Row className={styles.marketOverview} justify="space-around">
                        <Col span={8} >Volume 24H   <strong>$882.20m</strong> <span className={styles.priceChangeUp}>0.36%</span></Col>
                        <Col span={8} >Fees 24H <strong>$1.66m </strong>    <span className={styles.priceChangeUp}>0.36%</span></Col>
                        <Col span={8} >TVL  <strong>$2.90b</strong>  <span className={styles.priceChangeDown}>-0.36%</span></Col>
                    </Row>

                    <h3>Top Coins</h3>
                    <Table dataSource={dataSource} columns={columnsCoin} footer={() => (<></>)}/>

                    <h3>Top Pools</h3>
                    <Table dataSource={dataSourcePool} columns={columnsPool} footer={() => (<></>)}/>
                </div>
            </PageHeaderWrapper>
        )
    }
}

export default BasicProfile
