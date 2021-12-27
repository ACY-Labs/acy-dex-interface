import { useWeb3React } from '@web3-react/core';
import { binance, injected } from '@/connectors';
import React, { Component, useState, useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { connect } from 'umi';
import { Button, Row, Col, Icon, Skeleton, Card } from 'antd';
import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyPriceChart,
  AcyConfirm,
  AcyApprove,
} from '@/components/Acy';
import Media from 'react-media';
import AcyPieChart from '@/components/AcyPieChartAlpha';
import AcyRoutingChart from '@/components/AcyRoutingChart';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { uniqueFun } from '@/utils/utils';
import {getTransactionsByAccount,appendNewSwapTx} from '@/utils/txData';
import { getTokenContract } from '@/acy-dex-swap/utils/index';
import { fetchGeneralTokenInfo, marketClient, fetchTokenDaySimple } from '../Market/Data/index.js';
import SwapComponent from '@/components/SwapComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import axios from 'axios';
import moment from 'moment';
import StakeHistoryTable from './components/StakeHistoryTable';
import styles from './styles.less';
import { columnsPool } from '../Dao/Util.js';
import styled from "styled-components";
import ConstantLoader from '@/constants';
const supportedTokens = ConstantLoader().tokenList;
const INITIAL_TOKEN_LIST = ConstantLoader().tokenList;

const { AcyTabPane } = AcyTabs;
function getTIMESTAMP(time) {
    var date = new Date(time);
    var year = date.getFullYear(time);
    var month = ("0" + (date.getMonth(time) + 1)).substr(-2);
    var day = ("0" + date.getDate(time)).substr(-2);
    var hour = ("0" + date.getHours(time)).substr(-2);
    var minutes = ("0" + date.getMinutes(time)).substr(-2);
    var seconds = ("0" + date.getSeconds(time)).substr(-2);
  
    return hour + ":" + minutes + ":" + seconds;
    // return `${year}-${month}-${day}`;

}
function abbrNumber(number) {
  const THOUSAND = 0;
  const MILLION = 1;

  let currentDivision = -1;
  let result = '';
  let tempNumber = number;

  if (number >= 1000) {
    tempNumber /= 1000;
    currentDivision = 0;
  }

  if (number >= 1000000) {
    tempNumber /= 1000;
    currentDivision = 1;
  }

  switch (currentDivision) {
    case 0:
      result = `${tempNumber.toFixed(2)}k`;
      break;
    case 1:
      result = `${tempNumber.toFixed(2)}m`;
      break;
    default:
      result = `${number.toFixed(2)}`;
      break;
  }

  return result;
}
const defaultData = [
  ['2000-06-05', 116],
  ['2000-06-06', 129],
  ['2000-06-07', 135],
  
  
];
const StyledCard = styled(AcyCard)`
  background: transparent;

  .ant-card-bordered {
    border: none;
  }
  .ant-card-head-title {
    padding: 0;
  }
    
`;

