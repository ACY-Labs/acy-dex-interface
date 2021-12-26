/* eslint-disable react/jsx-indent */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { history } from 'umi';
import { Icon, Table } from 'antd';
import LaunchChart from './launchChart';
import { getTransferData } from '@/acy-dex-swap/core/launchPad';
import { requireAllocation, getAllocationInfo, getProjectInfo } from '@/services/api';
import './css/LaunchpadProject.css';
import project from '@/models/project';
import AllocationIcon from './components/AllocationIcon';
import Lottie from '@/assets/lottie/json';
import * as moment from 'moment';
import context from 'react-bootstrap/esm/AccordionContext';
import { CaretDownOutlined } from '@ant-design/icons';
import VestingSchedule from './VestingSchedule';
import SocialMedia from './SocialMedia'
import telegramWIcon from '@/assets/icon_telegram_white.svg';
import telegramOIcon from '@/assets/icon_telegram_orange.svg';
import twitterWIcon from '@/assets/icon_twitter_white.svg';
import linkWIcon from '@/assets/icon_link_white.svg';
import fileWIcon from '@/assets/icon_file_white.svg';
import announcementIcon from '@/assets/icon_announcement.svg';
import announcementFIcon from '@/assets/icon_announcement_fill.svg';
import $ from 'jquery';

