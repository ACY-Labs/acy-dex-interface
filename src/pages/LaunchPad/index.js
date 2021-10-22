/* eslint-disable react/jsx-indent */
import React from 'react';
import "antd/dist/antd.css";
import {Button, Menu, Dropdown, Icon, Progress, Tag, Table} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { AcyLineChart } from '@/components/Acy';
import acyIcon from '@/assets/icon_acy.png';
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
        },
        {
            title: 'Date',
            dataIndex: 'date',
            className: 'column-date',
            width: 100,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            width: 70,
        },
        {
            title: 'Raise Size',
            dataIndex: 'raiseSize',
            width: 100,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            width: 60,
        },
        {
            title: 'Market Cap',
            dataIndex: 'marketCap',
            width: 100,
        },
        {
            title: 'Max Allocation',
            dataIndex: 'maxAllocation',
            width: 100,
        },
        {
            title: 'Filled',
            dataIndex: 'filled',
            width: 100,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            width: 100,
        },
        {
            title: 'Yield',
            dataIndex: 'yieldPer',
            width: 100,
        },
    ];

    const tableData = [
        {
          round: "Round 1",
          date: "10-10-2021",
          price: '0.05 USDC',
          raiseSize: "1000000 SHI",
          amount: "25M",
          marketCap:"10M",
          maxAllocation: "10M",
          filled: "1379%",
          status: "Filled",
          yieldPer:"+223%"
        },
        {
          round: "Round 2",
          date: "17-10-2021",
          price: '0.10 USDC',
          raiseSize: "1000000 SHI",
          amount: "25M",
          marketCap:"20M",
          maxAllocation: "10M",
          filled: "1579%",
          status: "Filled",
          yieldPer:"+203%"
        },
        {
          round: "Round 3",
          date: "28-10-2021",
          price: '0.15 USDC',
          raiseSize: "1000000 SHI",
          amount: "25M",
          marketCap:"30M",
          maxAllocation: "10M",
          filled: "1379%",
          status: "Upcoming",
          yieldPer:"-"
        },
      ];

    const token = {
        color:'#C4C4C4', 
        textAlign:'left', 
        fontFamily:'Inter, sans-serif'
    }

    const hashtagText = {
        color: '#C4C4C4',
        position: 'relative',
        top: '19px',
        marginTop: '15px',
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
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button onClick={e => e.preventDefault()} style={buttonCustomStyle}>
                            Explorer <Icon type="down" />
                        </Button>
                    </Dropdown>
                </div>
                <div>
                    <img src={hashtagIcon} alt="" className={styles.hashtagImage} />
                    <span style={hashtagText}>DeFi Market</span>
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
        <div className={styles.tokenInfoBox}>
            <div className={styles.tokenSym}>
                <img src={acyIcon} alt="Token" className={styles.mainImage} />
                <h2 className={styles.tokenName}> ACY </h2>
                <span style={{marginLeft:'5vw', marginTop: '8px', color:'#C4C4C4', fontFamily:'Inter, sans-serif'}}>25-10-2021 ~ 26-10-2021</span>
                <Tag style={{float:'right', backgroundColor: '#C4C4C4', color: 'black', borderRadius:'10px', width:'70px', height:'auto', marginTop:'25px', textAlign:'center', fontSize:'18px', fontFamily:'Inter, sans-serif'}}>Ended</Tag>
            </div>
            <span className={styles.line}> </span>
            <div className={styles.tokenDetails}>
                <div className={styles.tokenTotalRaise}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>30,000,000 ACY</h3>
                    <p style={token}>Total Raise</p>
                </div>
                <div className={styles.tokenPrice}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>0.02 USDC</h3>
                    <p style={token}>Per ACY</p>
                </div>
                <div className={styles.ticketAllocation}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>100 USDC</h3>
                    <p style={token}>Allocation Per Winning Ticket</p>
                </div>
                <div className={styles.totalTickets}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>82795 Tickets</h3>
                    <p style={token}>Total Tickets Deposited</p>
                </div>
            </div>
            <div className={styles.tokenProgress}>
                <Progress strokeColor={{'0%': '#eb5c20','100%': '#c6224e'}} percent={90} status='active' />
            </div>
            <span className={styles.line}> </span>
            <div className={styles.tokenDetails}>
                <div className={styles.tokenTotalRaise}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>0 Ticket(s)</h3>
                    <p style={token}>Your Eligible Tickets</p>
                </div>
                <div className={styles.tokenPrice}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>0 Ticket(s)</h3>
                    <p style={token}>Your Deposited Tickets</p>
                </div>
                <div className={styles.ticketAllocation}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>0 Ticket(s)</h3>
                    <p style={token}>Your Winning Ticket</p>
                </div>
                <div className={styles.totalTickets}>
                    <h3 style={{fontWeight:'bold', textAlign:'left'}}>0 ACY</h3>
                    <p style={token}>Total Tickets Deposited</p>
                </div>
            </div>
        </div>
        <div className={styles.ticketBox}>
            <div className={styles.ticketDescription}>
                <h1 style={{color:'#c4c4c4', textAlign:'center', fontFamily:'Inter, sans-serif', marginTop:'7px'}}>Follow these steps to get the tickets which are then used to swap for ACY tokens: </h1>
            </div>
        </div>
        <div className={styles.dateTableBox}>
            <Table style={{marginTop:'20px', textAlign:'center'}} columns={tableColumns} dataSource={tableData} />
        </div>
      </PageHeaderWrapper>
    );
}

export default LaunchpadComponent
