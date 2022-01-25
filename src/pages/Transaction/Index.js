/*
 * @Author: Doctor
 * @Date: 2021-10-18 14:09:29
 * @LastEditTime: 2021-10-21 22:30:37
 * @LastEditors: Doctor
 * @Description: 
 * @FilePath: \acy-dex-interface\src\pages\Transaction\Index.js
 * jianqiang
 */
import React, { Component, useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { binance } from '@/connectors';
import Media from 'react-media';
import { connect } from 'umi';
import { Link, useParams, useHistory } from 'react-router-dom';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import { fetchTransactionData , getChartData} from '@/utils/txData';
import {Divider, Icon}from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {
  AcyIcon
} from '@/components/Acy';
import styles from './styles.less';
import { useConstantLoader } from '@/constants';
import { NodeCollapseOutlined } from '@ant-design/icons';

const Transaction = props => {


  const [ data, setData ] = useState(NodeCollapseOutlined);
  const [ routes, setRoutes ] = useState([]);
  const [ shouldRender, setShouldRender] = useState(false);
  const [ token1, setToken1 ] = useState({});
  const [ token2, setToken2 ] = useState({});
  const [ showDetails, setShowDetails] = useState(false);
  const { account, chainId, library } = useConstantLoader();
  // const { account, chainId, library, activate } = useWeb3React();
  // const [ url, setUrl] = useState('');

  let {id} = useParams();

  // connect to provider, listen for wallet to connect
  // console.log("before fetch transaction data", account);
  useEffect(() => {

    fetchTransactionData(id,library)
    .then(response => {
      // console.log("response: ", response, typeof(response));
      if (!(Object.keys(response).length === 0 && response.constructor === Object)){

        console.log("printing response",response);;
        setData(response);
        setRoutes(response.routes.map(route => {
          let new_route = {
            token1: route.token1,
            token2: route.token2,
            token3: route.token3,
            token1Num: route.token1Num,
            token2Num: route.token2Num,
            token3Num: route.token3Num,
            logoURI: route.logoURI
          }
          return new_route;
        }));
      }
    })
    .then(() => {
      setShouldRender(true);
    })
    .catch(() => {
      console.log("response error")
    })
  }, [chainId]);
  
  function drawRoutes (){
    // console.log("data", data);//, "token1", token1, "token2", token2);
    // console.log("routes", routes);
    let totalOut = formatNumber(data.totalOut*1,{ precision: 3, thousand: " " });
    let totalIn = formatNumber(data.totalIn*1,{ precision: 3, thousand: " " });
    data.link = `https://www.bscscan.com/tx/${id}`;

    // setUrl(`https://rinkeby.etherscan.io/tx/${id}`);

    console.log("printing routes for this", routes)

    return(
      <div className={styles.routers}>
            <div>
              <div className={styles.block}>
                <span>Swap {totalIn} {data.token1.symbol}</span>
                <img src={data.token1.logoURI} />
              </div>
                {routes.map(function(route, i){
                  return <div className={styles.smallblock}>
                          <div>{formatNumber(route.token1Num*1,{ precision: 7, thousand: ","})}</div>
                          <div>{formatNumber((route.token1Num/data.totalIn*100)*1,{ precision: 2, thousand: ","})}%</div>
                        </div>;
                })}
            </div>
            <div className={styles.arrow}><AcyIcon.MyIcon width={20} type="rightArrow" /></div>
            <div>
              <div className={styles.block}>Pass</div>
              {routes.map(function(route, i){

                if(route.token2) {
                  return <div className={styles.smallblock}>
                          <div>{route.token2Num && formatNumber(route.token2Num*1,{ precision: 7, thousand: ","})}</div>
                          <div>
                            <span>{route.token2}</span>
                            <img src={route.logoURI} style={{ width: '22px'}} />
                          </div>
                       </div>;
                }else{
                  return <div className={styles.smallblock}>
                    <div style={{'width' : '100%','text-align': 'center'}}>direct route</div>
                  </div>;   
                }
              })}
            </div>
            <div className={styles.arrow}><AcyIcon.MyIcon width={20} type="rightArrow" /></div>
            <div>
              <div className={styles.block}>
                <span>For {totalOut} {data.token2.symbol}</span>
                <img src={data.token2.logoURI} style={{ width: '22px'}} />
              </div>

                {routes.map(function(route, i){
                    return <div className={styles.smallblock}>
                            <div>{formatNumber(route.token3Num*1,{ precision: 7, thousand: ","})}</div>
                            <div>{formatNumber((route.token3Num/data.totalOut*100)*1,{ precision: 2, thousand: ","})}%</div>
                          </div>;
                })}
            </div>
        </div>
    );
  }

  function foo(name) { console.log( 'hello ' + name); }

  return <PageHeaderWrapper>
    { shouldRender && data ? (
      <div className={styles.transaction}>
        <div>
          <h1 style={{marginTop: '0'}}><AcyIcon.MyIcon width={30} type="arrow" />FLASH ROUTES</h1>
          
          {drawRoutes()}
          <div>
            <a href={data.link} target="_blank" rel="noreferrer">
                  View it on scan {(data.gas_symbol=='BNB' ? 'BSC SCAN' : "POLYGON SCAN")}
            </a>
          </div>
          <h1>
            <AcyIcon.MyIcon width={30} type="arrow" />
            <a>Flash Arbitrage Revenue</a>
          </h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol}>Protocol Output</td>
              <td>{data.totalOut.toFixed(2)}</td>
              <td> 
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI} />
              </td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>AMM Output</td>
              <td>{data.amm_output.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI} />
              </td>            
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>Flash Arbitrage Revenue</td>
              <td>{(data.totalOut-data.amm_output).toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
              </td>
            </tr>
          </table>
          <h1><AcyIcon.MyIcon width={30} type="arrow" />Flash Arbitrage Revenue Allocation</h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol}>Trader</td>
              <td>50%</td>
              <td>{data.trader_treasury.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
              </td>
            </tr>
            <tr>
              <td className={styles.tableSeeMore} onClick={() => setShowDetails(!showDetails)}>ACY Treasury</td>
              <td>{(!showDetails)? '50%' : '  '}</td>
              <td>{data.acy_treasury.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI} />
              </td>
              {/* <td>
                <a
                  className={styles.seeDetails}
                  }
                >
                See More...
                </a>
              </td> */}
            </tr>
          </table>
            { showDetails ? (
            <table style={{width:'500px'}}>
              <tr>
                <td className={styles.tableFirstCol}>Liquidity Provider</td>
                <td>10%</td>
                <td>{(data.acy_treasury * 0.2).toFixed(2)}</td>
                <td>
                  <span>{data.token2.symbol}</span>
                  <img src={data.token2.logoURI}/>
                </td>
              </tr>
              <tr>
                <td className={styles.tableFirstCol}>{`Protocol Owned Liquidity`}</td>
                <td>10%</td>
                <td>{(data.acy_treasury * 0.2).toFixed(2)}</td>
                <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
                </td>
                
              </tr>
              <tr>
                <td className={styles.tableFirstCol}>{`Farms-->Standard`}</td>
                <td>15%</td>
                <td>{(data.acy_treasury * 0.3).toFixed(2)}</td>
                <td>
                  <span>{data.token2.symbol}</span>
                  <img src={data.token2.logoURI}/>
                </td>
              </tr>
              <tr>
                <td className={styles.tableFirstCol}>{`Farms-->Premier`}</td>
                <td>5%</td>
                <td>{(data.acy_treasury * 0.1).toFixed(2)}</td>
                <td>
                <span>{data.token2.symbol}</span>
                  <img src={data.token2.logoURI}/>
                </td>
              
              </tr>
              <tr>
                <td className={styles.tableFirstCol}>{`Ecosystem DAO`}</td>
                <td>10%</td>
                <td>{(data.acy_treasury * 0.2).toFixed(2)}</td>
                <td>
                  <span>{data.token2.symbol}</span>
                  <img src={data.token2.logoURI}/>
                </td>
              </tr> 
            </table>
            ) : (<div></div>) }
          <h1><AcyIcon.MyIcon width={30} type="arrow" />Basic Fees</h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol}>Gas Fee</td>
              <td>{(data.gasFeeUSD).toFixed(6)}$ ({data.gasFee.toFixed(6)} {data.gas_symbol})</td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>Trading Fee</td>
              <td>{data.trading_fee.toFixed(6)} $</td>
            </tr>
          </table>
          
          <h1><AcyIcon.MyIcon width={30} type="arrow" />Trading Fee Allocation</h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol}>Liquidity Providers</td>
              <td>{(data.trading_fee).toFixed(6)} $</td>
            </tr>
          </table>
          
          <h1><AcyIcon.MyIcon width={30} type="arrow" />Trader Receives</h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol} ><span>{data.token2.symbol}</span>
              <img src={data.token2.logoURI} /></td>
              <td>{(data.trader_final).toFixed(3)} ({(data.trader_finalUSD).toFixed(3)}$)</td>
            </tr>
          </table>
        </div>
      </div> ) : (<h2 style={{ textAlign: "center", color: "white" }}> Loading<Icon type="loading" /></h2>)
    }
    </PageHeaderWrapper>
}
export default connect(({ profile, transaction, loading }) => ({
  profile,
  transaction,
  loading: loading.effects['profile/fetchBasic'],
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <Transaction {...props} isMobile={isMobile} />}
  </Media>
))

