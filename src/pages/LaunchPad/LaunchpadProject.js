/* eslint-disable react/jsx-indent */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { history } from 'umi';
import { Table } from 'antd';
import LaunchChart from "./launchChart";
import { getTransferData } from '@/acy-dex-swap/core/launchPad';
import { 
    requireAllocation, 
    getAllocationInfo,
    getProjectInfo
} from '@/services/api';
import './css/LaunchpadProject.css';
import project from '@/models/project';


const props= {
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

const TokenBanner = (posterSource) => {
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

const TokenLogoLabel = ({title}) => {
    return (
        <div className="flexContainer">
            <img 
              className="tokenLogo"
              alt=""
              src="https://files.krystal.app/krystalGo/acy-avatar.svg" 
              loading="eager" 
            />
            <div className="tokenInfo">
                <h2 className="tokenTitle">{title}</h2>
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

    const Progress = ({salePercentage, alreadySale, totalSale, projectToken}) => {
        
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
            <Progress salePercentage={props.salePercentage} alreadySale={props.alreadySale} totalSale={props.totalSale} projectToken={props.projectToken} />
        </div>
    )
}

const KeyInformation = (projectToken, totalSale, tokenPrice) => {
    return (
        <div className="circleBorderCard cardContent">
            <div className="keyinfoRow">
                <div className="keyinfoName">Total Sales</div>
                <div>{totalSale} {projectToken}</div>
            </div>

            <div className="keyinfoRow" style={{marginTop: '1rem'}}>
                <div className="keyinfoName">Total Raises</div>
                <div>{totalSale} {projectToken}</div>
            </div>

            <div className="keyinfoRow" style={{marginTop: '1rem'}}>
                <div className="keyinfoName">Rate</div>
                <div>1 {projectToken} = {tokenPrice} USDT</div>
            </div>
        </div>
    );
}

const ProjectDescription = (projectDescription) => {

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

const AllocationCard = ({ 
    index, 
    Component, 
    allocationAmount, 
    setAllocationAmount, 
    walletId, 
    projectToken 
}) => {
    
    const [coverOpenState, setCoverOpenState] = useState(false);
    const computeCoverClass = () => {
        let classString = 'cover';
        if(coverOpenState) {
            classString += ' openCover';
        }
        return classString;
    }

    // if allocation is done, cover cannot be opened
    // otherwise, require an allocation from server
    const clickCover = async (e) => {
        console.log('click cover', allocationAmount);
        const oldAllocationAmount = allocationAmount;
        if (oldAllocationAmount === 0) {
            requireAllocation(walletId, projectToken).then(res => {
                if(res && res.allocationAmount) {
                    setAllocationAmount(res.allocationAmount);
                    setCoverOpenState(true);
                }
                console.log('allocation get', res.allocationAmount);
            }).catch(e => {
                console.error(e);
            })
        }
        e.preventDefault();
    }

    return (
        <div
            className="allocationCard"
            onClick={clickCover}
        >
            <div class={computeCoverClass()}>{index+1}</div>
            <Component />
        </div>
    )
}

const Allocation = ({walletId, projectToken}) => {

    const [allocationAmount, setAllocationAmount] = useState(0);

    useEffect(async () => {
        // get allocation status from backend at begining
        await getAllocationInfo(walletId, projectToken).then(res => {
            if (res && res.allocationAmount) {
                setAllocationAmount(res.allocationAmount);
                console.log('allocation amount', res.allocationAmount);
            }
        }).catch(e => {
            console.error(e);
        });
    }, [])

    // TODO: replace with 24 icon
    const BaseCard = () => {
        return (
            <div style={{
                background: 'white'
            }}></div>
        );
    }

    // TODO: assign each icon to allocation card
    const allocationCards = () => {
        const cards = [];
        for(let i = 0; i < 24; i++) {
            cards.push(
                <AllocationCard 
                    index={i} 
                    Component={BaseCard} 
                    allocationAmount={allocationAmount}
                    setAllocationAmount={setAllocationAmount}
                    walletId={walletId}
                    projectToken={project}
                />
            )
        }
        return cards;
    }

    return (
        <div className="cardContent">
            <div className="centerTitle">
                <h2 style={{
                    textAlign: 'center',
                    color: '#FFFFFF'
                }}>Allocation</h2>
            </div>
            <div className="allocationContainer">
                {allocationCards()}
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
                <div className="circleBorderCard">
                    <Allocation walletId="1234" projectToken="ACY"/>
                </div>
                <ProjectDescription />
                <ChartCard />
            </div>
        </div>
    )
}

const projectInfoTemplate = {
    title: 'ACY Finance',
    tokenLabels: [
        'PUBLIC',
        'BSC',
        'Topaz & higher',
        'NO.1'
    ],
    salePercentage: '57',
    totalSale: '1,000,000',
    alreadySale: '573,024',
    tokenPrice: '0.2',
    projectDescription: [
        'ACY Finance is an anti-robot DEX. ACY invents Flash Arbitrage, a protocol level implementation that executes to reduce the arbitrage activities of miners and other kinds of arbitrage robots in each transaction.',
        'Flash Arbitrage is ACY Finance’s greatest innovation to fight against the MEV problem. It is an arbitrage strategy integrated into the protocol, aka written in the smart contract. It is executed automatically each time when the user initiates swap transactions. Similar to flash loans, flash arbitrage happens in an instant. But instead of one block, flash arbitrage happens in one single transaction along with your swap. Therefore there will be no more arbitrage opportunities after swap transactions as the protocol has already harvested the arbitrage benefits.',
        'Flash Arbitrage is a creation invented to help promote fair competition for users by ACY Finance. The team wants the solution to be Anti-MEV but also Anti-corruption to fight against the robots. In this new world created by ACY, the interest of both Traders and Liquidity Providers will be appreciated.'
    ]
}

const LaunchpadProject = () => {

    // TODO: use real data, instead of template data
    const [projectInfo, setProjectInfo] = useState(projectInfoTemplate);
    const { projectId } = useParams();

    useEffect(() => {
        getProjectInfo(projectId).then(res => {
            if(res) {
                console.log(res);
            } else {
                console.log('redirect to list page');
                history.push('/launchpad');
            }
        }).catch(e => console.error(e));
    }, [])

    return(
        <div className="mainContainer">
            <TokenBanner />
            <TokenLogoLabel />
            <CardArea />
        </div>
    );
}

export default LaunchpadProject;
