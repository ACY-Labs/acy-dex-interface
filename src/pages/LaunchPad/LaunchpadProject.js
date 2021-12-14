/* eslint-disable react/jsx-indent */
import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import LaunchChart from "./launchChart";
import { getTransferData } from '@/acy-dex-swap/core/launchPad';
import './css/LaunchpadProject.css';


const props = {
    'title': 'ACY Finance',
    'projectToken': 'ACY',
    'tokenLabels': [
        'PUBLIC',
        'BSC',
        'Topaz & higher',
        'NO.1'
    ],
    'salePercentage': '57',
    'totalSale': '1,000,000',
    'alreadySale': '573,024',
    'tokenPrice': '0.2',
    'projectDescription': [
        'ACY Finance is an anti-robot DEX. ACY invents Flash Arbitrage, a protocol level implementation that executes to reduce the arbitrage activities of miners and other kinds of arbitrage robots in each transaction.',
        'Flash Arbitrage is ACY Finance’s greatest innovation to fight against the MEV problem. It is an arbitrage strategy integrated into the protocol, aka written in the smart contract. It is executed automatically each time when the user initiates swap transactions. Similar to flash loans, flash arbitrage happens in an instant. But instead of one block, flash arbitrage happens in one single transaction along with your swap. Therefore there will be no more arbitrage opportunities after swap transactions as the protocol has already harvested the arbitrage benefits.',
        'Flash Arbitrage is a creation invented to help promote fair competition for users by ACY Finance. The team wants the solution to be Anti-MEV but also Anti-corruption to fight against the robots. In this new world created by ACY, the interest of both Traders and Liquidity Providers will be appreciated.'
    ]
}

const TokenBanner = () => {
    return (
        <video 
            autoplay="" 
            loop="" 
            playsinline="" 
            poster="https://files.krystal.app/krystalGo/acy-cover.png" 
            className="tokenBanner"
            >
                {/* <source src="https://files.krystal.app/krystalGo/acy-cover.png" /> */}
        </video>
    )
}

