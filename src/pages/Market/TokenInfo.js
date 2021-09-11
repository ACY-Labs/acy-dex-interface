import React, { Component, useState, useCallback, useEffect } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table, Row, Col, Input, Divider, Breadcrumb } from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { Link, useParams } from 'react-router-dom';
import {
  AcyButton,
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyCuarrencyCard,
  AcyConnectWalletBig,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyLineChart,
  AcyBarChart,
  AcyConfirm,
  AcyApprove,
  AcySmallButton,
} from '@/components/Acy';

import {
  TransactionType,
  abbrHash,
  abbrNumber,
  transactionHeader,
  sortTable,
  sortTableTime,
  openInNewTab,
} from './Util.js';

import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';

import { MarketSearchBar, SmallTable, PoolTable, TransactionTable } from './UtilComponent.js';

import { WatchlistManager } from './WatchlistManager.js';

const { AcyTabPane } = AcyTabs;
const watchlistManagerToken = new WatchlistManager('token');

function MarketTokenInfo(props) {
  let { address } = useParams();

  const [tokenData, setTokenData] = useState(
    dataSourceCoin.filter(item => item.address == address)[0]
  );
  const [graphTabIndex, setGraphTabIndex] = useState(0);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [selectChartDataVol, setSelectChartDataVol] = useState(
    graphSampleData[graphSampleData.length - 1][1]
  );
  const [selectChartIndexVol, setSelectChartIndexVol] = useState(graphSampleData.length - 1);
  const [selectChartDataTvl, setSelectChartDataTvl] = useState(
    graphSampleData[graphSampleData.length - 1][1]
  );
  const [selectChartIndexTvl, setSelectChartIndexTvl] = useState(graphSampleData.length - 1);
  const [selectChartDataPrice, setSelectChartDataPrice] = useState(
    graphSampleData[graphSampleData.length - 1][1]
  );
  const [selectChartIndexPrice, setSelectChartIndexPrice] = useState(graphSampleData.length - 1);

  function switchChart(dest) {
    setGraphTabIndex(dest);
  }

  const toggleWatchlist = data => {
    let oldArray = watchlistManagerToken.getData();
    if (oldArray.includes(data)) {
      oldArray = oldArray.filter(item => item != data);
      setIsWatchlist(false);
    } else {
      oldArray.push(data);
      setIsWatchlist(true);
    }
    watchlistManagerToken.saveData(oldArray);
  };

  const updateWatchlistStatus = () => {
    let data = watchlistManagerToken.getData();
    if (data.includes(tokenData.short)) setIsWatchlist(true);
    else setIsWatchlist(false);
  };

  useEffect(() => {
    // set the watchlists
    updateWatchlistStatus();
  }, []);

  return (
    <div className={styles.marketRoot}>
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        onRefreshWatchlist={() => {
          updateWatchlistStatus();
        }}
      />
      <div className={styles.infoHeader}>
        <Breadcrumb
          separator={<span style={{ color: '#b5b5b6' }}>&gt;</span>}
          style={{ marginBottom: '20px', color: '#b5b5b6' }}
        >
          <Breadcrumb.Item>
            <Link style={{ color: '#b5b5b6' }} to="/market">
              Overview
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link style={{ color: '#b5b5b6' }} to="/market/list/pool">
              Tokens
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item style={{ fontWeight: 'bold' }}>{tokenData.short}</Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.rightButton}>
          <AcyIcon
            name={isWatchlist ? 'star_active' : 'star'}
            style={{ marginLeft: '10px' }}
            width={16}
            onClick={() => toggleWatchlist(tokenData.short)}
          />
          <AcyIcon name="cmc" style={{ marginLeft: '10px' }} width={16} />
          <AcyIcon name="redirect" style={{ marginLeft: '10px' }} width={16} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div className={styles.contentInfo}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AcyIcon name={tokenData.short.toLowerCase()} width={36} height={36} />
            <span style={{ fontSize: '26px', fontWeight: 'bold', marginLeft: '10px' }}>
              {tokenData.short}
            </span>
            <span style={{ fontSize: '26px', fontWeight: 'thin', marginLeft: '10px' }}>
              ({tokenData.name})
            </span>
          </div>
          <div>
            <span style={{ fontSize: '30px', fontWeight: 'bold' }}>
              $ {abbrNumber(tokenData.price)}
            </span>
            <span
              style={{ fontSize: '20px', fontWeight: 'thin', marginLeft: '16px' }}
              className={tokenData.priceChange < 0 ? styles.priceChangeDown : styles.priceChangeUp}
            >
              {tokenData.priceChange.toFixed(2)} %
            </span>
          </div>
        </div>
        <div className={styles.contentCta}>
          <div className={styles.ctaButton}>
            <AcySmallButton
              color="#2e3032"
              borderColor="#2e3032"
              borderRadius="15px"
              padding="10px"
            >
              <AcyIcon name="addlq" width={16} style={{ marginRight: '10px' }} />
              Add Liquidity
            </AcySmallButton>
          </div>
          <div className={styles.ctaButton}>
            <AcySmallButton
              color="#1e5d91"
              borderColor="#1e5d91"
              borderRadius="15px"
              padding="10px"
            >
              Trade
            </AcySmallButton>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div className={styles.contentStats}>
          <div className={styles.statEntry}>
            <div className={styles.statEntryName}>TVL</div>
            <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.tvl)}</div>
            <div className={styles.statEntryChange} style={{ color: 'greenyellow' }}>
              5.12%
            </div>
          </div>
          <div className={styles.statEntry}>
            <div className={styles.statEntryName}>24h Trading Vol</div>
            <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.volume24h)}</div>
            <div className={styles.statEntryChange} style={{ color: 'red' }}>
              {' '}
              - 5.12%
            </div>
          </div>
          <div className={styles.statEntry}>
            <div className={styles.statEntryName}>7d Trading Vol</div>
            <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.volume24h)}</div>
            <div className={styles.statEntryChange} style={{ visibility: 'hidden' }}>
              00{' '}
            </div>
          </div>
          <div className={styles.statEntry}>
            <div className={styles.statEntryName}>24h Fees</div>
            <div className={styles.statEntryValue}>$ {abbrNumber(tokenData.volume24h)}</div>
            <div className={styles.statEntryChange} style={{ visibility: 'hidden' }}>
              00{' '}
            </div>
          </div>
        </div>
        <div className={styles.contentCharts}>
          <div className={styles.contentChartsHeader}>
            {graphTabIndex == 0 && (
              <div className={styles.contentChartsIndicator}>
                <div className={styles.chartIndicatorValue}>$ {selectChartDataVol}</div>
                <div className={styles.chartIndicatorTime}>
                  {graphSampleData[selectChartIndexVol][0]}
                </div>
              </div>
            )}
            {graphTabIndex == 1 && (
              <div className={styles.contentChartsIndicator}>
                <div className={styles.chartIndicatorValue}>$ {selectChartDataTvl}</div>
                <div className={styles.chartIndicatorTime}>
                  {graphSampleData[selectChartIndexTvl][0]}
                </div>
              </div>
            )}
            {graphTabIndex == 2 && (
              <div className={styles.contentChartsIndicator}>
                <div className={styles.chartIndicatorValue}>$ {selectChartDataPrice}</div>
                <div className={styles.chartIndicatorTime}>
                  {graphSampleData[selectChartIndexPrice][0]}
                </div>
              </div>
            )}

            <div className={styles.contentChartsSelector}>
              <AcySmallButton
                color={graphTabIndex == 0 ? '#1b1b1c' : '#757579'}
                textColor="white"
                borderColor="#757579"
                borderRadius="15px 0 0 15px"
                padding="2px 5px"
                onClick={() => switchChart(0)}
                id="0"
              >
                Volume
              </AcySmallButton>
              <AcySmallButton
                color={graphTabIndex == 1 ? '#1b1b1c' : '#757579'}
                textColor="white"
                borderColor="#757579"
                borderRadius="0 0 0 0"
                padding="2px 5px"
                onClick={() => switchChart(1)}
                id="1"
              >
                TVL
              </AcySmallButton>
              <AcySmallButton
                color={graphTabIndex == 2 ? '#1b1b1c' : '#757579'}
                textColor="white"
                borderColor="#757579"
                borderRadius="0 15px 15px 0"
                padding="2px 5px"
                onClick={() => switchChart(2)}
                id="2"
              >
                Price
              </AcySmallButton>
            </div>
          </div>
          <div className={styles.contentChartsBody}>
            {graphTabIndex == 0 && (
              <div className={styles.contentChartWrapper}>
                <AcyBarChart
                  data={graphSampleData}
                  barColor="#1e5d91"
                  showXAxis
                  onHover={(data, index) => {
                    setSelectChartDataVol(abbrNumber(data));
                    setSelectChartIndexVol(index);
                  }}
                />
              </div>
            )}
            {graphTabIndex == 1 && (
              <div className={styles.contentChartWrapper}>
                <AcyLineChart
                  showXAxis={true}
                  backData={graphSampleData}
                  showGradient={true}
                  lineColor="#1e5d91"
                  bgColor="#29292c"
                  onHover={(data, index) => {
                    setSelectChartDataTvl(abbrNumber(data));
                    setSelectChartIndexTvl(index);
                  }}
                />
              </div>
            )}
            {graphTabIndex == 2 && (
              <div className={styles.contentChartWrapper}>
                <AcyLineChart
                  showXAxis={true}
                  backData={graphSampleData}
                  showGradient={true}
                  lineColor="#1e5d91"
                  bgColor="#29292c"
                  onHover={(data, index) => {
                    setSelectChartDataPrice(abbrNumber(data));
                    setSelectChartIndexPrice(index);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <h2>Pools</h2>
      <PoolTable
        dataSourcePool={dataSourcePool.filter(
          item => item.coin1 == tokenData.short || item.coin2 == tokenData.short
        )}
      />

      <h2>Transactions</h2>
      <TransactionTable
        dataSourceTransaction={dataSourceTransaction.filter(
          item => item.coin1 == tokenData.short || item.coin2 == tokenData.short
        )}
      />
      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketTokenInfo;
