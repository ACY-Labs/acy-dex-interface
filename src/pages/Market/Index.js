import React, { useState, useEffect } from 'react';
import ConnectWallet from './ConnectWallet';
import axios from 'axios';
import { useWeb3React } from '@web3-react/core';
import { useChainId } from '@/utils/helpers';
import { PairsTable, LivePairsTable, TopVolumeTable, TrendingTable } from './TableComponent';

import styles from './styles.less';

const apiUrlPrefix = "https://stats.acy.finance/api"

const MarketIndex = props => {

  const { account, library } = useWeb3React()
  const { chainId } = useChainId()
  const [mode, setMode] = useState('Pairs')
  const [topVolumePairs, setTopVolumePairs] = useState([])
  const [winnersPairs, setWinnersPairs] = useState([])
  const [losersPairs, setLosersPairs] = useState([])

  const getPairList = async () => {
    // fetch top volume pair list
    let pairlist = await axios.get(`${apiUrlPrefix}/tokens-overview?chainId=${chainId}&orderBy=topvolume`).then(res => res.data).catch(e => { })
    let pairs = []
    for (let i = 0; i < pairlist.length; i++) {
      pairs.push({
        name: pairlist[i].token0 + '/' + pairlist[i].token1,
        logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
        price: 'undefined',
        price_24h: '$' + parseFloat(pairlist[i].priceVariation).toFixed(4),
        volume: '$' + parseFloat(pairlist[i].volumeUSD).toFixed(2),
        liquidity: pairlist[i].liquidity,
      })
    }
    setTopVolumePairs(pairs)

    // fetch winners pair list
    pairlist = await axios.get(`${apiUrlPrefix}/tokens-overview?chainId=${chainId}&orderBy=winners`).then(res => res.data)
    pairs = []
    for (let i = 0; i < pairlist.length; i++) {
      pairs.push({
        name: pairlist[i].token0 + '/' + pairlist[i].token1,
        logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
        exchange: 'undefined',
        price: 'undefined',
        price_24h: '$' + parseFloat(pairlist[i].priceVariation).toFixed(4),
        volume: '$' + parseFloat(pairlist[i].volumeUSD).toFixed(2),
        swaps: pairlist[i].txCount,
        liquidity: pairlist[i].liquidity,
        fdv: 'undefined',
      })
    }
    setWinnersPairs(pairs)

    // fetch losers pair list
    pairlist = await axios.get(`${apiUrlPrefix}/tokens-overview?chainId=${chainId}&orderBy=losers`).then(res => res.data)
    pairs = []
    for (let i = 0; i < pairlist.length; i++) {
      pairs.push({
        name: pairlist[i].token0 + '/' + pairlist[i].token1,
        logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
        exchange: 'undefined',
        price: 'undefined',
        price_24h: '$' + parseFloat(pairlist[i].priceVariation).toFixed(4),
        volume: '$' + parseFloat(pairlist[i].volumeUSD).toFixed(2),
        swaps: pairlist[i].txCount,
        liquidity: pairlist[i].liquidity,
        fdv: 'undefined',
      })
    }
    setLosersPairs(pairs)
  }

  useEffect(() => {
    getPairList()
  }, [])

  const test_pairs = [
    {
      name: 'USDT/WBNB', // token0/token1
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      exchange: 'Pancakeswap v2',
      price: '$315.31',
      price_24h: '-0.56%',
      price_7d: '-0.56%',
      price_30d: '-0.56%',
      volume: '$31.66M', // $volumeUSD
      swaps: '70.15K',
      liquidity: '167.55M', // liquidity
      fdv: '$1223.66B'
    },
    {
      name: 'USDC/OP',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
      exchange: 'Velodrome',
      price: '$1.9125',
      price_24h: '-2.76%',
      price_7d: '-2.76%',
      price_30d: '-2.76%',
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
      price_7d: '-0.77%',
      price_30d: '-0.77%',
      volume: '$31.50M',
      swaps: '55.37K',
      liquidity: '179.72M',
      fdv: '$1527.01B'
    },
    {
      name: 'USDT/WBNB',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      exchange: 'Pancakeswap v2',
      price: '$315.31',
      price_24h: '-0.56%',
      price_7d: '-0.56%',
      price_30d: '-0.56%',
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
      price_7d: '-2.76%',
      price_30d: '-2.76%',
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
      price_7d: '-0.77%',
      price_30d: '-0.77%',
      volume: '$31.50M',
      swaps: '55.37K',
      liquidity: '179.72M',
      fdv: '$1527.01B'
    },
    {
      name: 'USDT/WBNB',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      exchange: 'Pancakeswap v2',
      price: '$315.31',
      price_24h: '-0.56%',
      price_7d: '-0.56%',
      price_30d: '-0.56%',
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
      price_7d: '-2.76%',
      price_30d: '-2.76%',
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
      price_7d: '-0.77%',
      price_30d: '-0.77%',
      volume: '$31.50M',
      swaps: '55.37K',
      liquidity: '179.72M',
      fdv: '$1527.01B'
    },
  ]

  const test_livepairs = [
    {
      name: 'USDC/PANKY',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      listed_since: '32s',
      price: '-',
      volume: '-',
      initial_liquidity: '-',
      total_liquidity: '-',
      pool_amount: '-',
      pool_variation: '0%',
      pool_remaining: '-',
    },
    {
      name: 'WETH/ROWA',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      listed_since: '2m 40s',
      price: '$0.00002431',
      volume: '-',
      initial_liquidity: '2022-08-06',
      total_liquidity: '$5310.16',
      pool_amount: '1.55 ETH',
      pool_variation: '0.06%',
      pool_remaining: '1.6236 ETH',
    },
    {
      name: 'WETH/OYA',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      listed_since: '10m 30s',
      price: '$0.00004183',
      volume: '-',
      initial_liquidity: '2022-08-06',
      total_liquidity: '$5914.87',
      pool_amount: '1.5 ETH',
      pool_variation: '15.13%',
      pool_remaining: '1.72683 ETH',
    },
    {
      name: 'USDC/PANKY',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      listed_since: '32s',
      price: '-',
      volume: '-',
      initial_liquidity: '-',
      total_liquidity: '-',
      pool_amount: '-',
      pool_variation: '0%',
      pool_remaining: '-',
    },
    {
      name: 'WETH/ROWA',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      listed_since: '2m 40s',
      price: '$0.00002431',
      volume: '-',
      initial_liquidity: '2022-08-06',
      total_liquidity: '$5310.16',
      pool_amount: '1.55 ETH',
      pool_variation: '0.06%',
      pool_remaining: '1.6236 ETH',
    },
    {
      name: 'WETH/OYA',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
      listed_since: '10m 30s',
      price: '$0.00004183',
      volume: '-',
      initial_liquidity: '2022-08-06',
      total_liquidity: '$5914.87',
      pool_amount: '1.5 ETH',
      pool_variation: '15.13%',
      pool_remaining: '1.72683 ETH',
    },
  ]

  return (
    <div className={styles.marketRoot}>
      <ConnectWallet />

      {/* New Pairs */}
      <div className={styles.topChart}>
        <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              New Pairs
              <span className={styles.seeMore} onClick={() => { setMode('NewPairs') }}>
                More >
              </span>
            </div>
            {/* <div className={styles.statsdivider} /> */}

            <LivePairsTable dataSource={test_livepairs.slice(0, 5)} />

          </div>
        </div>
      </div>

      <div className={styles.chartGrid}>

        {/* Top Volume */}
        <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              Top Volume
              <span className={styles.seeMore} onClick={() => { setMode('TopVolume') }}>
                More >
              </span>
            </div>

            {/* <div className={styles.statsdivider} /> */}

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. {topVolumePairs[0]?.name}</div>
                <div className={styles.value}>{topVolumePairs[0]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. {topVolumePairs[1]?.name}</div>
                <div className={styles.value}>{topVolumePairs[1]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. {topVolumePairs[2]?.name}</div>
                <div className={styles.value}>{topVolumePairs[2]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>4. {topVolumePairs[3]?.name}</div>
                <div className={styles.value}>{topVolumePairs[3]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>5. {topVolumePairs[4]?.name}</div>
                <div className={styles.value}>{topVolumePairs[4]?.volume}</div>
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

            {/* <div className={styles.statsdivider} /> */}

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

              <div className={styles.statsRow}>
                <div className={styles.label}>4. DRX ARBI</div>
                <div className={styles.value}>XXX</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>5. DRX ARBI</div>
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

            {/* <div className={styles.statsdivider} /> */}

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. {winnersPairs[0]?.name}/</div>
                <div className={styles.value}>{winnersPairs[0]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. {winnersPairs[1]?.name}</div>
                <div className={styles.value}>{winnersPairs[1]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. {winnersPairs[2]?.name}</div>
                <div className={styles.value}>{winnersPairs[2]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>4. {winnersPairs[3]?.name}</div>
                <div className={styles.value}>{winnersPairs[3]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>5. {winnersPairs[4]?.name}</div>
                <div className={styles.value}>{winnersPairs[4]?.volume}</div>
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

            {/* <div className={styles.statsdivider} /> */}

            <div className={styles.statscontent}>
              <div className={styles.statsRow}>
                <div className={styles.label}>1. {losersPairs[0]?.name}</div>
                <div className={styles.value}>{losersPairs[0]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>2. {losersPairs[1]?.name}</div>
                <div className={styles.value}>{losersPairs[1]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>3. {losersPairs[2]?.name}</div>
                <div className={styles.value}>{losersPairs[2]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>4. {losersPairs[3]?.name}</div>
                <div className={styles.value}>{losersPairs[3]?.volume}</div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.label}>5. {losersPairs[4]?.name}</div>
                <div className={styles.value}>{losersPairs[4]?.volume}</div>
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
          style={{ backgroundColor: mode == 'NewPairs' ? "#2e3032" : "transparent", color: mode == 'LivePairs' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('NewPairs') }}
        >
          New Pairs
        </button>
        <button
          type="button"
          className={styles.middleToggleButton}
          style={{ backgroundColor: mode == 'TopVolume' ? "#2e3032" : "transparent", color: mode == 'TopVolume' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('TopVolume') }}
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
      {mode == 'Winners' && <PairsTable dataSource={winnersPairs} />}
      {mode == 'Losers' && <PairsTable dataSource={losersPairs} />}
      {mode == 'NewPairs' && <LivePairsTable dataSource={test_livepairs} />}
      {mode == 'TopVolume' && <TopVolumeTable dataSource={topVolumePairs} />}
      {mode == 'Trending' && <TrendingTable dataSource={test_pairs} />}

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
