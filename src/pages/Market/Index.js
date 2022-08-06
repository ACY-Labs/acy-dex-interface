import React, { useState, useEffect } from 'react';
import ConnectWallet from './ConnectWallet';
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';
import { PairsTable } from './TableComponent';
// import { CurrencyTable } from './UtilComponent.js';
// import { Icon } from 'antd';

import styles from './styles.less';

const MarketIndex = props => {

  const { account, library, chainId } = useConstantLoader();
  const [mode, setMode] = useState('pairs')

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

  // .logoURI, .name
  // .exchange, price, price_24h
  // volume, swaps
  // liquidity, fdv

  const test_pairs = [
    {
      name: 'USDT/WBNB',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      exchange: 'Pancakeswap v2',
      price: '$315.31',
      price_24h: '-0.56%',
      volume: '$31.66M',
      swaps: '70.15K',
      liquidity: '167.55M',
      fdv: '$1223.66B'
    },
    {
      name: 'USDC/OP',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
      exchange: 'Velodrome',
      price: '$1.9125',
      price_24h: '-2.76%',
      volume: '$18.89M',
      swaps: '69.30K',
      liquidity: '-',
      fdv: '$8.20B'
    },
    {
      name: 'BUSD/WBNB',
      logoURI: 'https://assets.coingecko.com/coins/images/9576/large/BUSD.png?1568947766',
      exchange: 'Pancakeswap v2',
      price: '$314.76',
      price_24h: '-0.77%',
      volume: '$31.50M',
      swaps: '55.37K',
      liquidity: '179.72M',
      fdv: '$1527.01B'
    },
  ]

  return (
    <div className={styles.marketRoot}>
      <ConnectWallet />

      <div className={styles.chartGrid}>

        {/* Live Pairs */}
        <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              Live Pairs
              <span className={styles.seeMore} onClick={() => { setMode('Live Pairs') }}>
                More >
              </span>
            </div>
            <div className={styles.statsdivider} />

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. WETH/</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. WETH/MOWO</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. WETH/Cocaine Inu</div>
                <div className={styles.value}>XXX</div>
              </div>
            </div>

          </div>
        </div>

        {/* Top Volume */}
        <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              Top Volume
              <span className={styles.seeMore} onClick={() => { setMode('Top Volume') }}>
                More >
              </span>
            </div>

            <div className={styles.statsdivider} />

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. ETH</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. USDC</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. USDT</div>
                <div className={styles.value}>XXX</div>
              </div>

            </div>

          </div>
        </div>

        {/* Trending */}
        <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              Trending
              <span className={styles.seeMore} onClick={() => { setMode('Trending') }}>
                More >
              </span>
            </div>

            <div className={styles.statsdivider} />

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. MARSRICE BSC</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. OHM</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. DRX ARBI</div>
                <div className={styles.value}>XXX</div>
              </div>

            </div>

          </div>
        </div>

        {/* Winners */}
        <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              Winners
              <span className={styles.seeMore} onClick={() => { setMode('Winners') }}>
                More >
              </span>
            </div>

            <div className={styles.statsdivider} />

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. WETH/</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. WETH/CHIRP</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. WETH/XNOM</div>
                <div className={styles.value}>XXX</div>
              </div>
            </div>

          </div>
        </div>

        {/* Losers */}
        <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              Losers
              <span className={styles.seeMore} onClick={() => { setMode('Losers') }}>
                More >
              </span>
            </div>

            <div className={styles.statsdivider} />

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. BUSD/WNFTC</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. USDT/CS</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. WBNB/MINE</div>
                <div className={styles.value}>XXX</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className={styles.tableToggleButtonContainer}>
        <button
          type="button"
          className={styles.leftToggleButton}
          style={{ backgroundColor: mode == 'Pairs' ? "#2e3032" : "transparent", color: mode == 'Pairs' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('Pairs') }}
        >
          Pairs
        </button>
        <button
          type="button"
          className={styles.middleToggleButton}
          style={{ backgroundColor: mode == 'Live Pairs' ? "#2e3032" : "transparent", color: mode == 'Live Pairs' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('Live Pairs') }}
        >
          Live Pairs
        </button>
        <button
          type="button"
          className={styles.middleToggleButton}
          style={{ backgroundColor: mode == 'Top Volume' ? "#2e3032" : "transparent", color: mode == 'Top Volume' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('Top Volume') }}
        >
          Top Volume
        </button>
        <button
          type="button"
          className={styles.middleToggleButton}
          style={{ backgroundColor: mode == 'Trending' ? "#2e3032" : "transparent", color: mode == 'Trending' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('Trending') }}
        >
          Trending
        </button>
        <button
          type="button"
          className={styles.middleToggleButton}
          style={{ backgroundColor: mode == 'Winners' ? "#2e3032" : "transparent", color: mode == 'Winners' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('Winners') }}
        >
          Winners
        </button>
        <button
          type="button"
          className={styles.rightToggleButton}
          style={{ backgroundColor: mode == 'Losers' ? "#2e3032" : "transparent", color: mode == 'Losers' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('Losers') }}
        >
          Losers
        </button>
      </div>

      {mode == 'Pairs' && <PairsTable dataSource={test_pairs} />}





      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2>Cryptocurrencies</h2>
      </div>
      {coinList.length > 0 ? (
        <CurrencyTable dataSourceCoin={coinList} />
      ) : (
        <Icon type="loading" />
      )} */}
    </div>
  );

}

export default MarketIndex;
