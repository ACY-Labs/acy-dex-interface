import { AcyBarChart, AcyLineChart } from '@/components/Acy';
import { Col, Icon, Row, Button } from 'antd';
import React, { Component, useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import {
  fetchGeneralPoolInfoDay,
  fetchGeneralTokenInfo,
  fetchGlobalTransaction,
  fetchMarketData,
  marketClient,
} from '@/pages/Market/Data'
import { dataSourceCoin, dataSourcePool } from '@/pages/Market/SampleData.js';
import styles from './styles.less';
import { abbrNumber, FEE_PERCENT } from '@/pages/Market/Util.js';
import { MarketSearchBar, PoolTable, TokenTable, TransactionTable } from '@/pages/Market/UtilComponent.js';
import { JsonRpcProvider } from "@ethersproject/providers";
import { isMobile } from 'react-device-detect';
import ConnectWallet from '@/pages/Market/ConnectWallet';

import { useConstantLoader } from '@/constants';

import { useConnectWallet } from '@/components/ConnectWallet';
import ComponentTabs from '@/components/ComponentTabs';


const Stats = props => {
  const [visible, setVisible] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedIndexLine, setselectedIndexLine] = useState(0);
  const [selectedDataLine, setselectedDataLine] = useState(0);
  const [selectedIndexBar, setselectedIndexBar] = useState(0);
  const [selectedDataBar, setselectedDataBar] = useState(0);
  const [chartData, setchartData] = useState({
    tvl: [],
    volume24h: [],
  });
  const [overallVolume, setoverallVolume] = useState(-1);
  const [overallTvl, setoverallTvl] = useState(-1);
  const [overallFees, setoverallFees] = useState(-1);
  const [ovrVolChange, setovrVolChange] = useState(0.0);
  const [ovrTvlChange, setovrTvlChange] = useState(0.0);
  const [ovrFeeChange, setovrFeeChange] = useState(0.0);
  const [transactions, settransactions] = useState(null);
  const [tokenInfo, settokenInfo] = useState([]);

  const [poolInfo, setpoolInfo] = useState([]);

  const [tokenError, settokenError] = useState('');

  const [pullError, setpullError] = useState('');
  const [transactionError, settransactionError] = useState('');

  const [barChartError, setbarChartError] = useState('');

  const [lineChartError, setlineChartError] = useState('');
  const [overviewError, setoverviewError] = useState('');

  const [marketNetwork, setmarketNetwork] = useState('');

  const { activate } = useWeb3React();
  const { account, library, chainId } = useConstantLoader();


  // connect to provider, listen for wallet to connect
  const connectWalletByLocalStorage = useConnectWallet();

  useEffect(() => {
    if (!localStorage.getItem("market")) {
      localStorage.setItem("market", 56);
    }
    if (!account) {
      connectWalletByLocalStorage();
    }
  }, []);

  useEffect(() => {
    fetchGlobalTransaction().then(globalTransactions => {
      console.log('globaltransaction', globalTransactions);
      if (globalTransactions) settransactions(globalTransactions);
    });

    fetchGeneralPoolInfoDay().then(poolInfo => {
      if (poolInfo) setpoolInfo(poolInfo);
    });

    // fetch token info
    fetchGeneralTokenInfo().then(tokenInfo => {
      if (tokenInfo) settokenInfo(tokenInfo);
      console.log("token to render", tokenInfo)
    });

    // fetch market data
    console.log("BUG HERE:");
    fetchMarketData().then(dataDict => {
      console.log("BUG HERE2:", dataDict);
      if (dataDict) {
        let volumeChange =
          (dataDict.volume24h[dataDict.tvl.length - 1][1] -
            dataDict.volume24h[dataDict.tvl.length - 2][1]) /
          dataDict.volume24h[dataDict.tvl.length - 2][1];

        let tvlChange =
          (dataDict.tvl[dataDict.tvl.length - 1][1] - dataDict.tvl[dataDict.tvl.length - 2][1]) /
          dataDict.tvl[dataDict.tvl.length - 2][1];

        let fee = dataDict.volume24h[dataDict.tvl.length - 1][1] * FEE_PERCENT
        setchartData(dataDict);
        setoverallVolume(abbrNumber(dataDict.volume24h[dataDict.tvl.length - 1][1]));
        setoverallTvl(abbrNumber(dataDict.tvl[dataDict.tvl.length - 1][1]));
        setoverallFees(abbrNumber(fee));
        setovrVolChange((volumeChange * 100).toFixed(2));
        setovrFeeChange((volumeChange * 100).toFixed(2));
        setovrTvlChange((tvlChange * 100).toFixed(2));
        setselectedIndexLine(dataDict.tvl.length - 1);
        setselectedDataLine(abbrNumber(dataDict.tvl[dataDict.tvl.length - 1][1]));
        setselectedIndexBar(dataDict.volume24h.length - 1);
        setselectedDataBar(abbrNumber(dataDict.volume24h[dataDict.tvl.length - 1][1]));
      }
    });
  }, [chainId, marketNetwork]);

  const onLineGraphHover = (newData, newIndex) => {
    setselectedDataLine(abbrNumber(newData));
    setselectedIndexLine(newIndex);
  };

  const onBarGraphHover = (newData, newIndex) => {
    setselectedDataBar(abbrNumber(newData));
    setselectedIndexBar(newIndex);
  };
  const getNetwork = (index) => {
    // 输出接收到子组件的参数
    console.log(index);
    setmarketNetwork(index);
  }

  const history = useHistory()

  const [statsType, setStatsType] = useState("Market")
  const statsTypes = ["Market", "Future"]
  // const statsTypes = ["Market", "Future", "StableCoin"]
  const onChangeStats = item => {
    history.push('/statistics/' + item.toLowerCase())
  }

  return (
    <div className={styles.marketRoot}>
      <div className={styles.statsTab}>
        <ComponentTabs
          option={statsType}
          options={statsTypes}
          onChange={onChangeStats}
        />
      </div>
      <div className={styles.marketContent}>
        <ConnectWallet />
        <MarketSearchBar
          className={styles.searchBar}
          dataSourceCoin={dataSourceCoin}
          dataSourcePool={dataSourcePool}
          account={account}
          visible={true}
          getNetwork={getNetwork}
          networkShow={true}
        />
        <div className={styles.chartsMain}>
          <div className={styles.chartSectionMain}>
            {chartData.tvl.length > 0 ? (
              <>
                <div className={styles.graphStats}>
                  <div className={styles.statName}>TVL</div>
                  <div className={styles.statValue}>$ {selectedDataLine}</div>
                  <div className={styles.statName}>
                    {chartData.tvl[selectedIndexLine][0]}
                  </div>
                </div>
                <div className={styles.chartWrapper}>
                  <AcyLineChart
                    data={chartData.tvl}
                    onHover={onLineGraphHover}
                    showXAxis={true}
                    showGradient={true}
                    lineColor="#e29227"
                    bgColor="#2f313500"
                  />
                </div>
              </>
            ) : (
              <Icon type="loading" />
            )}
          </div>
          <div className={styles.chartSectionMain}>
            {chartData.volume24h.length > 0 ? (
              <>
                <div className={styles.graphStats}>
                  <div className={styles.statName}>VOLUME 24H</div>
                  <div className={styles.statValue}>{`$ ${selectedDataBar}`}</div>
                  <div className={styles.statName}>
                    {chartData.volume24h[selectedIndexBar][0]}
                  </div>
                </div>
                <div className={styles.chartWrapper}>
                  <AcyBarChart
                    data={chartData.volume24h}
                    showXAxis
                    barColor="#1c9965"
                    onHover={onBarGraphHover}
                  />
                </div>
              </>
            ) : (
              <Icon type="loading" />
            )}
          </div>
        </div>
        {overallVolume !== -1 && overallTvl !== -1 && !isMobile ? (
          <Row className={styles.marketOverview} justify="space-around">
            <Col span={8}>
              Volume 24H <strong style={{ color: "white" }}>$ {overallVolume}</strong>{' '}
              <span
                className={
                  ovrVolChange >= 0 ? styles.priceChangeUp : styles.priceChangeDown
                }
              >
                {ovrVolChange} %
              </span>
            </Col>
            <Col span={8}>
              Fees 24H <strong style={{ color: "white" }}>$ {overallFees} </strong> <span
                className={
                  ovrVolChange >= 0 ? styles.priceChangeUp : styles.priceChangeDown
                }
              >
                {ovrVolChange} %
              </span>
            </Col>
            <Col span={8}>
              TVL <strong style={{ color: "white" }}>$ {overallTvl}</strong>{' '}
              <span
                className={
                  ovrTvlChange >= 0 ? styles.priceChangeUp : styles.priceChangeDown
                }
              >
                {ovrTvlChange} %
              </span>
            </Col>
          </Row>
        ) : (
          !isMobile && <Icon type="loading" />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Top Tokens</h2>
          <h3>
            <Link style={{ color: '#b5b5b6' }} /*to="/market/list/token"*/>
              Explore
            </Link>
          </h3>
        </div>
        {tokenInfo.length > 0 ? (
          <TokenTable dataSourceCoin={tokenInfo} />
        ) : (
          <Icon type="loading" />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Top Pools</h2>
          <h3>
            <Link style={{ color: '#b5b5b6' }} /*to="/market/list/pool"*/>
              Explore
            </Link>
          </h3>
        </div>

        {poolInfo.length > 0 ? (
          <PoolTable dataSourcePool={poolInfo} />
        ) : (
          <Icon type="loading" />
        )}

        <h2>Transactions</h2>
        {!transactions ? (
          <Icon type="loading" />
        ) : (
          <TransactionTable dataSourceTransaction={transactions} />
        )}
        <div style={{ height: '20px' }} />
      </div>
    </div>
  );

}

export default Stats;