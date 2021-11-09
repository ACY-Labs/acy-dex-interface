/* eslint-disable react/jsx-indent */
import { getTransferData } from '@/acy-dex-swap/core/launchPad';
import {Button, Menu, Dropdown, Icon, Progress, Tag, Table, Carousel} from 'antd';
import FollowTelegram from "./FollowTelegram";
import ToggleButton from "./ToggleButton";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { AcyLineChart } from '@/components/Acy';
import AcyIcon from '@/assets/icon_acy.svg';
import hashtagIcon from '@/assets/icon_hashtag.png';
import telegramIcon from '@/assets/icon_telegram_black.png';
import styles from './styles.less';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ERC20ABI from '@/abis/ERC20.json';
import WETHABI from '@/abis/WETH.json';
import Eth from "web3-eth";
import Utils from "web3-utils";
import SwapTicket from "./swapTicket";
import StepBar from './stepComponent';
import ReactDOM from 'react-dom';
import CountDown from "./countDown";

var Contract = require('web3-eth-contract');
// set provider for all later instances to use
var eth = new Eth('https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
Contract.setProvider('https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');

const contentStyle = {
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };


function getTIMESTAMP(time) {
    var date = new Date(time);
    var year = date.getFullYear(time);
    var month = ("0" + (date.getMonth(time) + 1)).substr(-2);
    var day = ("0" + date.getDate(time)).substr(-2);
    var hour = ("0" + date.getHours(time)).substr(-2);
    var minutes = ("0" + date.getMinutes(time)).substr(-2);
    var seconds = ("0" + date.getSeconds(time)).substr(-2);
  
    //return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
    return year + "-" + month + "-" + day;

  }
  

const ACY_PRICE = 0.2  // acy per usdc

const LaunchpadComponent = () => {

    //let price = [];
    const recordNum = 10;
    const [price,setPrice] = useState([]);
    const [chartData,setChartData] = useState([]);
    const [timeData,setTimeData] = useState([]);
    const [pendingEnd,setPending]= useState(false);
    const [fetchEnd,setFetchEnd] = useState(false);
    const [transferData,setTransferData] = useState([]);
    const [selectedGraph,setSelectedGraph] = useState(1);

    const getTime = async (blockNumber) => {

        const result = await eth.getBlock(blockNumber).then(function(events){

        const timeStamp = events['timestamp'];
       // const time = new Date(timeStamp * 1000).toISOString().slice(0, 19).replace('T', ' ')
        //console.log(time);
        const time = getTIMESTAMP(timeStamp*1000);

        return time;
        })
        
        return result;
        }                

    useEffect(async() =>{
         // price = [[blockNumber,value]]
        //calculate the time then finally get  Time:value array

        var index = price.length-1;
        if(price[index] != undefined)
        {
        getTime(price[index][0]).then(function(result){
            var newElement = [result,price[index][1]];
            setTimeData( timeData => [...timeData,newElement]);
        })
        }


    }
    ,[price])
    useEffect( async () => {
        // set provider for all later instances to use    
        const contract = new Contract(ERC20ABI, '0xaf9db9e362e306688af48c4acb9618c06db38ac3');
            console.log("test");


        const result = (contract.getPastEvents("Transfer", {
            fromBlock: 0 ,
            toBlock: 'latest'
        }, function(error, events){ console.log(events); })
        .then(function(events){
            console.log(events.length) // same results as the optional callback above
            // remaining some bug in some case ( if recodrNum > events.length)
            for (let i = events.length  - recordNum; i < events.length; i++) {
                var element = events[i];
                var returnValue = element['returnValues'];
                var blockNumber = element['blockNumber'];
                //price.push([blockNumber,returnValue['value']/1e18]);
                var newElement = [blockNumber,returnValue['value']/1e18];
                //console.log(newElement)
                setPrice( price => [...price,newElement] );

            }
        }));
   

    
    
 
    },[])
      
    useEffect(async () =>{
        getTransferData().then((events) => {
            console.log('getTransferData',events,events.length);
            // const chartData = [];
            // events.forEach( (element) => {
            //     chartData.push([element.dateTime.substr(0,11),element.price]);
            // });
            // console.log('chartData:',chartData);
            setTransferData(events[0]);
            setChartData(events[1])
        });
        
    },[])


    const links = [
        "https://google.com",
        "https://youtube.com",
        "https://t.me/acyfinance",
        "https://twitter.com/acyfinance?lang=en",
        "https://medium.com/acy-finance",
        "https://github.com/ACY-Labs",
        "https://www.linkedin.com/company/acy-finance/"
    ];


    const testdata = [
        ['999991',1],
        ['9999992',2],
        ['99999999993',3]
    ]
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
            title: 'Max Winning',
            dataIndex: 'maxWinning',
            width: 100,
            align: 'center'
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            width: 75,
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
            dataIndex: 'maxAllocation',
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
            title: 'Status',
            dataIndex: 'status',
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
            width: 70,
            align: 'left'
        },
        {
            title: 'Participants',
            dataIndex: 'participant',
            width: 60,
            align: 'center',
            ellipsis: true
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            width: 60,
            align: 'center',
            ellipsis: true
        },
        {
            title: 'Token',
            dataIndex: 'token',
            width: 40,
            align: 'center',
            render: token => (
                <div>
                    <img src={AcyIcon} alt="ACY Token" className={styles.smallIcon} />
                    
                    {token}
                </div>
            )
        },
    ];

    const tableData = [
        {
          round: "Round 1",
          openDate: "2021-10-30",
          closeDate: "2021-11-01",
          price: ACY_PRICE.toString() + ' USDC',
          maxWinning: "1000000 ACY",
          quantity: 2500,
          marketCap:"$10M",
          filled: "1379%",
          status: "Filled",
          yieldPer:"+223%",
          totalTickets: "82795 Tickets",
          perWinTicket: "100 USDC",
          get maxAllocation() {
              return this.quantity * ACY_PRICE;
          }
        },
        {
          round: "Round 2",
          openDate: "2021-10-13",
          closeDate: "2021-10-20",
          price: ACY_PRICE.toString() + ' USDC',
          maxWinning: "1000000 ACY",
          quantity: 3000,
          marketCap:"$20M",
          filled: "1579%",
          status: "Filled",
          yieldPer:"+203%",
          totalTickets: "82700 Tickets",
          perWinTicket: "110 USDC",
          get maxAllocation() {
            return this.quantity * ACY_PRICE;
        }
        },
        {
          round: "Round 3",
          openDate: "2021-10-28",
          closeDate: "2021-11-03",
          price: ACY_PRICE.toString() + ' USDC',
          maxWinning: "1000000 ACY",
          quantity: 5000,
          marketCap:"$30M",
          filled: "1379%",
          status: "Upcoming",
          yieldPer:"-",
          totalTickets: "82790 Tickets",
          perWinTicket: "111 USDC",
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
        color:'#FFF'
    }

    const hashtagText = {
        color: '#C4C4C4',
        position: 'relative',
        top: '12px',
        marginTop: '14px',
        fontSize: '15px'
    }

    const buttonCustomStyle = {
        background: '#C4C4C4',
        border: '#eb5c20', 
        color: 'black', 
        height: "2em", 
        marginLeft:"0.8em"
    }

    const menu = (
        <Menu>
            <Menu.Item>
                <a target="_blank" rel="noopener noreferrer" href="https://etherscan.io/token/0x4E15361FD6b4BB609Fa63C81A2be19d873717870">
                    Etherscan.io
                </a>
            </Menu.Item>
            <Menu.Item>
                <a target="_blank" rel="noopener noreferrer" href="https://ethplorer.io/address/0x4e15361fd6b4bb609fa63c81a2be19d873717870#chart=candlestick">
                    Ethplorer.io
                </a>
            </Menu.Item>
        </Menu>
    );

    const [showForm, setShowForm] = useState(false);
    const [selectedForm, setSelectedForm] = useState(0)
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedTableRow, setSelectedTableRow] = useState(tableData[0]);

    const onWhitelistToggleButtonClick = () => {
        setSelectedTab(1);
    };

    const onParticipateToggleButtonClick = () => {
        setSelectedTab(2);
    };
    

        return(
            <PageHeaderWrapper>
                

        <div className={styles.topContainer}>
            <div className={styles.tokenContainer}> 
                <div className={styles.snsBox1}>
                    <Button type="primary" href={links[0]} target="_blank" style={{background: "#C4C4C4", border: "#eb5c20", color: 'black', height: "2em"}} icon="link">Website</Button>
                    <Button type="link" href={links[1]} target="_blank" style={buttonCustomStyle} icon="file">Whitepaper</Button>
                    <Button type="link" href={links[2]} target="_blank" style={buttonCustomStyle}>
                        <img src={telegramIcon} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '8px 8px 0 0', float:'left'}} /> Telegram
                    </Button>             
                    <Button type="link" href={links[3]} target="_blank" style={buttonCustomStyle} icon="twitter">Twitter</Button>
                </div>
                <div className={styles.snsBox2}>
                    <Button type="link" href={links[4]} target="_blank" style={{background: "#C4C4C4", border: "#eb5c20", color: 'black', height: "2em"}} icon="medium">Medium</Button>
                    <Button type="link" href={links[6]} target="_blank" style={buttonCustomStyle} icon="linkedin">LinkedIn</Button>             
                    <Button type="link" href={links[4]} target="_blank" style={buttonCustomStyle} icon="message">Forum</Button> 
                    <Button type="link" href={links[5]} target="_blank" style={buttonCustomStyle} icon="github">Github</Button>
                </div>
                <div className={styles.snsBox3}>
                    <Button type="link" href={links[4]} target="_blank" style={{background: "#C4C4C4", border: "#eb5c20", color: 'black', height: "2em"}} icon="file-ppt">Deck</Button>
                    <Button type="link" href={links[1]} target="_blank" style={buttonCustomStyle}>
                        <Icon type="youtube" theme="filled" />
                            YouTube
                    </Button>
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button onClick={e => e.preventDefault()} style={buttonCustomStyle}>
                            Explorer <Icon type="down" />
                        </Button>
                    </Dropdown>
                </div>
                <div className={styles.hashtagBox}>
                    <img src={hashtagIcon} alt="" className={styles.hashtagImage} />
                    <span style={hashtagText}>DeFi Market, AMM, DEX</span>
                </div>
            </div>
            
            <div className={styles.contentStyle} >

            <Carousel dot = "true" autoplay >
            <div>
                    <div id = "cntBlock">
                        <CountDown/>
                        </div>
                    <div className ={styles.stepBlock} id = "block">
                    <StepBar chartData = {chartData}/>
                    </div>
                    
                    
            </div>
            <div className = {styles.chartWrapper} id = "chartdata" >
                    <AcyLineChart  
                        data={timeData}
                        showXAxis={true}
                        showYAxis={true}
                        showGradient={true}
                        lineColor="#e29227"
                        bgColor="#2f313500"
                    />
            </div>
            <div>
                     <div className={styles.transferTable}>
                        <Table style={{marginTop:'20px',textAlign:'center'}}
                            id="transferTable"
                            columns={transferTableHeader} dataSource={transferData}
                            pagination={false}
                            scroll={{ y: 250 }}
                            rowClassName={(record, index) => styles.rowExpanded}
                        />   
                    </div> 
            </div>
            </Carousel>


            </div>
        </div>
        <div className={styles.midContainer}>
    
            <div className={styles.tokenInfoBox}>
                <div className={styles.tokenInfoContainer }>
                    <h2 style={{fontWeight:'bold'}}>{selectedTableRow.round}</h2>
                    <div className={styles.tokenInfoBoxTop}>
                        <div className={styles.tokenSym}>
                            <img src={AcyIcon} alt="ACY Token" className={styles.mainImage} />
                            <h2 style={{color:'#eb5c20'}} className={styles.tokenName}> ACY </h2>
                        </div>
                        <div className={styles.tokenIDODate}>
                            <h4 style={{color:'#fff'}}>Open: {selectedTableRow.openDate} 10:00 UST</h4>
                            <h4 style={{color:'#fff'}}>Close: {selectedTableRow.closeDate} 10:00 UST</h4>
                        </div>
                        <div className={styles.tokenIDOStatus}>
                            <Tag style={{float:'right', backgroundColor: '#C4C4C4', color: 'black', borderRadius:'10px', width:'70px', height:'auto', textAlign:'center', fontSize:'18px', fontFamily:'Inter, sans-serif'}}>Ended</Tag>
                        </div>
                    </div>
                </div>
                <div className={styles.tokenProgress}>
                    <Progress strokeColor={{'0%': '#eb5c20','100%': '#c6224e'}} percent={90} status='active' />
                </div>
                <div className={styles.tokenDetails}>
                    
                    <div className={styles.tokenPrice}>                    
                        <p style={token}>Per ACY</p>
                        <h3 style={tokenContent}>{selectedTableRow.price}</h3>
                    </div>
                    <div className={styles.ticketAllocation}>    
                        <p style={token}>Quantity</p>
                        <h3 style={tokenContent}>{selectedTableRow.quantity}</h3> 
                    </div>
                    <div className={styles.tokenTotalRaise}>                   
                        <p style={token}>Max Winning</p>
                        <h3 style={tokenContent}>{selectedTableRow.maxWinning}</h3>
                    </div>
                    <div className={styles.tokenMarketCap}>   
                        <p style={token}>Market Cap</p>
                        <h3 style={tokenContent}>{selectedTableRow.marketCap}</h3>             
                    </div>
                </div>
                <span className={styles.line}> </span>
                <div className={styles.tokenMoreInfo}>
                    <div className={styles.totalTickets}>                   
                        <p style={token}>Allocation Per Winning Ticket</p>
                        <h3 style={tokenContent}>{selectedTableRow.perWinTicket}</h3>
                    </div>
                    <div className={styles.tokenAmount}>                    
                        <p style={token}>Total Tickets Deposited</p>
                        <h3 style={tokenContent}>{selectedTableRow.totalTickets}</h3>
                    </div>
                    <div className={styles.tokenMaxAllo}>              
                        <p style={token}>Max Allocation</p>
                        <h3 style={tokenContent}>{selectedTableRow.maxAllocation}</h3>
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
                                <h3 style={tokenContent}>0 Ticket(s)</h3>
                            </div>
                            <div className={styles.userDepositedTickets}>
                                <p>Your Deposited Tickets</p>
                                <h3 style={tokenContent}>0 Ticket(s)</h3>
                            </div>
                        </div>
                        <div className={styles.showTicketBox2}>
                            <div className={styles.userWinningTickets}>
                                <p>Your Winning Tickets</p>
                                <h3 style={tokenContent}>0 Ticket(s)</h3>
                            </div>
                            <div className={styles.userTicketsAllo}>
                                <p>Your Allocation</p>
                                <h3 style={tokenContent}>0 ACY</h3>
                            </div>
                        </div>
                    </div>
                    <div className={styles.whitelistBox}>
                        <Button className={styles.whiteListToggleButton} shape="round" onClick={() => setSelectedForm(1)}>Whitelist</Button>
                    </div>
                </div>
                
                )}
                {selectedForm === 1 && (
                    <FollowTelegram 
                        setSelectedForm={setSelectedForm}
                    />
                )}
                { selectedForm === 2 && (
                    <SwapTicket />
                )}
            </div>
            
        </div>
        <div className={styles.dateTableBox}>
            <Table style={{marginTop:'20px', textAlign:'center'}} 
                columns={tableColumns} dataSource={tableData}
                onRow={(record, rowIndex) => {
                    return {
                        onClick: event => {
                        setSelectedTableRow(record);
                        }, // click row
                    };
                }}
            />
        </div>
        
        
            </PageHeaderWrapper>
            
        );
}

export default LaunchpadComponent