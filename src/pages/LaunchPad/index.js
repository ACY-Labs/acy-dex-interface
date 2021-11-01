/* eslint-disable react/jsx-indent */
import React, {useState} from 'react';
import {Button, Menu, Dropdown, Icon, Progress, Tag, Table} from 'antd';
import InputEmail from "./inputEmail";
import ToggleButton from "./ToggleButton";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { AcyLineChart } from '@/components/Acy';
import AcyIcon from '@/assets/icon_acy.svg';
import hashtagIcon from '@/assets/icon_hashtag.png';
import telegramIcon from '@/assets/icon_telegram_black.png';
import styles from './styles.less';

const LaunchpadComponent = () => {
    const links = [
        "https://google.com",
        "https://youtube.com",
        "https://t.me/acyfinance",
        "https://twitter.com/acyfinance?lang=en",
        "https://medium.com/acy-finance",
        "https://github.com/ACY-Labs",
        "https://www.linkedin.com/company/acy-finance/"
    ];

    const chartData = {
        price: [
            ['20:00', 5000],
            ['20:05', 6500],
            ['20:10', 7800],
            ['20:15', 15000],
            ['20:20', 23000],
            ['20:25', 42000],
            ['20:30', 51000],
            ['20:35', 58000],
            ['20:40', 65000]
        ],
    }

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
            title: 'Quantities',
            dataIndex: 'quantities',
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

    const tableData = [
        {
          round: "Round 1",
          openDate: "10-10-2021",
          closeDate: "10-10-2021",
          price: '0.05 USDC',
          raiseSize: "1000000 ACY",
          quantities: "25M",
          marketCap:"10M",
          maxAllocation: "10M",
          filled: "1379%",
          status: "Filled",
          yieldPer:"+223%",
          totalTickets: "82795 Tickets",
          perWinTicket: "100 USDC",
        },
        {
          round: "Round 2",
          openDate: "17-10-2021",
          closeDate: "17-11-2021",
          price: '0.10 USDC',
          raiseSize: "1000000 ACY",
          quantities: "25M",
          marketCap:"20M",
          maxAllocation: "10M",
          filled: "1579%",
          status: "Filled",
          yieldPer:"+203%",
          totalTickets: "82700 Tickets",
          perWinTicket: "110 USDC",
        },
        {
          round: "Round 3",
          openDate: "28-10-2021",
          closeDate: "28-11-2021",
          price: '0.15 USDC',
          raiseSize: "1000000 ACY",
          quantities: "25M",
          marketCap:"30M",
          maxAllocation: "10M",
          filled: "1379%",
          status: "Upcoming",
          yieldPer:"-",
          totalTickets: "82790 Tickets",
          perWinTicket: "111 USDC",
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

    const [showForm, setShowForm] = useState(false)
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
            
            
            <div className={styles.chartWrapper}>
                <AcyLineChart
                    data={chartData.price}
                    showXAxis={true}
                    showGradient={true}
                    lineColor="#e29227"
                    bgColor="#2f313500"
                />
            </div>
            
        </div>
        <div className={styles.midContainer}>
            <div className={styles.tokenInfoBox}>
                <div className={styles.tokenInfoContainer }>
                    <h2 style={{fontWeight:'bold',color:'#eb5c20'}}>{selectedTableRow.round}</h2>
                    <div className={styles.tokenInfoBoxTop}>
                        <div className={styles.tokenSym}>
                            <img src={AcyIcon} alt="ACY Token" className={styles.mainImage} />
                            <h2 style={{color:'#eb5c20'}} className={styles.tokenName}> ACY </h2>
                        </div>
                        <div className={styles.tokenIDODate}>
                            <h4 style={{color:'#fff'}}>Open: {selectedTableRow.openDate}</h4>
                            <h4 style={{color:'#fff'}}>Close: {selectedTableRow.closeDate}</h4>
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
                    <div className={styles.tokenTotalRaise}>                   
                        <p style={token}>Raise Size</p>
                        <h3 style={tokenContent}>{selectedTableRow.raiseSize}</h3>
                    </div>
                    <div className={styles.tokenPrice}>                    
                        <p style={token}>Per ACY</p>
                        <h3 style={tokenContent}>{selectedTableRow.price}</h3>
                    </div>
                    <div className={styles.ticketAllocation}>    
                        <p style={token}>Quantities</p>
                        <h3 style={tokenContent}>{selectedTableRow.quantities}</h3> 
                    </div>
                    <div className={styles.tokenMarketCap}>   
                        <p style={token}>Market Cap</p>
                        <h3 style={tokenContent}>{selectedTableRow.marketCap}</h3>             
                    </div>
                </div>
                <span className={styles.line}> </span>
                <div className={styles.tokenMoreInfo}>
                    <div className={styles.tokenRaiseSize}>                
                        <p style={token}>Raise Size</p>
                        <h3 style={tokenContent}>{selectedTableRow.raiseSize}</h3>
                    </div>
                    <div className={styles.tokenAmount}>                    
                        <p style={token}>Total Tickets Deposited</p>
                        <h3 style={tokenContent}>{selectedTableRow.totalTickets}</h3>
                    </div>
                    <div className={styles.totalTickets}>                   
                    <p style={token}>Allocation Per Winning Ticket</p>
                        <h3 style={tokenContent}>{selectedTableRow.perWinTicket}</h3>
                    </div>
                    <div className={styles.tokenMaxAllo}>              
                        <p style={token}>Max Allocation</p>
                        <h3 style={tokenContent}>{selectedTableRow.maxAllocation}</h3>
                    </div>
                </div>
            </div>
            
            <div className={styles.ticketBox}>
                { !showForm ? (
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
                        <Button className={styles.whiteListToggleButton} shape="round" onClick={() => setShowForm(() => true)}>Whitelist</Button>
                    </div>
                </div>
                ) : (
                    <InputEmail />
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