const Swap = props => {

  const [pricePoint, setPricePoint] = useState(0);
  const [pastToken1, setPastToken1] = useState('ETH');
  const [pastToken0, setPastToken0] = useState('USDC');
  const [isReceiptObtained, setIsReceiptObtained] = useState(false);
  const [routeData, setRouteData] = useState([]);
  const [format, setFormat] = useState('h:mm:ss a');
  const [activeToken1, setActiveToken1] = useState(supportedTokens[1]);
  const [activeToken0, setActiveToken0] = useState(supportedTokens[0]);
  const [activeAbsoluteChange, setActiveAbsoluteChange] = useState('+0.00');
  const [activeRate, setActiveRate] = useState('N/A');
  const [range, setRange] = useState('1D');
  const [chartData, setChartData] = useState([]);
  const [alphaTable, setAlphaTable] = useState('Line');
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleConfirmOrder, setVisibleConfirmOrder] = useState(false);
  const [transactionList, setTransactionList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [transactionNum, setTransactionNum] = useState(0);
  const { account, chainId, library, activate } = useWeb3React();

  const refContainer = useRef();
  refContainer.current = transactionList;

  // connect to provider, listen for wallet to connect

  // useEffect(() => {
  //   if(!account){
  //     activate(binance);
  //   }
  //   console.log("parent page account", account)
  // }, [account])

  useEffect(() => {
    if(!account){
      activate(binance);
      activate(injected);
     }
    getTransactionsByAccount(account,library,'SWAP').then(data =>{
      console.log("found this tx dataa::::::", data);
      setTransactionList(data);
      if(account) setTableLoading(false);
    })
  }, [account]);

  
  // 时间段选择
  const onhandPeriodTimeChoose = periodTimeName => {
    let pt;
    switch (periodTimeName) {
      case '24h': pt = '1D'; break;
      case 'Max': pt = '1M'; break;
    }

    let _format = 'h:mm:ss a';
    switch (pt) {
      case '1D':
        _format = 'h:mm:ss a';
        break;
      case '1W':
        _format = 'ha DD MMM';
        break;
      case '1M':
        _format = 'DD/MM';
        break;
      default:
        _format = 'h:mm:ss a';
    }
    setRange(pt);
    setFormat(_format);
  };

  // useEffect(() => {
  //   getPrice();
  //   // 还原存储的交易信息
  //   const {
  //     transaction: { transactions },
  //     dispatch,
  //   } = props;
  //   let newData = [...transactions];
  //   if (localStorage.getItem('transactions')) {
  //     newData.push(...JSON.parse(localStorage.getItem('transactions')));
  //   }
  //   // 更新数据
  //   dispatch({
  //     type: 'transaction/addTransaction',
  //     payload: {
  //       transactions: [...uniqueFun(newData, 'hash')],
  //     },
  //   });
  // }, [])

  // connect to page model, changes will be reflected in SwapComponent
  // useEffect(() => {
  //   dispatch({
  //     type: "swap/updateTokens",
  //     payload: {
  //       token0: activeToken0,
  //       token1: activeToken1
  //     }
  //   });
  //   getPrice();
  // }, [activeToken0, activeToken1, format]);

  //get chart data the interval is 5 min

  useEffect(() => {
    dispatch({
      type: "swap/updateTokens",
      payload: {
        token0: activeToken0,
        token1: activeToken1
      }
    });
    const dayLength = 24*60/5;
    // const dayLength = 5;
    let reverseFlag = false;
    // timeMark one record the latest transaction time
    // timeMark two recort the oldest transaction time
    let timeMark = 0;
    let timeMark2 = 0;
    let timeData = [];
    let A = activeToken0.symbol;
    let B = activeToken1.symbol;
    if(A>B)
    {
      let temp = B;
      B = A;
      A = temp;
      reverseFlag = true;
    }
    console.log(A,B);
    console.log("fetching the swap Rate data!!!!!!!!!!!!!!!!");
    axios.get(
      "https://api.acy.finance/api/chart/getRate", {params : {token0 : A , token1 : B}}
    ).then(res => {
      console.log("response",res.data);
      if(res.data){
      const historyData = res.data.History;
      timeMark = historyData[historyData.length-1].time;
      timeMark2 = historyData[0].time

      let date = new Date(timeMark*60*1000);
      // var options = { weekday: 'long'};
      // setActiveRate(new Intl.DateTimeFormat('en-US', options).format(date));

      for (let i = 0; i < historyData.length; i++) {
  
        while(i < 0) i++;
        const element = historyData[i];
        // timeData.push(element.time);
        timeData.push(element);
        // var time = element.time*60*1000
        // var date = new Date(time);
        // var dateString = date.toString();
        // console.log("Time : " + date);
        
      };
        
      //add 0 to the chartdata array
      const addData = []
      for (let i = timeMark - 24*60; i < timeMark2; i = i+5) {
        let temp2 = [(i*60*1000),  0 ] ;
        addData.push(temp2);
      } 
      console.log("timemark",timeMark - 24*60,timeMark2);
      console.log("addData",addData);


      // drawing chart
          console.log("timeData",timeData);
          const tempChart = [];
          for (let a = 0; a < timeData.length; a++) {
            if(timeData[a].time > timeMark - 24*60){
            const time = timeData[a].time*60*1000;
            let date = new Date(time);
            let dateString = date.getMinutes();
            let temp;
            if(reverseFlag)
            temp = [time, 1.0/timeData[a].exchangeRate ] ;
            else
            temp = [time,timeData[a].exchangeRate ] ;
            tempChart.push(temp);
            
          }
        }
          console.log("CHARTING!!!!!!!!!!!",tempChart);

          setChartData( addData.concat(tempChart));
    }
      else{
        setActiveRate("No this pair data yet");
      }

    })
     

      console.log("chartdata");
      console.log(timeData);
   
  }, [activeToken0,activeToken1]);
  // workaround way to get USD price (put token1 as USDC)
  // NEEDS ETHEREUM ADDRESS, RINKEBY DOES NOT WORK HERE
  const getRoutePrice = (token0Address, token1Address) => {
    if(!token0Address || !token1Address) return;    

    axios
      .post(
        `https://api.acy.finance/api/chart/swap?token0=${token0Address}&token1=${token1Address}&range=1D`
      )
      .then(data => {
        console.log(data);
        // const { swaps } = data.data.data;
        // const lastDataPoint = swaps[swaps.length - 1];
        // console.log('ROUTE PRICE POINT', lastDataPoint);
        // setState({
        //   pricePoint: lastDataPoint.rate,
        // });
      });
  }

  // const getPrice = () => {
  //   // FIXME: current api doesn't take token0/1 sequence into consideration, always return ratio based on alphabetical order of token symbol
  //   axios.post(
  //     `https://api.acy.finance/api/chart/swap?token0=${activeToken0.addressOnEth}&token1=${activeToken1.addressOnEth}&range=${range}`
  //     // `https://localhost:3001/api/chart/swap?token0=${activeToken0.addressOnEth}&token1=${activeToken1.addressOnEth}&range=${range}`

  //   )
  //     .then(data => {
  //       let { swaps } = data.data.data;
  //       // invert the nominator and denominator when toggled on the token image (top right of the page)
  //       if (activeToken1.symbol < activeToken0.symbol) {
  //         console.log("swapping token position")
  //         swaps = Array.from(swaps, o => ({ ...o, "rate": 1 / o.rate }))
  //       }
  //       console.log(activeToken0.symbol, activeToken1.symbol)
  //       console.log(swaps)
  //       const lastDataPointIndex = swaps.length - 1;

  //       let precisionedData = swaps.map(item => [item.time, item.rate.toFixed(3)])
  //       // add precision if the ratio is close to zero
  //       if (Math.max(...precisionedData.map(item => item[1])) === 0) {
  //         precisionedData = swaps.map(item => [item.time, item.rate.toFixed(6)])
  //       }
  //       setChartData(precisionedData);
  //       setActiveRate(precisionedData[lastDataPointIndex][1]);
  //     })
  //     .catch(e => {
  //       setChartData([]);
  //       setActiveRate('No data');
  //     });
  // }

  const lineTitleRender = () => {

    let token0logo = null;
    let token1logo = null;
    for (let j = 0; j < supportedTokens.length; j++) {
      if (activeToken0.symbol === supportedTokens[j].symbol) {
        token0logo = supportedTokens[j].logoURI;
      }
      if (activeToken1.symbol === supportedTokens[j].symbol) {
        token1logo = supportedTokens[j].logoURI;
      }
    }

    const swapTokenPosition = () => {
      const tempSwapToken = activeToken0;
      setActiveToken0(activeToken1);
      setActiveToken1(tempSwapToken);
    }
    //parse input data from transaction list
    

    return [
      <div style={{width: "100%"}}>
        <div className={styles.maintitle}>
          <div className={styles.lighttitle} style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }} onClick={swapTokenPosition}>
            <img
              src={token0logo}
              alt=""
              style={{ width: 24, maxWidth: '24px', maxHeight: '24px', marginRight: '0.25rem', marginTop: '0.1rem' }}
            />
            <img
              src={token1logo}
              alt=""
              style={{ width: 24, maxHeight: '24px', marginRight: '0.5rem', marginTop: '0.1rem' }}
            />
            <span>
              {activeToken0.symbol}&nbsp;/&nbsp;{activeToken1.symbol}
            </span>

          </div>

        </div>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <div className={styles.secondarytitle}>
            <span className={styles.lighttitle}>{activeRate}</span>{' '}
            <span className={styles.percentage}>{activeAbsoluteChange}</span>
          </div>
          <AcyPeriodTime
            onhandPeriodTimeChoose={onhandPeriodTimeChoose}
            className={styles.pt}
            // times={['1D', '1W', '1M']}
            // times={['24h', 'Max']}
            times={['24h']}

          />
        </div>
      </div>,
    ];
  };

  const selectTime = pt => {
    const dateSwitchFunctions = {
      Line: () => {
        setAlphaTable('Line');
      },
      Bar: () => {
        setAlphaTable('Bar');
      },
    };

    dateSwitchFunctions[pt]();
  };



  // 选择Coin
  const onClickCoin = () => {
    setVisible(true);
  };

  const onCancel = () => {
    setVisible(false);
  };

  const onHandModalConfirmOrder = falg => {
    setVisibleConfirmOrder(!!falg);
  };

  const getTokenSymbol = async (address, library, account) => {
    const tokenContract = getTokenContract(address, library, account);
    return tokenContract.symbol();
  };

  const getTokenDecimal = async (address, library, account) => {
    const tokenContract = getTokenContract(address, library, account);
    return tokenContract.decimals();
  };

  const updateTransactionList = async (receipt) => {
    setTableLoading(true);
    console.log("updating list");
    appendNewSwapTx(refContainer.current,receipt,account,library).then((data) => {
      if(data && data.length > 0) setTransactionList(data);
      setTableLoading(false);
    })
    
  }


  const onGetReceipt = async (receipt, library, account) => {
    console.log('RECEIPT', receipt);
    updateTransactionList(receipt);
  };
  const {
    isMobile,
    transaction: { transactions },
    swap: { token0, token1 },
    dispatch
  } = props;
 
  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
        <div className={styles.rowFlexContainer}>
          <div className={`${styles.colItem} ${styles.priceChart}`}>
            <StyledCard title={lineTitleRender()}>
              <div
                style={{
                  // width: '100%',
                  // marginRight: "30px"
                }}
              >
                <div
                  style={{
                    height: '400px',
                  }}
                  className={styles.showPeriodOnHover}
                >
                  <AcyPriceChart 
                    data={chartData}
                    format={format}
                    showXAxis
                    // showGradient
                    lineColor="#e29227"
                    range={range}
                    showTooltip={true}
                    onHover={(data, dataIndex) => {
                      const prevData = dataIndex === 0 ? 0 : chartData[dataIndex - 1][1];
                      const absoluteChange = (dataIndex === 0 ? 0 : data - prevData).toFixed(3);
                      const formattedAbsChange = absoluteChange > 0 ? "+" + absoluteChange : absoluteChange;
                      setActiveRate(data.toFixed(3));
                      setActiveAbsoluteChange(formattedAbsChange);
                    }}
                  />

                </div>
              </div>
            </StyledCard> 
          </div> 

          <div className={`${styles.colItem} ${styles.swapComponent}`} >
            <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
              <div className={styles.trade}>
                <SwapComponent
                  onSelectToken0={token => {
                    setActiveToken0(token);
                  }}
                  onSelectToken1={token => {
                    setActiveToken1(token);

                  }}
                  onGetReceipt={onGetReceipt}
                />
              </div>
            </AcyCard>
          </div>

        </div>

        <div className={styles.exchangeBottomWrapper}>
          {/* {isReceiptObtained && (
          <div className={styles.exchangeItem}>
            <h3>
              <AcyIcon.MyIcon width={30} type="arrow" />
              <span className={styles.span}>FLASH ROUTE</span>
            </h3>
            <div>
              {isReceiptObtained ? (
                <AcyRoutingChart data={routeData} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    padding: '30px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  The routing will be shown here after a receipt is obtained.
                </div>
              )}
            </div>
          </div>
        )} */}
        <div className={styles.exchangeItem}>
          <h3>
            <AcyIcon.MyIcon width={30} type="arrow" />
            <span className={styles.span}>TRANSACTION HISTORY</span>
          </h3>
          { account&&tableLoading ? (
          <h2 style={{ textAlign: "center", color: "white" }}>Loading <Icon type="loading" /></h2>
          ) : (
          <StakeHistoryTable
            isMobile={isMobile}
            dataSource={transactionList}
          />
          )}
        </div>
      </div>

      <AcyModal onCancel={onCancel} width={600} visible={visible}>
        <div className={styles.title}>
          <AcyIcon name="back" /> Select a token
        </div>
        <div className={styles.search}>
          <AcyInput
            placeholder="Enter the token symbol or address"
            suffix={<AcyIcon name="search" />}
          />
        </div>
        <div className={styles.coinList}>
          <AcyTabs>
            <AcyTabPane tab="All" key="1">
              <AcyCoinItem />
              <AcyCoinItem />
              <AcyCoinItem />
              <AcyCoinItem />
            </AcyTabPane>
            <AcyTabPane tab="Favorite" key="2" />
            <AcyTabPane tab="Index" key="3" />
            <AcyTabPane tab="Synth" key="4" />
          </AcyTabs>
        </div>
      </AcyModal>

      <AcyConfirm
        onCancel={onHandModalConfirmOrder}
        title="Comfirm Order"
        visible={visibleConfirmOrder}
      >
        <div className={styles.confirm}>
          <p>ETH： 566.228</p>
          <p>BTC：2.669</p>
          <p>Price：212.123</p>
          <p>Price Impact：2.232%</p>
          <p>Liquidity Provide Fee: 0.321%</p>
          <p>Alpha: 0.371%</p>
          <p>Maximum sold: 566.221</p>
          <Button size="large" type="primary">
            Confirm
          </Button>
        </div>
      </AcyConfirm>

      <AcyApprove
        onCancel={() => setVisibleLoading(false)}
        visible={visibleLoading}
      />
      
      </div>
    </PageHeaderWrapper>
  );
}
export default connect(({ profile, transaction, swap, loading }) => ({
  profile,
  transaction,
  swap,
  loading: loading.effects['profile/fetchBasic'],
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <Swap {...props} isMobile={isMobile} />}
  </Media>
))

