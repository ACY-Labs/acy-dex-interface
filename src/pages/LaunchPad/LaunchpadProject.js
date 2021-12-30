/* eslint-disable react/jsx-indent */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Progress, Button, Table } from 'antd';
import { history } from 'umi';
import styles from "./styles.less"
import LaunchChart from './launchChart';
import { getTransferData } from '@/acy-dex-swap/core/launchPad';
import { requireAllocation, getAllocationInfo, getProjectInfo } from '@/services/api';
import { BigNumber } from '@ethersproject/bignumber';
import ERC20ABI from '@/abis/ERC20.json';
import { binance, injected } from '@/connectors';
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import './css/LaunchpadProject.css';
import project from '@/models/project';
import AllocationIcon from './components/AllocationIcon';
import * as moment from 'moment';
import context from 'react-bootstrap/esm/AccordionContext';
import { CaretDownOutlined } from '@ant-design/icons';
import VestingSchedule from './VestingSchedule';
import SocialMedia from './SocialMedia'
import telegramWIcon from '@/assets/icon_telegram_white.svg';
import etherIcon from '@/assets/icon_etherscan.svg';
import polyIcon from '@/assets/icon_polyscan.svg';
import linkedinIcon from '@/assets/icon_linkedin.svg';
import mediumIcon from '@/assets/icon_medium.svg';
import youtubeIcon from '@/assets/icon_youtube.svg';
import githubIcon from '@/assets/icon_github.svg';
import twitterWIcon from '@/assets/icon_twitter_white.svg';
import linkWIcon from '@/assets/icon_link_white.svg';
import fileWIcon from '@/assets/icon_file_white.svg';
import announcementFIcon from '@/assets/icon_announcement_fill.svg';
import $ from 'jquery';
import { getContract } from "../../acy-dex-swap/utils/index.js"
import { useWeb3React } from '@web3-react/core';
import POOLABI from "@/acy-dex-swap/abis/AcyV1Poolz.json";

// Example links for social medias
// const links = [
//   'https://t.me/acyfinance',
//   'https://t.me/ACYFinanceChannel',
//   'https://twitter.com/ACYFinance',
//   'https://acy.finance/',
//   'https://github.com/ACY-Labs/ACY-Finance-Whitepaper'
// ]