const {
  apple,
  banana,
  brezel,
  burger,
  carrot,
  cheese,
  cherry,
  chocolateBar,
  corn,
  donut,
  eggs,
  frenchFries,
  honey,
  iceCream,
  lemon,
  meat,
  peach,
  pineapple,
  pizza,
  popcorn,
  raspberry,
  steak,
  strawberry,
  watermelon,
} = Lottie;

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
  

  const { projectId } = useParams();
  const [receivedData, setReceivedData] = useState({});
  const [comparesaleDate, setComparesaleDate] = useState(false);
  const [comparevestDate, setComparevestDate] = useState(false);

  console.log("--------------RECEIVEDDATA---------------")
  console.log(receivedData);

  const TokenBanner = ({ posterUrl }) => {
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
    );
  };

  const TokenLogoLabel = ({ projectName }) => {
    return (
      <div className="flexContainer">
        <img
          className="tokenLogo"
          alt=""
          src="https://files.krystal.app/krystalGo/acy-avatar.svg"
          loading="eager"
        />
        <div className="tokenInfo">
          <span className="tokenTitle">{projectName}</span>
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
            <div>
              <p>Sale</p>
              <p className="shortText">From : {receivedData.saleStart}</p>
              <p className="shortText">To : {receivedData.saleEnd}</p>
            </div>
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

    const Progress = ({ salePercentage, alreadySale, totalSale, projectToken }) => {
      const progressStyle = {
        width: { salePercentage } + '%',
      };

      return (
        <>
          <div
            className="cardContent"
            style={{ background: '#0f0f0f', borderRadius: '0rem 0rem 1rem 1rem' }}
          >
            <div className="progressHeader">
              <p>Sale Progress</p>
              <p style={{ color: '#eb5c1f' }}>{salePercentage}%</p>
            </div>
            <div className="progressBar">
              <div
                className="progressBarLight"
                aria-aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={salePercentage}
                role="progressbar"
                style={progressStyle}
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
        <Progress
          salePercentage={receivedData.salePercentage}
          alreadySale={receivedData.alreadySale}
          totalSale={receivedData.totalSale}
          projectToken={receivedData.projectToken}
        />
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
            {totalSale} {projectToken}
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
    "whitepaper": fileWIcon
  }

  const ProjectDescription = () => {
    return (
      <div className="circleBorderCard cardContent">
        <div style={{ display: 'block' }}>
          <div className='projecttitle-socials-container'>
            <h3 className='projecttitle'>Project Description</h3>
            <div className='social-container'>
              {receivedData.social && receivedData.social[0] &&
                <div id='social container'>
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
        width: 120,
        align: 'left',
      },
      {
        title: 'Participants',
        dataIndex: 'participant',
        width: 80,
        align: 'center',
        ellipsis: true,
      },
      {
        title: 'USDT',
        dataIndex: 'quantity',
        width: 60,
        align: 'center',
        ellipsis: true,
      },
      {
        title: 'Ticket',
        dataIndex: 'Amount',
        width: 60,
        align: 'center',
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
          style={{ marginTop: '20px', textAlign: 'center', height: '400px' }}
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
    url,
    lottieId,
    isHoverLottie,
    setIsHoverLottie,
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
    };

    return (
      <div className="allocationCard" onClick={clickCover}>
        <div class={computeCoverClass()}>
          <div
            className="allocationCard-inner"
            onMouseEnter={() => setIsHoverLottie(true)}
            onMouseLeave={() => setIsHoverLottie(false)}
          >
            <p className="inner-text">{index + 1}</p>
          </div>
        </div>
      </div>
    );
  };

  const Allocation = ({ walletId, projectToken }) => {
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
      // ALL 24 States
      const [isHoverApple, setIsHoverApple] = useState(false);
      const [isHoverBanana, setIsHoverBanana] = useState(false);
      const [isHoverBrezel, setIsHoverBrezel] = useState(false);
      const [isHoverBurger, setIsHoverBurger] = useState(false);
      const [isHoverCarrot, setIsHoverCarrot] = useState(false);
      const [isHoverCheese, setIsHoverCheese] = useState(false);
      const [isHoverCherry, setIsHoverCherry] = useState(false);
      const [isHoverChocolateBar, setIsHoverChocolateBar] = useState(false);
      const [isHoverCorn, setIsHoverCorn] = useState(false);
      const [isHoverDonut, setIsHoverDonut] = useState(false);
      const [isHoverEggs, setIsHoverEggs] = useState(false);
      const [isHoverFrenchFries, setIsHoverFrenchFries] = useState(false);
      const [isHoverHoney, setIsHoverHoney] = useState(false);
      const [isHoverIceCream, setIsHoverIceCream] = useState(false);
      const [isHoverLemon, setIsHoverLemon] = useState(false);
      const [isHoverMeat, setIsHoverMeat] = useState(false);
      const [isHoverPeach, setIsHoverPeach] = useState(false);
      const [isHoverPineapple, setIsHoverPineapple] = useState(false);
      const [isHoverPizza, setIsHoverPizza] = useState(false);
      const [isHoverPopcorn, setIsHoverPopcorn] = useState(false);
      const [isHoverRaspberry, setIsHoverRaspberry] = useState(false);
      const [isHoverSteak, setIsHoverSteak] = useState(false);
      const [isHoverStrawberry, setIsHoverStrawberry] = useState(false);
      const [isHoverWatermelon, setIsHoverWatermelon] = useState(false);

      const url = [
        apple,
        banana,
        brezel,
        burger,
        carrot,
        cheese,
        cherry,
        chocolateBar,
        corn,
        donut,
        eggs,
        frenchFries,
        honey,
        iceCream,
        lemon,
        meat,
        peach,
        pineapple,
        pizza,
        popcorn,
        raspberry,
        steak,
        strawberry,
        watermelon,
      ];
      const lottieId = [
        'apple',
        'banana',
        'brezel',
        'burger',
        'carrot',
        'cheese',
        'cherry',
        'chocolateBar',
        'corn',
        'donut',
        'eggs',
        'frenchFries',
        'honey',
        'iceCream',
        'lemon',
        'meat',
        'peach',
        'pineapple',
        'pizza',
        'popcorn',
        'raspberry',
        'steak',
        'strawberry',
        'watermelon',
      ];
      const states = [
        isHoverApple,
        isHoverBanana,
        isHoverBrezel,
        isHoverBurger,
        isHoverCarrot,
        isHoverCheese,
        isHoverCherry,
        isHoverChocolateBar,
        isHoverCorn,
        isHoverDonut,
        isHoverEggs,
        isHoverFrenchFries,
        isHoverHoney,
        isHoverIceCream,
        isHoverLemon,
        isHoverMeat,
        isHoverPeach,
        isHoverPineapple,
        isHoverPizza,
        isHoverPopcorn,
        isHoverRaspberry,
        isHoverSteak,
        isHoverStrawberry,
        isHoverWatermelon,
      ];
      const stateFunction = [
        setIsHoverApple,
        setIsHoverBanana,
        setIsHoverBrezel,
        setIsHoverBurger,
        setIsHoverCarrot,
        setIsHoverCheese,
        setIsHoverCherry,
        setIsHoverChocolateBar,
        setIsHoverCorn,
        setIsHoverDonut,
        setIsHoverEggs,
        setIsHoverFrenchFries,
        setIsHoverHoney,
        setIsHoverIceCream,
        setIsHoverLemon,
        setIsHoverMeat,
        setIsHoverPeach,
        setIsHoverPineapple,
        setIsHoverPizza,
        setIsHoverPopcorn,
        setIsHoverRaspberry,
        setIsHoverSteak,
        setIsHoverStrawberry,
        setIsHoverWatermelon,
      ];
      for (let i = 0; i < 10; i++) {
        cards.push(
          <AllocationCard
            index={i}
            Component={BaseCard}
            url={url[i]}
            lottieId={lottieId[i]}
            isHoverLottie={states[i]}
            setIsHoverLottie={stateFunction[i]}
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

    return (
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
            <input placeholder="" className="sales-input" type="number" />
            {/* <button className="max-btn">MAX</button> */}
          </div>
          <input type="submit" className="sales-submit" value="Buy" />
        </form>

        <div className="vesting-container" >
          <p className="sale-vesting-title vesting">Vesting</p>
          <div className="text-line-container">
            <p>Unlock 30% TGE, then vested 23.3% every month for 3 months</p>
            <span className="vesting-line" />
            <div
              className={
                isClickedVesting ? 'vesting-schedule vesting-schedule-active' : 'vesting-schedule'
              }
            >
              <VestingSchedule />
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
      </div>
    );
  };

  const CardArea = () => {
    return (
      <div className="gridContainer">
        <div className="leftGrid">
          <TokenProcedure />
          <KeyInformation
            projectToken={receivedData.projectToken}
            totalSale={receivedData.totalSale}
            tokenPrice={receivedData.tokenPrice}
          />
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
          console.log("RECeiveddata",res);
          const contextData = JSON.parse(res.contextData);

          const today = new Date();
          if (today > res.saleStart) setComparesaleDate(true);
          if (today > res.saleEnd) setComparevestDate(true);

          res['tokenLabels'] = contextData['tokenLabels'];
          res['projectDescription'] = contextData['projectDescription'];
          res['alreadySale'] = contextData['alreadySale'];
          res['salePercentage'] = contextData['salePercentage'];

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

  return (
    <div>
      <div className="mainContainer">
        <TokenBanner posterUrl={receivedData.posterUrl} />
        <TokenLogoLabel projectName={receivedData.projectName} />
        <CardArea />
      </div>
    </div>
  );
};

export default LaunchpadProject;