const TokenLogoLabel = () => {
    return (
        <div className="flexContainer">
            <img 
                className="tokenLogo"
                src="https://files.krystal.app/krystalGo/acy-avatar.svg" 
                loading="eager" 
            />
            <div className="tokenInfo">
                <h2 className="tokenTitle">{props.title}</h2>
                <div className="tokenLabelBar">
                    {
                        props.tokenLabels.map((label) => 
                            <span className="tokenLabel">{label}</span>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

const TokenProcedure = () => {

    const Procedure = () => {
        return (
            <div className="cardContent">
                <div className="procedure">
                    <hr aria-orientation="vertical" className="verticalDivideLine"></hr>
                    <div className="procedureNumber">1</div>
                    <div>
                        <p>Allocation</p>
                        <p className="shortText">From: 12/7/2021, 4:00:00 PM</p>
                        <p className="shortText">To: 12/10/2021, 4:00:00 PM</p>
                    </div>
                </div>

                <div className="procedure" style={{ marginTop: '24px' }}>
                    <hr aria-orientation="vertical" className="verticalDivideLine"></hr>
                    <div className="procedureNumber">2</div>
                    <div>
                        <p>Sale</p>
                        <p className="shortText">From: 12/11/2021, 4:00:00 PM</p>
                        <p className="shortText">To: 12/12/2021, 12:00:00 AM</p>
                    </div>
                </div>

                <div className="procedure" style={{ marginTop: '24px' }}>
                    <div className="procedureNumber">3</div>
                    <div>
                        <p>Vesting</p>
                    </div>
                </div>
                
            </div>
        );
    }

    const Progress = () => {
        
        const progressStyle = {
            width: props.salePercentage + '%'
        }

        return (
            <>
                <div className="cardContent" style={{
                    background: '#0f0f0f',
                    borderRadius: '0rem 0rem 1rem 1rem'
                }}>
                    <div className="progressHeader">
                        <p>Sale Progress</p>
                        <p style={{
                            color: '#eb5c1f'
                        }}>{props.salePercentage}%</p>
                    </div>
                    <div className="progressBar">
                        <div 
                            className="progressBarLight"
                            aria-aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={props.salePercentage}
                            role="progressbar"
                            style={progressStyle}
                        />
                    </div>
                    <div className="progressAmount">
                        <div>{`${props.alreadySale} / ${props.totalSale} ${props.projectToken}`}</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="circleBorderCard" style={{
            padding: 0
        }}>
            <Procedure />
            <Progress />
        </div>
    )
}

const KeyInformation = () => {
    return (
        <div className="circleBorderCard cardContent">
            <div className="keyinfoRow">
                <div className="keyinfoName">Total Sales</div>
                <div>{props.totalSale} {props.projectToken}</div>
            </div>

            <div className="keyinfoRow" style={{marginTop: '1rem'}}>
                <div className="keyinfoName">Total Raises</div>
                <div>{props.totalSale} {props.projectToken}</div>
            </div>

            <div className="keyinfoRow" style={{marginTop: '1rem'}}>
                <div className="keyinfoName">Rate</div>
                <div>1 {props.projectToken} = {props.tokenPrice} USDT</div>
            </div>
        </div>
    );
}

const ProjectDescription = () => {

    return (
        <div className="circleBorderCard cardContent">
            <div style={{display: 'block'}}>
                <h3>Project Description</h3>
                <div className="projectDescription">
                    {props.projectDescription && 
                        <p>{props.projectDescription[0]}</p>
                    }
                    {props.projectDescription &&
                        props.projectDescription.slice(1).map((desc) => 
                            <p style={{paddingTop: '2.5rem'}}>{desc}</p>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

const ChartCard = () => {

    const [chartData, setChartData] = useState([]);
    const [transferData,setTransferData] = useState([]);

    const recordNum = 100;
    const transferTableHeader = [
        {
            title: 'Date Time(UTC)',
            dataIndex: 'dateTime',
            className: 'column-date',
            width: 120,
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

        newChartData.splice(0, newChartData.length - recordNum);
        setTransferData(newTransferData);
        setChartData(newChartData);
    }, [])

    return (
        <div className="circleBorderCard cardContent">
            <LaunchChart  
                data={chartData}
                showXAxis
                showYAxis
                showGradient
                lineColor="#e29227"
                bgColor="#2f313500"
            />
            <Table
                style={{marginTop:'20px',textAlign:'center', height: '400px'}}
                id="transferTable"
                columns={transferTableHeader} 
                dataSource={transferData}
                pagination={false}
                scroll={{ y: 400 }}
            />  
        </div>
    );
}

const AllocationCard = ({ index, Component, select}) => {

    const onMouseEnter = (event) => (event.currentTarget.style["z-index"] = 10);
    const onMouseLeave = (event) => {
      const target = event.currentTarget;
      // Add a delay to leave enough time for the door to close
      setTimeout(() => {
        target.style["z-index"] = 1;
      }, 1000);
    };

    return (
        <div
            className="allocationCard"
            // onClick={() => select(index)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                background: 'rgba(255, 255, 255, 0.65)',
                width: '64px',
                height: '64px'
            }}
        >
            <div class="cover"></div>
            <Component size="0.6" />
        </div>
    )
}

const BaseCard = () => {
    return (
        <div style={{
            background: 'white'
        }}></div>
    );
}

const AllocationPurchase = () => {

    const allocationCards = () => {
        const cards = [];
        for(let i = 0; i < 24; i++) {
            cards.push(
                <AllocationCard index={i} Component={BaseCard}/>
            )
        }
        return cards;
    }

    return (
        <div className="circleBorderCard cardContent">
            <div className="centerTitle">
                <h2 style={{
                    textAlign: 'center',
                    color: '#FFFFFF'
                }}>Allocation</h2>
            </div>
            <div className="allocationContainer">
                {allocationCards()}
            </div>

            <div className="centerTitle">
                <h2 style={{
                    textAlign: 'center',
                    color: '#FFFFFF'
                }}>Purchase</h2>
            </div>
        </div>
    );
}

const CardArea = () => {
    return (
        <div className="gridContainer">
            <div className="leftGrid">
                <TokenProcedure />
                <KeyInformation />
            </div>
            <div className="rightGrid">
                <AllocationPurchase />
                <ProjectDescription />
                <ChartCard />
            </div>
        </div>
    )
}



const Footer = () => {
    return (
        <div className="circleBorderCard">
            <h1 
            className="cardContent"
            style={{
                color: 'white'
            }}>Footer</h1>
        </div>
    );
}


const LaunchpadProject = () => {    
    return(
        <div className="mainContainer">
            <TokenBanner />
            <TokenLogoLabel />
            <CardArea />
            <Footer />
        </div>
    );
}

export default LaunchpadProject;