const LaunchpadProject = () => {
  console.log($(document).height());
  
  const { account, chainId, library, activate, active } = useWeb3React();
  const connectWallet = async () =>  {
    activate(binance);
    activate(injected);
  };

  const { projectId } = useParams();
  const [receivedData, setReceivedData] = useState({});
  const [poolBaseData, setPoolBaseData] = useState(null);
  const [poolDistributionDate, setDistributionDate] = useState(null);
  const [poolDistributionStage, setpoolDistributionStage] = useState(null);
  const [poolStageCount, setpoolStageCount] = useState(0);
  const [isVesting, setIsVesting] = useState(false);
  const [comparesaleDate, setComparesaleDate] = useState(false);
  const [comparevestDate, setComparevestDate] = useState(false);
  // const [investorNum,setinvestorNum] = useState(0);

  console.log("-------POSTERURL---------")
  console.log(receivedData.posterUrl)

  const TokenBanner = ({ posterUrl }) => {
    return (
      <img
        className="tokenBanner"
        src={posterUrl}
        alt=""
      />
    );
  };

  const clickToWebsite = () => {
    const newWindow = window.open(receivedData.website, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }

  const TokenLogoLabel = ({ projectName, tokenLogo}) => {
    return (
      <div className="flexContainer">
        <img
          className="tokenLogo"
          alt=""
          src={tokenLogo}
          loading="eager"
          onClick={() => clickToWebsite()}
        />
        <div className="tokenInfo">
          <span className="tokenTitle" onClick={() => clickToWebsite()}>{projectName}</span>
          <div className="tokenLabelBar">
            {receivedData.tokenLabels &&
              receivedData.tokenLabels.map(label => <span className="tokenLabel">{label}</span>)}
          </div>
        </div>
      </div>
    );
  };

  const TokenProcedure = () => {
    const Procedure = () => {
      return (
        <div className="cardContent">
          <div className="procedure">
            <hr aria-orientation="vertical" className="verticalDivideLine" />
            <div className="procedureNumber">1</div>
            <div>
              <p>Allocation</p>
              {/* <p className="shortText">Start : {receivedData.regStart}</p>
              <p className="shortText">End : {receivedData.regEnd}</p> */}
            </div>
          </div>

          <div className="procedure" style={{ marginTop: '24px' }}>
            <hr
              aria-orientation="vertical"
              className={comparesaleDate ? 'verticalDivideLine' : 'verticalDivideLine_NotActive'}
            />
            <div className={comparesaleDate ? 'procedureNumber' : 'procedureNumber_NotActive'}>
              2
            </div>
            {poolBaseData &&
              <div>
                <p>Sale</p>
                <p className="shortText">From : {poolBaseData[2]}</p>
                <p className="shortText">To : {poolBaseData[3]}</p>
              </div>
            }
          </div>

          <div className="procedure" style={{ marginTop: '24px' }}>
            <div className={comparevestDate ? 'procedureNumber' : 'procedureNumber_NotActive'}>
              3
            </div>
            <div>
              <p>Vesting</p>
            </div>
          </div>
        </div>
      );
    };

    const ProgressBar = ({ alreadySale, totalSale, projectToken }) => {
      const salePercentage = Number(alreadySale) / Number(totalSale)
      const progressStyle = {
        width: { salePercentage } + '%',
      };

      return (
        <>
          <div
            className="cardContent"
            style={{ background: '#1a1d1c', borderRadius: '0rem 0rem 1rem 1rem' }}
          >
            <div className="progressHeader">
              <p>Sale Progress</p>
              <p style={{ color: '#eb5c1f' }}>{salePercentage}%</p>
            </div>
            {/* <div className="progressBar">
              <div
                className="progressBarLight"
                aria-aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={salePercentage}
                role="progressbar"
                style={progressStyle}
              />
            </div> */}
            <div className={styles.tokenProgress}>
              <Progress
                strokeColor={{
                  from: '#c6224e',
                  to: '#eb6c20',
                }}
                percent={salePercentage}
                status={salePercentage === 0 ? "normal" : salePercentage !== 100 ? "active" :"success"}
              />
            </div>
            <div className="progressAmount">
              <div>{`${alreadySale} / ${totalSale} ${projectToken}`}</div>
            </div>
          </div>
        </>
      );
    };

    return (
      <div
        className="circleBorderCard"
        style={{
          padding: 0,
        }}
      >
        <Procedure />
        {poolBaseData &&
          <ProgressBar
            alreadySale={poolBaseData[1]}
            totalSale={poolBaseData[0]}
            projectToken={receivedData.projectToken}
          />
        }
      </div>
    );
  };

  const KeyInformation = ({ projectToken, totalSale, tokenPrice }) => {
    return (
      <div className="circleBorderCard cardContent">
        <div className="keyinfoRow">
          <div className="keyinfoName">Total Sales</div>
          <div>
            {totalSale} {projectToken}
          </div>
        </div>

        <div className="keyinfoRow" style={{ marginTop: '1rem' }}>
          <div className="keyinfoName">Total Raise</div>
          <div>
            {receivedData.totalSale} USDT
          </div>
        </div>

        <div className="keyinfoRow" style={{ marginTop: '1rem' }}>
          <div className="keyinfoName">Rate</div>
          <div>
            1 {projectToken} = {tokenPrice} USDT
          </div>
        </div>
      </div>
    );
  };

  const logoObj = {
    "telegram": telegramWIcon,
    "twitter": twitterWIcon,
    "website": linkWIcon,
    "whitepaper": fileWIcon,
    "linkedin": linkedinIcon,
    "medium": mediumIcon,
    "youtube": youtubeIcon,
    "github": githubIcon,
    "etheraddress": etherIcon,
    "polyaddress": polyIcon,
  }

  const ProjectDescription = () => {
    return (
      <div className="circleBorderCard cardContent">
        <div style={{ display: 'block' }}>
          <div className='projecttitle-socials-container'>
            <h3 className='projecttitle'>Project Description</h3>
            <div className=''>
              {receivedData.social && receivedData.social[0] &&
                <div id='social container' className='social-container'>
                  { Object.entries(receivedData.social[0]).map((item)=>{
                    if(item[1] !== null ){
                      console.log(item)
                      return (
                      <SocialMedia url={logoObj[item[0]]} link={item[1]} />)
                    }
                  })}
                </div>}
              
            </div>
          </div>
          
          <span className="lineSeperator" />
          <div className="projectDescription">
            {receivedData.projectDescription && <p>{receivedData.projectDescription[0]}</p>}
            {receivedData.projectDescription &&
              receivedData.projectDescription
                .slice(1)
                .map(desc => <p style={{ paddingTop: '2rem' }}>{desc}</p>)}
          </div>
        </div>
      </div>
    );
  };

  const ChartCard = () => {
    const [chartData, setChartData] = useState([]);
    const [transferData, setTransferData] = useState([]);

    const recordNum = 100;
    const transferTableHeader = [
      {
        title: 'Date Time(UTC)',
        dataIndex: 'dateTime',
        className: 'column-date',
        width: 80,
        align: 'left',
      },
      {
        title: 'Participants',
        dataIndex: 'participant',
        width: 60,
        align: 'left',
        ellipsis: true,
      },
      {
        title: 'USDT',
        dataIndex: 'quantity',
        width: 60,
        align: 'left',
        ellipsis: true,
      },
      {
        title: 'Token',
        dataIndex: 'Amount',
        width: 60,
        align: 'left',
        ellipsis: true,
      },
    ];

    const ellipsisCenter = (str, preLength = 6, endLength = 4, skipStr = '...') => {
      const totalLength = preLength + skipStr.length + endLength;
      if (str.length > totalLength) {
        return str.substr(0, preLength) + skipStr + str.substr(str.length - endLength, str.length);
      }
      return str;
    };

    useEffect(async () => {
      const [newTransferData, newChartData] = await getTransferData();

      // ellipsis center address
      newTransferData.forEach(data => {
        data['participant'] = ellipsisCenter(data['participant']);
      });

      newChartData.splice(0, newChartData.length - recordNum);
      setTransferData(newTransferData);
      setChartData(newChartData);
    }, []);

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
          id="transferTable"
          columns={transferTableHeader}
          dataSource={transferData}
          pagination={false}
          scroll={{ y: 400 }}
        />
      </div>
    );
  };

  const AllocationCard = ({
    index,
    Component,
    allocationAmount,
    setAllocationAmount,
    walletId,
    projectToken,
  }) => {
    const [coverOpenState, setCoverOpenState] = useState(false);
    const computeCoverClass = () => {
      let classString = 'cover';
      if (coverOpenState) {
        classString += ' openCover';
      }
      return classString;
    };

    // if allocation is done, cover cannot be opened
    // otherwise, require an allocation from server
    const clickCover = async e => {
      console.log('click cover', allocationAmount);
      const oldAllocationAmount = allocationAmount;
      if (oldAllocationAmount !== 0) {
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
    };

    return (
      <div className="allocationCard" onClick={clickCover}>
        
        <div class={computeCoverClass()}>
          <div
            className="allocationCard-inner"
          >
            <p className="inner-text">{index + 1}</p>
          </div>
        </div>
        <p className="inner-text-amount">${allocationAmount}</p>
      </div>
    );
  };

  const Allocation = ({ walletId, projectToken, maxSalesAmount=1000 }) => {
    const [allocationAmount, setAllocationAmount] = useState(0);

    useEffect(async () => {
      // get allocation status from backend at begining
      await getAllocationInfo(walletId, projectToken)
        .then(res => {
          if (res && res.allocationAmount) {
            setAllocationAmount(res.allocationAmount);
            console.log('allocation amount', res.allocationAmount);
          }
        })
        .catch(e => {
          console.error(e);
        });
    }, []);

    // TODO: replace with 24 icon
    const BaseCard = ({ url }) => {
      return (
        <div style={{ background: 'white', height: '80px', width: '80px', borderRadius: '4px' }}>
          {/* <AllocationIcon play={true} url={url} id="apple"/> */}
        </div>
      );
    };

    // TODO: assign each icon to allocation card
    const allocationCards = () => {
      const cards = [];

      for (let i = 0; i < 10; i++) {
        cards.push(
          <AllocationCard
            index={i}
            Component={BaseCard}
            allocationAmount={allocationAmount}
            setAllocationAmount={setAllocationAmount}
            walletId={walletId}
            projectToken={project}
          />
        );
      }
      return cards;
    };

    const [isClickedVesting, setIsClickedVesting] = useState(false);
    const [salesValue, setSalesValue] = useState();

    return (
      <div>
      { !isVesting ? 
        <div
          className={
            isClickedVesting
              ? 'cardContent allocation-content allocation-content-active'
              : 'cardContent allocation-content allocation-content-inactive'
          }
        >
          <div className="allocation-title-container">
            <p className="allocation-title">Allocation</p>
            <div className='allocation-cards'>
              <div className="allocationContainer">{allocationCards()}</div>
            </div>
            <div style={{"width": "120px"}}>

            </div>
          </div>

          <form className="sales-container">
            <label for="sale-number" className="sale-vesting-title">
              Sale
            </label>
            <div className="sales-input-container">
              <input placeholder="Enter amount" className="sales-input" type="number" value={salesValue} onChange={e => setSalesValue(e.target.value)} />
              <Button className="max-btn" onClick={() => setSalesValue(allocationAmount)}>MAX</Button>
            </div>
            <Button className="sales-submit" onClick={() => console.log("buy")} disabled={!comparesaleDate}> Buy </Button>
          </form>

          { (poolDistributionDate && poolDistributionStage) &&
            <div className="vesting-container">
              <p className="sale-vesting-title vesting">Vesting</p>
              <div className="text-line-container">
                <p>{poolStageCount} stages of vesting : Unlock {poolDistributionStage[0]}% TGE</p>
                <span className="vesting-line" />
                <div
                  className={
                    isClickedVesting ? 'vesting-schedule vesting-schedule-active' : 'vesting-schedule'
                  }
                >
                    <VestingSchedule vestingDate={poolDistributionDate} stageData={poolDistributionStage} />
                </div>
              </div>
              <div className="arrow-down-container">
                <CaretDownOutlined
                  className={
                    isClickedVesting ? 'arrow-down-active arrow-down' : 'arrow-down-inactive arrow-down'
                  }
                />
              </div>
              <div className='vesting-trigger-container' onClick={() => setIsClickedVesting(!isClickedVesting)}>
              </div>
            </div>
          }
        </div>
      :
        <div className="vesting-container">
          <p className="sale-vesting-title vesting">Vesting</p>
          <div className="text-line-container">
            <p>Vesting is divided into {poolStageCount} stages, unlock {poolDistributionStage[0]}% TGE</p>
            <span className="vesting-line" />
            <div className='vesting-schedule'>
              <VestingSchedule vestingDate={poolDistributionDate} stageData={poolDistributionStage} />
            </div>
          </div>
        </div>
      }
      </div>
    );
  };

  const CardArea = () => {
    return (
      <div className="gridContainer">
        <div className="leftGrid">
          <TokenProcedure />
          {poolBaseData &&
            <KeyInformation
              projectToken={receivedData.projectToken}
              totalSale={poolBaseData[0]}
              tokenPrice={receivedData.tokenPrice}
            />
          }
          
        </div>
        <div className="rightGrid">
          <div className="circleBorderCard">
            <Allocation walletId="1234" projectToken="ACY" />
          </div>
          <ProjectDescription />
          <ChartCard />
        </div>
      </div>
    );
  };

  const format_time = timeZone => {
    return moment(timeZone)
      .local()
      .format('MM/DD/YYYY HH:mm:ss');
  };

  useEffect(() => {
    getProjectInfo(projectId)
      .then(res => {
        if (res) {
          // extract data from string
          const contextData = JSON.parse(res.contextData);

          res['tokenLabels'] = contextData['tokenLabels'];
          res['projectDescription'] = contextData['projectDescription'];
          res['alreadySale'] = contextData['alreadySale'];
          res['salePercentage'] = contextData['salePercentage'];
          res['posterUrl'] = contextData['posterUrl']
          res['tokenLogoUrl'] = contextData['tokenLogoUrl']

          res['regStart'] = format_time(res.regStart);
          res['regEnd'] = format_time(res.regEnd);
          res['saleStart'] = format_time(res.saleStart);
          res['saleEnd'] = format_time(res.saleEnd);

          res['totalSale'] = res.totalSale;
          res['totalRaise'] = res.totalRaise;
          res['projectUrl'] = res.projectUrl;
          res['projectName'] = res.projectName;

          setReceivedData(res);
        } else {
          console.log('redirect to list page');
          history.push('/launchpad');
        }
      })
      .catch(e => {
        console.error(e);
        history.push('/launchpad');
      });
  }, []);

  const convertUnixTime = unixTime => {
    const data = new Date((Number(unixTime)) * 1000)
    const res = data.toLocaleString()
    return res
  }

  const getPoolData = async (lib, acc) => {
    const poolContract = getContract("0x6e0EC29eA8afaD2348C6795Afb9f82e25F196436", POOLABI, lib, acc);
    const pool = []
    const distributionRes = []
    const distributionStage = []

    // 合约函数调用
    const baseData = await poolContract.GetPoolBaseData(3)
    const distributionData = await poolContract.GetPoolDistributionData(3)
    // getpoolbasedata 数据解析
    const token1contract = getContract(baseData[0], ERC20ABI, lib, acc)
    const token1decimal = await token1contract.decimals()
    // 不解析时间戳
    const res1 = BigNumber.from(baseData[2]).toBigInt().toString().slice(0,-(token1decimal)) // 获取销售的token的总数
    const res2 = BigNumber.from(baseData[3]).toBigInt().toString().slice(0,-(token1decimal)) // 已销售的token的数量
    const res3 = BigNumber.from(baseData[4]).toBigInt()
    const res4 = BigNumber.from(baseData[5]).toBigInt()
    // 获取当前阶段
    const d = Math.round(new Date().getTime()/1000)
    if(d > res3) setComparesaleDate(true)
    if(d > res4) setComparevestDate(true)
    const saleStartDate = convertUnixTime(res3)
    const saleEndDate = convertUnixTime(res4)
    // 存放数据
    pool.push(res1, res2, saleStartDate, saleEndDate)

    // getpooldistributiondata 数据解析以及存放
    distributionData[1].map(uTime => distributionRes.push(convertUnixTime(uTime)))
    distributionData[2].map(vestingRate => distributionStage.push(BigNumber.from(vestingRate).toBigInt().toString()))

    // 判断当前是否是vesting阶段
    const tempArr = distributionData[1]
    if(d > tempArr[0]) setIsVesting(true)
    // set数据
    setPoolBaseData(pool)
    setDistributionDate(distributionRes)
    setpoolStageCount(Number(BigNumber.from(distributionData[0]).toBigInt())) // vesting阶段的次数
    setpoolDistributionStage(distributionStage)
  }

  // fetching data from Smart Contract
  useEffect(async () => {
    if(!account){
      connectWallet();
    }
    if (account || library){
      console.log("start getPoolBaseData")
      getPoolData(library, account)
    } else {
      const provider = new JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/", 97);  // different RPC for mainnet
      const accnt = "0x0000000000000000000000000000000000000000";
      getPoolData(provider, accnt)
    }
  }, [library, account])

  return (
    <div>
      <div className="mainContainer">
        <TokenBanner posterUrl={receivedData.posterUrl} />
        <TokenLogoLabel projectName={receivedData.projectName} tokenLogo={receivedData.tokenLogoUrl} />
        <CardArea />
      </div>
    </div>
  );
};

export default LaunchpadProject;
