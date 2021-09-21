import { AcyBarChart, AcyLineChart } from '@/components/Acy';
import { Col, Row, Icon, Skeleton } from 'antd';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';
import styles from './styles.less';
import { abbrNumber } from './Util.js';
import { MarketSearchBar, PoolTable, TokenTable, TransactionTable } from './UtilComponent.js';

import {
  fetchMarketData,
  marketClient,
  fetchGlobalTransaction,
  fetchGeneralTokenInfo,
  fetchGeneralPoolInfoDay,
} from './Data/index.js';

export class MarketIndex extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    visible: true,
    tabIndex: 0,
    selectedIndexLine: 0,
    selectedDataLine: 0,
    selectedIndexBar: 0,
    selectedDataBar: 0,

    // dictionary for the tvl and volume chart
    chartData: {
      tvl: [],
      volume24h: [],
    },

    // overall chart data
    overallVolume: -1,
    overallTvl: -1,

    // transaction data
    transactions: [],

    // token data
    tokenInfo: [],

    // pool data
    poolInfo: [],

    // error messages
    tokenError: '',
    pullError: '',
    transactionError: '',
    barChartError: '',
    lineChartError: '',
    overviewError: '',
  };

  componentDidMount() {
    // fetch pool data
    fetchGeneralPoolInfoDay(marketClient).then(poolInfo => {
      this.setState({
        poolInfo: poolInfo,
      });
    });

    // fetch token info
    fetchGeneralTokenInfo(marketClient).then(tokenInfo => {
      this.setState({
        tokenInfo: tokenInfo,
      });
    });

    // fetch transaction data
    fetchGlobalTransaction(marketClient).then(globalTransactions => {
      this.setState({
        transactions: globalTransactions,
      });
    });

    // fetch market data
    fetchMarketData(marketClient).then(dataDict => {
      this.setState({
        chartData: dataDict,
        overallVolume: abbrNumber(dataDict.volume24h[dataDict.tvl.length - 1][1]),
        overallTvl: abbrNumber(dataDict.tvl[dataDict.tvl.length - 1][1]),
        selectedIndexLine: dataDict.tvl.length - 1,
        selectedDataLine: abbrNumber(dataDict.tvl[dataDict.tvl.length - 1][1]),
        selectedIndexBar: dataDict.volume24h.length - 1,
        selectedDataBar: abbrNumber(dataDict.volume24h[dataDict.tvl.length - 1][1]),
      });
    });
  }

  onLineGraphHover = (newData, newIndex) => {
    this.setState({
      selectedDataLine: abbrNumber(newData),
      selectedIndexLine: newIndex,
    });
  };

  onBarGraphHover = (newData, newIndex) => {
    this.setState({
      selectedDataBar: abbrNumber(newData),
      selectedIndexBar: newIndex,
    });
  };

  render() {
    // const outsideClickRef = useDetectClickOutside({ onTriggered: this.onSearchBlur });
    const { visible, visibleSearchBar, tabIndex, transactionView } = this.state;
    return (
      <div className={styles.marketRoot}>
        <MarketSearchBar
          dataSourceCoin={dataSourceCoin}
          dataSourcePool={dataSourcePool}
          visible={true}
        />
        <div className={styles.chartsMain}>
          <div className={styles.chartSectionMain}>
            {this.state.chartData.tvl.length > 0 ? (
              <>
                <div className={styles.graphStats}>
                  <div className={styles.statName}>TVL</div>
                  <div className={styles.statValue}>$ {this.state.selectedDataLine}</div>
                  <div className={styles.statName}>
                    {this.state.chartData.tvl[this.state.selectedIndexLine][0]}
                  </div>
                </div>
                <div className={styles.chartWrapper}>
                  <AcyLineChart
                    data={this.state.chartData.tvl}
                    onHover={this.onLineGraphHover}
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
            {this.state.chartData.volume24h.length > 0 ? (
              <>
                <div className={styles.graphStats}>
                  <div className={styles.statName}>VOLUME 24H</div>
                  <div className={styles.statValue}>{`$ ${this.state.selectedDataBar}`}</div>
                  <div className={styles.statName}>
                    {this.state.chartData.volume24h[this.state.selectedIndexBar][0]}
                  </div>
                </div>
                <div className={styles.chartWrapper}>
                  <AcyBarChart
                    data={this.state.chartData.volume24h}
                    showXAxis
                    barColor="#1c9965"
                    onHover={this.onBarGraphHover}
                  />
                </div>
              </>
            ) : (
              <Icon type="loading" />
            )}
          </div>
        </div>
        {this.state.overallVolume !== -1 && this.state.overallTvl !== -1 ? (
          <Row className={styles.marketOverview} justify="space-around">
            <Col span={8}>
              Volume 24H <strong>$ {this.state.overallVolume}</strong>{' '}
              <span className={styles.priceChangeUp}>0.36%</span>
            </Col>
            <Col span={8}>
              Fees 24H <strong>$1.66m </strong> <span className={styles.priceChangeUp}>0.36%</span>
            </Col>
            <Col span={8}>
              TVL <strong>$ {this.state.overallTvl}</strong>{' '}
              <span className={styles.priceChangeDown}>-0.36%</span>
            </Col>
          </Row>
        ) : (
          <Icon type="loading" />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Top Tokens</h2>
          <h3>
            <Link style={{ color: '#b5b5b6' }} to="/market/list/token">
              Explore
            </Link>
          </h3>
        </div>
        {this.state.tokenInfo.length > 0 ? (
          <TokenTable dataSourceCoin={this.state.tokenInfo} />
        ) : (
          <Icon type="loading" />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Top Pools</h2>
          <h3>
            <Link style={{ color: '#b5b5b6' }} to="/market/list/pool">
              Explore
            </Link>
          </h3>
        </div>

        {this.state.poolInfo.length > 0 ? (
          <PoolTable dataSourcePool={this.state.poolInfo} />
        ) : (
          <Icon type="loading" />
        )}

        <h2>Transactions</h2>
        {this.state.transactions.length > 0 ? (
          <TransactionTable dataSourceTransaction={this.state.transactions} />
        ) : (
          <Icon type="loading" />
        )}
        <div style={{ height: '20px' }} />
      </div>
    );
  }
}

export default MarketIndex;
