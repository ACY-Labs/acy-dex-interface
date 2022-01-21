/* eslint-disable react/jsx-indent */
import React, { useState, useEffect } from 'react';
import {Button, Menu, Dropdown, Icon, Progress, Tag, Table, Alert, Carousel} from 'antd';
import * as moment from "moment";
import Eth from "web3-eth";
import Utils from "web3-utils";
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import WETHABI from '@/abis/WETH.json';
import { getTransferData } from '@/acy-dex-swap/core/launchPad';
import WhitelistTask from "./WhitelistTask";
import AcyIcon from '@/assets/icon_acy.svg';
import hashtagIcon from '@/assets/icon_hashtag.png';
import telegramWIcon from '@/assets/icon_telegram_white.svg';
import ethIcon from '@/assets/ethereum-eth-logo.svg';
import polygonIcon from '@/assets/polygon-matic-logo.svg';
import confluxIcon from '@/assets/icon_conflux.png';
import styles from './styles.less';
import ERC20ABI from '@/abis/ERC20.json';
import SwapTicket from "./swapTicket";
import StepBar from './stepComponent';
import CountDown from "./countDown";
import LaunchChart from "./launchChart"
import { nFormatter } from './utils'

const Contract = require('web3-eth-contract');
// set provider for all later instances to use
// const eth = new Eth('https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
// Contract.setProvider('https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
const eth = new Eth('https://data-seed-prebsc-1-s1.binance.org:8545');
Contract.setProvider('https://data-seed-prebsc-1-s1.binance.org:8545');

function getTIMESTAMP(time) {
    var date = new Date(time);
    var year = date.getFullYear(time);
    var month = ("0" + (date.getMonth(time) + 1)).substr(-2);
    var day = ("0" + date.getDate(time)).substr(-2);
    var hour = ("0" + date.getHours(time)).substr(-2);
    var minutes = ("0" + date.getMinutes(time)).substr(-2);
    var seconds = ("0" + date.getSeconds(time)).substr(-2);
  
    // return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
    return `${year}-${month}-${day}`;

}

const formatTIMESTAMP = (timestamp) => {
    return moment(timestamp).format('YYYY-MM-DD hh:mm:ss');
}

const ACY_PRICE = 0.2  // acy per usdc

