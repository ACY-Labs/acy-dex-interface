import React, { Component, useState, useCallback, useEffect } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table, Row, Col, Input, Divider, Breadcrumb } from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { Link, useParams } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
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
  columnsCoin,
  columnsPool,
  transactionHeader,
  sortTable,
  sortTableTime,
  isDesktop,
} from './Util.js';

import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';

import { MarketSearchBar, SmallTable, TransactionTable } from './UtilComponent.js';
import { WatchlistManager } from './WatchlistManager.js';

const { AcyTabPane } = AcyTabs;
const watchlistManagerPool = new WatchlistManager('pool');

let poolData = dataSourcePool[0];

function MarketPoolInfo(props) {
  let { address } = useParams();

  const [poolData, setpoolData] = useState(
    dataSourcePool.filter(item => item.address == address)[0]
  );
  const [graphTabIndex, setGraphTabIndex] = useState(0);
  const [isWatchlist, setIsWatchlist] = useState(false);

  function switchChart(dest) {
    setGraphTabIndex(dest);
  }

  const toggleWatchlist = data => {
    let oldArray = watchlistManagerPool.getData();
    if (oldArray.toString().includes(data.toString())) {
      oldArray = oldArray.filter(
        item => !(item[0] == data[0] && item[1] == data[1]) && item[2] == data[2]
      );
      setIsWatchlist(false);
    } else {
      oldArray.push(data);
      setIsWatchlist(true);
    }
    watchlistManagerPool.saveData(oldArray);
  };

  const updateWatchlistStatus = () => {
    let data = watchlistManagerPool.getData();
    if (data.toString() == [poolData.coin1, poolData.coin2, poolData.percent].toString())
      setIsWatchlist(true);
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
              Pools
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item style={{ fontWeight: 'bold' }}>
            {poolData.coin1}/{poolData.coin2} {poolData.percent}%
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.rightButton}>
          <AcyIcon
            name={isWatchlist ? 'star_active' : 'star'}
            width={16}
            style={{ marginLeft: '10px' }}
            onClick={() => toggleWatchlist([poolData.coin1, poolData.coin2, poolData.percent])}
          />
          <AcyIcon name="redirect" style={{ marginLeft: '10px' }} width={16}/>
        </div>
      </div>

      <div>
        <div className={styles.rightButton} />
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
            <AcyIcon name={poolData.coin1.toLowerCase()} width={36} height={36} />
            <AcyIcon name={poolData.coin2.toLowerCase()} width={36} height={36} />
            <span
              style={{ fontSize: '26px', fontWeight: 'bold', marginLeft: '10px' }}
              className={styles.coinName}
            >
              {poolData.coin1}/{poolData.coin2}
            </span>
            <div
              className={styles.percentBadge}
              style={{ marginLeft: '20px', fontSize: '18px', lineHeight: '20px' }}
            >
              {poolData.percent} %
            </div>
          </div>
        </div>
      </div>
      <div className={styles.exchangeValuePadder}>
        <div className={styles.exchangeValueWrapper}>
          <div className={styles.exchangeValueCard}>
            <AcyIcon name={poolData.coin1.toLowerCase()} width={20} />
            <strong style={{ marginLeft: '10px' }}>
              1 {poolData.coin1} = {abbrNumber(0.00001)} {poolData.coin2}
            </strong>
          </div>
          <div className={styles.exchangeValueRight}>
            <div
              className={styles.exchangeValueCard}
              style={{
                width: isDesktop() ? '35%' : '100%',
                marginTop: isDesktop() ? 0 : '10px',
                marginBottom: isDesktop() ? 0 : '10px',
              }}
            >
              <AcyIcon name={poolData.coin2.toLowerCase()} width={20} />
              <strong style={{ marginLeft: '10px' }}>
                1 {poolData.coin2} = {abbrNumber(274047502)} {poolData.coin1}
              </strong>
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
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div className={styles.contentStats}>
          <div className={styles.statEntry}>
            <strong>Total tokens locked</strong>
            <div className={styles.tokenLockEntry}>
              <div className={styles.tokenLockName}>
                {/* change data later */}
                <AcyIcon name={'eth'} width={20} height={20} />
                <div> ETH</div>
              </div>
              <div>{abbrNumber(234560)}</div>
            </div>
            <div className={styles.tokenLockEntry}>
              <div className={styles.tokenLockName}>
                {/* change data later */}
                <AcyIcon name={'eth'} width={20} height={20} />
                <div> ETH</div>
              </div>
              <div>{abbrNumber(234560)}</div>
            </div>
          </div>
          <div className={styles.statEntry}>
            <div className={styles.statEntryName}>TVL</div>
            <div className={styles.statEntryValue}>$ {abbrNumber(poolData.tvl)}</div>
            <div className={styles.statEntryChange} style={{ color: 'greenyellow' }}>
              5.12%
            </div>
          </div>
          <div className={styles.statEntry}>
            <div className={styles.statEntryName}>24h Trading Vol</div>
            <div className={styles.statEntryValue}>$ {abbrNumber(poolData.volume24h)}</div>
            <div className={styles.statEntryChange} style={{ color: 'red' }}>
              {' '}
              - 5.12%
            </div>
          </div>
          <div className={styles.statEntry}>
            <div className={styles.statEntryName}>24h Fees</div>
            <div className={styles.statEntryValue}>$ {abbrNumber(poolData.volume24h)}</div>
            <div className={styles.statEntryChange} style={{ visibility: 'hidden' }}>
              00{' '}
            </div>
          </div>
        </div>
        <div className={styles.contentCharts}>
          <div className={styles.contentChartsHeader}>
            <div className={styles.contentChartsIndicator}>
              <div className={styles.chartIndicatorValue}>$999.99m</div>
              <div className={styles.chartIndicatorTime}>2020-11-20</div>
            </div>
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
                Liquidity
              </AcySmallButton>
            </div>
          </div>
          <div className={styles.contentChartsBody}>
            {graphTabIndex == 0 && (
              <div className={styles.contentChartWrapper}>
                <AcyBarChart backData={graphSampleData} barColor="#1e5d91" />
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
                />
              </div>
            )}
            {graphTabIndex == 2 && (
              <div className={styles.contentChartWrapper}>
                <AcyBarChart backData={graphSampleData} barColor="#1e5d91" />
              </div>
            )}
          </div>
        </div>
      </div>

      <h2>Transactions</h2>
      <TransactionTable
        dataSourceTransaction={dataSourceTransaction.filter(
          item =>
            (item.coin1 == poolData.coin1 && item.coin2 == poolData.coin2) ||
            (item.coin1 == poolData.coin2 && item.coin2 == poolData.coin1)
        )}
      />
      <div style={{ height: '40px' }} />
    </div>
  );
}

export default MarketPoolInfo;
