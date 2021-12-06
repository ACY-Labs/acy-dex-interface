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
import { InjectedConnector } from '@web3-react/injected-connector';
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

const Transaction = props => {


  const [data, setData] = useState({});
  const { account, chainId, library, activate } = useWeb3React();
  const [ ammOutput, setAmmOutput] = useState(0);
  const [ chartData, setChartData] = useState({});
  // const [ url, setUrl] = useState('');

  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  let {id} = useParams();

  useEffect(() => {
    activate(injected);
  }, []);


  useEffect(() => {
    console.log(id);
    fetchTransactionData(id,library,account).then(response => {
      setData(response);
      console.log(response);
    });
  }, [account]);
  function drawRoutes (){
    let routes = data.routes;
    let totalOut = formatNumber(data.totalOut*1,{ precision: 3, thousand: " " });
    let totalIn = formatNumber(data.totalIn*1,{ precision: 3, thousand: " " });
    let token1 = data.token1;
    let token2 = data.token2;
    data.link = `https://rinkeby.etherscan.io/tx/${id}`;

    // setUrl(`https://rinkeby.etherscan.io/tx/${id}`);

    if(data.routes){
    return(
      <div className={styles.routers}>
            <div>
              <div className={styles.block}>
                <span>Swap {totalOut} {token1.symbol}</span>
                <img src={token1.logoURI} />
              </div>
                {routes.map(function(route, i){
                  return <div className={styles.smallblock}>
                          <div>{formatNumber(route.token1Num*1,{ precision: 7, thousand: ","})}</div>
                          <div>{formatNumber((route.token1Num/data.totalOut*100)*1,{ precision: 7, thousand: ","})}%</div>
                        </div>;
                })}
            </div>
            <div className={styles.arrow}><AcyIcon.MyIcon width={20} type="rightArrow" /></div>
            <div>
              <div className={styles.block}>Pass</div>
              {routes.map(function(route, i){
                return <div className={styles.smallblock}>
                        <div>{route.token2Num && formatNumber(route.token2Num*1,{ precision: 7, thousand: ","})}</div>
                        <div>
                        <span>{route.token2}</span>
                        <img src={route.logoURI} style={{ width: '22px'}} />
                        </div>
                        
                      </div>;
              })}
            </div>
            <div className={styles.arrow}><AcyIcon.MyIcon width={20} type="rightArrow" /></div>
            <div>
              <div className={styles.block}>
                <span>For {totalIn} {token2.symbol}</span>
                <img src={token2.logoURI} style={{ width: '22px'}} />
              </div>

                {routes.map(function(route, i){
                    return <div className={styles.smallblock}>
                            <div>{formatNumber(route.token3Num*1,{ precision: 7, thousand: ","})}</div>
                            <div>{formatNumber((route.token3Num/data.totalIn*100)*1,{ precision: 7, thousand: ","})}%</div>
                          </div>;
                })}
            </div>
        </div>
    );
    }
  }

  return <PageHeaderWrapper>
    { data.routes ? (
      <div className={styles.transaction}>
        <div>
          <h1 style={{marginTop: '0'}}><AcyIcon.MyIcon width={30} type="arrow" />FLASH ROUTES</h1>
          
          {drawRoutes()}
          <div>
            <a href={data.link} target="_blank" rel="noreferrer">
                  View it on etherscan
            </a>
          </div>
          <h1>
            <AcyIcon.MyIcon width={30} type="arrow" />
            <a>Flash Arbitrage Revenue</a>
          </h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol}>ACY Output</td>
              <td>{data.chartData.acy_output.toFixed(2)}</td>
              <td> 
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI} />
              </td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>AMM Output</td>
              <td>{data.chartData.amm_output.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI} />
              </td>            
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>Flash Arbitrage Revenue</td>
              <td>{data.chartData.flash_revenue.toFixed(2)}</td>
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
              <td>40%</td>
              <td>{data.chartData.flash_revenue.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
              </td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>Liquidity Provider</td>
              <td>20%</td>
              <td>{data.chartData.liquidity_provider.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
              </td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>{`Farms-->ACYDAO`}</td>
              <td>10%</td>
              <td>{data.chartData.farms_acydao.toFixed(2)}</td>
              <td>
               <span>{data.token2.symbol}</span>
               <img src={data.token2.logoURI}/>
              </td>
              
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>{`Farms-->Standard`}</td>
              <td>10%</td>
              <td>{data.chartData.farms_standard.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
              </td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>{`Farms-->Premier`}</td>
              <td>10%</td>
              <td>{data.chartData.farms_premier.toFixed(2)}</td>
              <td>
               <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
              </td>
             
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>{`Ecosystem DAO`}</td>
              <td>10%</td>
              <td>{data.chartData.ecosystem_dao.toFixed(2)}</td>
              <td>
                <span>{data.token2.symbol}</span>
                <img src={data.token2.logoURI}/>
              </td>
            </tr>
          </table>
          
          <h1><AcyIcon.MyIcon width={30} type="arrow" />Basic Fee</h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol}>Gas Fee</td>
              <td>{(data.gasFee * data.ethPrice).toFixed(6)}$ ({data.gasFee.toFixed(6)}ETH)</td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>Trading Fee</td>
              <td>{data.chartData.trading_fee.toFixed(2)}</td>
            </tr>
          </table>
          
          <h1><AcyIcon.MyIcon width={30} type="arrow" />Trading Fee Allocation</h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol}>Liquidity Providers</td>
              <td>{(data.gasFee * data.ethPrice).toFixed(6)}$ ({data.gasFee.toFixed(6)}ETH)</td>
            </tr>
            <tr>
              <td className={styles.tableFirstCol}>ACYDAO</td>
              <td>{data.chartData.trading_fee.toFixed(2)}</td>
            </tr>
          </table>
          
          <h1><AcyIcon.MyIcon width={30} type="arrow" />Trader Receives</h1>
          <table style={{width:'500px'}}>
            <tr>
              <td className={styles.tableFirstCol} ><span>{data.token2.symbol}</span>
              <img src={data.token2.logoURI} /></td>
              <td>3,303,788.77</td>
            </tr>
            {/* <tr>
              <td>ACY</td>
              <td>2,519,015.51</td>
            </tr> */}
          </table>
        </div>
      </div> ) : (<h2 style={{ textAlign: "center", color: "white" }}>Loading <Icon type="loading" /></h2>)
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