const LaunchpadComponent = () => {

    const recordNum = 10;
    const [chartData,setChartData] = useState([]);
    const [pendingEnd,setPending]= useState(false);
    const [fetchEnd,setFetchEnd] = useState(false);
    const [transferData,setTransferData] = useState([]);

    const ellipsisCenter = (str, preLength=6, endLength=4, skipStr='...') => {
        const totalLength = preLength + skipStr.length + endLength;
        if (str.length > totalLength) {
          return str.substr(0, preLength) + skipStr + str.substr(str.length-endLength, str.length);
        }
        return str;
    }
      
    useEffect(async () => {      
        const [newTransferData, newChartData] = await getTransferData();
        
        // ellipsis center address
        newTransferData.forEach(data => {
            data['participant'] = ellipsisCenter(data['participant']);
        })

        // console.log('NewTransferData', newTransferData);
        // console.log('NewChartData', newChartData);

        newChartData.splice(0, newChartData.length - recordNum);
        console.log(newChartData);
        setTransferData(newTransferData);
        setChartData(newChartData);
    }, [])

    const links = [
        "https://google.com",
        "https://youtube.com",
        "https://t.me/acyfinance",
        "https://twitter.com/acyfinance?lang=en",
        "https://medium.com/acy-finance",
        "https://github.com/ACY-Labs",
        "https://www.linkedin.com/company/acy-finance/"
    ];

    const tableColumns = [
        {
            title: 'Round',
            dataIndex: 'round',
            width: 80,
            align: 'center'
        },
        {
            title: 'Date',
            dataIndex: 'openDate',
            className: 'column-date',
            width: 100,
            align: 'center'
        },
        {
            title: 'Price',
            dataIndex: 'price',
            width: 70,
            align: 'center'
        },
        {
            title: 'Raise Size',
            dataIndex: 'raiseSize',
            width: 100,
            align: 'center'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            width: 85,
            align: 'center'
        },
        {
            title: 'Market Cap',
            dataIndex: 'marketCap',
            width: 100,
            align: 'center'
        },
        {
            title: 'Max Allocation',
            dataIndex: 'maxAllocations',
            width: 100,
            align: 'center'
        },
        {
            title: 'Max Winners',
            dataIndex: 'maxWinners',
            width: 100,
            align: 'center'
        },
        {
            title: 'Filled',
            dataIndex: 'filled',
            width: 100,
            align: 'center'
        },
        {
            title: 'Yield',
            dataIndex: 'yieldPer',
            width: 100,
            align: 'center'
        },
    ];
    const testData = [
        {
            dateTime:"2018-12-01",
            participant: "0x253584",
            quantity:'9999',
            token:'acy'
        }
    ]
    const transferTableHeader = [
        {
            title: 'Date Time(UTC)',
            dataIndex: 'dateTime',
            className: 'column-date',
            width: 80,
            align: 'left'
        },
        {
            title: 'Participants',
            dataIndex: 'participant',
            width: 80,
            align: 'center',
            ellipsis: true
        },
        {
            title: 'USDT',
            dataIndex: 'quantity',
            width: 60,
            align: 'center',
            ellipsis: true
        },
        {
            title: 'Ticket',
            dataIndex: 'Amount',
            width: 60,
            align: 'center',
            ellipsis: true
        },
    ];

    const tableData = [
        {
          round: "Round 1",
          openDate: "2021-10-30",
          closeDate: "2021-11-01",
          price: ACY_PRICE.toString() + ' USDT',
          raiseSize: "1000000 ACY",
          amount: 2500,
          marketCap:"$10M",
          maxAllocations:'100',
          maxWinners: "10000",
          filled: "1379%",
          yieldPer:"+223%",
          totalTickets: "82795 Tickets",
          perWinTicket: "100 USDT",
          get maxAllocation() {
              return this.quantity * ACY_PRICE;
          }
        },
        {
          round: "Round 2",
          openDate: "2021-10-13",
          closeDate: "2021-10-20",
          price: ACY_PRICE.toString() + ' USDT',
          raiseSize: "1000000 ACY",
          amount: 3000,
          marketCap:"$20M",
          maxAllocations:'200',
          maxWinners: "10000",
          filled: "1579%",
          yieldPer:"+203%",
          totalTickets: "82700 Tickets",
          perWinTicket: "110 USDT",
          get maxAllocation() {
            return this.quantity * ACY_PRICE;
        }
        },
        {
          round: "Round 3",
          openDate: "2021-10-28",
          closeDate: "2021-11-03",
          price: ACY_PRICE.toString() + ' USDT',
          raiseSize: "1000000 ACY",
          amount: 5000,
          marketCap:"$30M",
          maxAllocations:'300',
          maxWinners: "10000",
          filled: "1379%",
          yieldPer:"-",
          totalTickets: "82790 Tickets",
          perWinTicket: "120 USDT",
          get maxAllocation() {
            return this.quantity * ACY_PRICE;
        }
        },
      ];

    const token = {
        color:'#C4C4C4', 
        textAlign:'left', 
        fontFamily:'Inter, sans-serif'
    }

    const tokenContent = {
        fontWeight:'bold', 
        textAlign:'left', 
        color:'#fff'
    }

    const tokenContent1 = {
        fontWeight:'bold', 
        textAlign:'center', 
        color:'#000'
    }

    const hashtagText = {
        color: '#C4C4C4',
        position: 'relative',
        top: '12px',
        marginTop: '14px',
        fontSize: '15px'
    }

    const buttonCustomStyle = {
        border: '#eb5c20', 
        color: 'white', 
        height: "2em", 
        marginRight:"0.8em",
        marginTop:"0.8em"
    }

    const buttonCustomStyle1 = {
        background: 'transparent',
        border: '#eb5c20', 
        color: 'white', 
        height: "2em", 
        marginRight:"0.8em",
        marginTop:"0.8em"
    }

    const buttonCustomStyle2 = {
        background: 'transparent',
        border: '#eb5c20', 
        color: 'white', 
        height: "2em", 
        marginLeft:"0.2em",
        marginTop:"0.8em"
    }

    const copyButton = {
        background: 'transparent',
        border: '#eb5c20', 
        color: 'var(--color-light-neutral-5)', 
        height: "2em", 
        marginLeft:"0.2em",
        marginTop:"0.8em"
    }

    const [showCopied, setShowCopied] = useState(false);
    useEffect(() => {
        let timeout
        if (showCopied) {
          timeout = setTimeout(() => setShowCopied(false), 1000);
        }
        return () => clearTimeout(timeout);
    }, [showCopied]);

    const menu = (
        <Menu>
            <Menu.Item className={styles.dropdownItem} id="drop1">
                <img src={ethIcon} alt="" style={{height:'25px', width:'10.8px', objectFit:'contain', margin: '0px 8px 0 0', float:'left'}} />  
                <a 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  href="https://cn.etherscan.com/token/0xaf9db9e362e306688af48c4acb9618c06db38ac3" 
                  style={{
                    color:'#000',
                    display:'flex',
                    flexDirection: "column"
                  }} 
                >
                <span>Etherscan.io</span>
                <span style={{color: 'rgba(16, 112, 224, 0.85)'}}>0xaf9d...db38ac3</span>
                </a>
                <Button 
                  style={copyButton} 
                  onClick={()=> {
                    navigator.clipboard.writeText("https://cn.etherscan.com/token/0xaf9db9e362e306688af48c4acb9618c06db38ac3");
                    setShowCopied(true);
                  }}
                >
                <Icon type='copy' />
                </Button>
            </Menu.Item>
            <Menu.Item className={styles.dropdownItem} id="drop2">
                <img src={polygonIcon} alt="" style={{height:'25px', width:'10.8px', objectFit:'contain', margin: '0px 8px 0 0', float:'left'}} />   
                <a 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  href="https://polygonscan.com/token/0x8b1f836491903743fe51acd13f2cc8ab95b270f6" 
                  style={{
                    color:'#000',display:'flex',flexDirection: "column"
                  }}
                >
                <span>Polygonscan</span>
                <span style={{color: 'rgba(16, 112, 224, 0.85)'}}>0xaf9d...db38ac3</span>
                </a>
                <Button 
                  style={copyButton} 
                  onClick={()=> {
                    navigator.clipboard.writeText("https://polygonscan.com/token/0x8b1f836491903743fe51acd13f2cc8ab95b270f6");
                    setShowCopied(true);
                  }} 
                >
                <Icon type='copy' />
                </Button>
            </Menu.Item>
            <Menu.Item className={styles.dropdownItem} id="drop3">
                <img src={confluxIcon} alt="" style={{height:'25px', width:'10.8px', objectFit:'contain', margin: '0px 8px 0 0', float:'left'}} />  
                <a 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  href="https://confluxscan.io/token/cfx:accyf3j7s23x5j62hwt619k01un9bzn9u2mc6gavzb" 
                  style={{
                    color:'#000',
                    display:'flex',
                    flexDirection: "column"}}
                >
                <span>Conflux.io</span>
                <span style={{color: 'rgba(16, 112, 224, 0.85)'}}>0xaf9d...db38ac3</span>
                </a>
                <Button 
                  style={copyButton}
                  onClick={()=> {
                    navigator.clipboard.writeText("https://confluxscan.io/token/cfx:accyf3j7s23x5j62hwt619k01un9bzn9u2mc6gavzb");
                    setShowCopied(true);
                  }} 
                >
                <Icon type='copy' />
                </Button>
            </Menu.Item>
        </Menu>
    );

    const [selectedForm, setSelectedForm] = useState(0)
    
    return(
        <div className={styles.launchRoot}>
            <div className={styles.alertBanner}>
                {showCopied ? <Alert message="Address Copied To Clipboard" type="success" showIcon banner /> : ""}
            </div>
            <div className={styles.topContainer}>
            <div className={styles.tokenContainer}> 
                <div className={styles.snsContainer}>
                <div className={styles.snsBox1}>
                    <Button type="link" href={links[0]} target="_blank" style={buttonCustomStyle2} icon="link">Website</Button>
                    <br />
                    <Button type="link" href={links[4]} target="_blank" style={buttonCustomStyle2} icon="file-ppt">Deck</Button>
                    <br />
                    <Button type="link" href={links[2]} target="_blank" style={buttonCustomStyle}>
                        <img src={telegramWIcon} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '8px 8px 0 0', float:'left'}} /> Telegram
                    </Button>
                    <br />
                    <Button type="link" href={links[4]} target="_blank" style={buttonCustomStyle2} icon="medium">Medium</Button> 
                    <br />
                    <Button type="link" href={links[4]} target="_blank" style={buttonCustomStyle2} icon="message">Forum</Button> 
                    <br />
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button onClick={e => e.preventDefault()} style={buttonCustomStyle1} icon="profile">
                            Address <Icon type="down" />
                        </Button>
                    </Dropdown>
                </div>
                <div className={styles.snsBox2}>
                    <Button type="link" href={links[1]} target="_blank" style={buttonCustomStyle} icon="file">Whitepaper</Button>
                    <br />
                    <Button type="link" href={links[3]} target="_blank" style={buttonCustomStyle} icon="twitter">Twitter</Button>
                    <br />
                    <Button type="link" href={links[6]} target="_blank" style={buttonCustomStyle} icon="linkedin">LinkedIn</Button>             
                    <br />
                    <Button type="link" href={links[5]} target="_blank" style={buttonCustomStyle} icon="github">Github</Button>
                    <br />
                    <Button type="link" href={links[1]} target="_blank" style={buttonCustomStyle}>
                        <Icon type="youtube" theme="filled" />
                            YouTube
                    </Button>
                </div>
                </div>
                <div className={styles.hashtagBox}>
                    <img src={hashtagIcon} alt="" className={styles.hashtagImage} />
                    <span style={hashtagText}>DeFi, AMM, DEX</span>
                </div>
            </div>
            
            <div className={styles.moreInfoContainer}>
                <div className={styles.contentStyle}>
                    <div className={styles.carouselBlock}>
                        <div className={styles.stepBlock} id="block">
                            <div className={styles.cntBlock}>
{/*                               <div className={styles.labelBlock}>
                                <div className={styles.countLabelBlock}>
                                    <div className={styles.countLabel}>
                                        ROUND 1
                                    </div>
                                </div>
                                <div className={styles.tokenIDODate}>
                                    <p style={{color:'#b5b5b6', fontSize:"13px"}}>Open: {selectedTableRow.openDate} 10:00 UST</p>
                                    <p style={{color:'#b5b5b6', fontSize:"13px"}}>Close: {selectedTableRow.closeDate} 10:00 UST</p>
                                </div>
                            </div> */}
                            <CountDown />
                            <StepBar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <div className={styles.midContainer}>
                <div className={styles.tokenInfoBox}>
                    <div className={styles.tokenInfoContainer}>
                        <div className={styles.tokenInfoBoxTop}>
                            <div className={styles.tokenSym}>
                                <img src={AcyIcon} alt="ACY Token" className={styles.mainImage} />
                                <h2 style={{color:'#eb5c20'}} className={styles.tokenName}> ACY </h2>
                            </div>
                            {/* { selectedForm === 2 && (
                            <div className={styles.tokenIDOStatus}>
                                <Tag style={{float:'right', backgroundColor: '#C4C4C4', color: 'black', borderRadius:'10px', width:'auto', height:'auto', textAlign:"center", fontSize:'16px', fontFamily:'Inter, sans-serif'}}>Your Max Allocation : 100 USDT</Tag>
                            </div>
                            )} */}
                        </div>
                    </div>
                    <div className={styles.tokenProgress}>
                        <Progress strokeColor={{'0%': '#eb5c20','100%': '#c6224e'}} percent={90} status='active' />
                    </div>
                    <div className={styles.tokenDetails}>
                        <div className={styles.tokenPrice}>                    
                            <p style={token}>Per ACY</p>
                            <h3 style={tokenContent}>0.2 USDT</h3>
                        </div>
                        <div className={styles.ticketAllocation}>    
                            <p style={token}>Raise Size</p>
                            <h3 style={tokenContent}>1000000 ACY</h3> 
                        </div>
                        <div className={styles.tokenTotalRaise}>                   
                            <p style={token}>Amount</p>
                            <h3 style={tokenContent}>200000</h3>
                        </div>
                        <div className={styles.tokenMarketCap}>   
                            <p style={token}>Market Cap</p>
                            <h3 style={tokenContent}>$5M</h3>             
                        </div>
                    </div>
                    <span className={styles.line} />
                    <div className={styles.tokenMoreInfo}>
                        <div className={styles.totalTickets}>                   
                            <p style={token}>Allocation/Winning Ticket</p>
                            <h3 style={tokenContent}>120 USDT</h3>
                        </div>
                        <div className={styles.totalTicketsDeposited}>
                            <p>Total Tickets Deposited</p>
                            <h3 style={tokenContent}>20000 Tickets</h3>
                        </div>
                        <div className={styles.tokenMaxAllo}>
                            <p>Max Allocation</p>
                            <h3 style={tokenContent}>20000</h3>
                        </div>
                        <div className={styles.tokenMaxWinners}>
                            <p>Max Winners</p>
                            <h3 style={tokenContent}>10000</h3>
                        </div>
                    </div>
                </div>
                <div className={styles.ticketBox}>
                    { selectedForm === 0 && (
                    <div className={styles.showTicketContainer}>
                        <div className={styles.showTicketBox}>
                            <div className={styles.showTicketBox1}>
                                <div className={styles.userEligibleTickets}>
                                    <p>Your Eligible Tickets</p>
                                    <h3 style={tokenContent1}>0 Ticket(s)</h3>
                                </div>
                                <div className={styles.userDepositedTickets}>
                                    <p>Your Eligible Amount</p>
                                    <h3 style={tokenContent1}>10 USDT</h3>
                                </div>
                            </div>
                            <div className={styles.showTicketBox2}>
                                <div className={styles.userWinningTickets}>
                                    <p>Your Winning Tickets</p>
                                    <h3 style={tokenContent1}>0 Ticket(s)</h3>
                                </div>
                                <div className={styles.userTicketsAllo}>
                                    <p>Your Allocation</p>
                                    <h3 style={tokenContent1}>0 ACY</h3>
                                </div>
                            </div>
                        </div>
                        <div className={styles.whitelistBox}>
                            <Button className={styles.whiteListToggleButton} shape="round" onClick={() => setSelectedForm(2)}>Participate</Button>
                        </div>
                    </div>
                )}
                {selectedForm === 1 && (
                    <WhitelistTask
                      setSelectedForm={setSelectedForm}
                    />
                )}
                { selectedForm === 2 && (
                    <SwapTicket />
                )}
                </div>
            </div>
            {/* <div className={styles.dateTableBox}>
                <Table 
                  style={{marginTop:'20px', textAlign:'center'}} // position: 'relative', display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap:'wrap'
                  columns={tableColumns} 
                  dataSource={tableData}
                  onRow={(record, rowIndex) => {
                  return {
                    onClick: event => {
                        setSelectedTableRow(record);
                    }, // click row
                    };
                    }}
                />
            </div> */}
            <div className={styles.bottomContainer}>
                <div className={styles.chartWrapper} id="chartdata">
                    <LaunchChart  
                      data={chartData}
                      showXAxis
                      showYAxis
                      showGradient
                      lineColor="#e29227"
                      bgColor="#2f313500"
                    />
                </div>
                <div className={styles.transferTable}>
                    <Table 
                      style={{marginTop:'20px',textAlign:'center', height: '425px'}}
                      id="transferTable"
                      columns={transferTableHeader} 
                      dataSource={transferData}
                      pagination={false}
                      scroll={{ y: 425 }}
                      rowClassName={(record, index) => styles.rowExpanded}
                    />   
                </div> 
            </div>
        </div>
    );
}

export default LaunchpadComponent
