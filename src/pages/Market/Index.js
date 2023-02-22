import React, { useState, useEffect } from 'react';
import ConnectWallet from './ConnectWallet';
import axios from 'axios';
import { useWeb3React } from '@web3-react/core';
import { useChainId } from '@/utils/helpers';
import { PairsTable, LivePairsTable, TopVolumeTable, TrendingTable } from './TableComponent';
import ComponentTabs from '@/components/ComponentTabs';

import styles from './styles.less';

const apiUrlPrefix = "https://stats.acy.finance/api"

const MarketIndex = props => {

  const { account, library } = useWeb3React()
  const chainId = 137
  const [mode, setMode] = useState('Pairs')
  const [topVolumePairs, setTopVolumePairs] = useState([])
  const [winnersPairs, setWinnersPairs] = useState([])
  const [losersPairs, setLosersPairs] = useState([])
  const [newPairs, setNewPairs] = useState([])
  const [marketType, setMarketType] = useState("Spots Market")

  const marketTypes = ["Spots Market", "Futures Market", "Options Market", "Powers Market"]

  const getPairList = async () => {
    // fetch top volume pair list
    let pairlist = await axios.get(`${apiUrlPrefix}/tokens-overview?chainId=${chainId}&orderBy=topvolume`).then(res => res.data).catch(e => { })
    let pairs = []
    for (let i = 0; i < pairlist.length; i++) {
      pairs.push({
        name: pairlist[i].token0.replace('Wrapped ', 'W').replace('(PoS)', '') + '/' + pairlist[i].token1.replace('Wrapped ', 'W').replace('(PoS)', ''),
        address0: pairlist[i].token0Address,
        address1: pairlist[i].token1Address,
        price: (pairlist[i].token0Price / pairlist[i].token1Price).toPrecision(2),
        price_24h: pairlist[i].priceVariation,
        volume: parseFloat(pairlist[i].volumeUSD).toFixed(2),
        swaps: pairlist[i].txCount,
        liquidity: pairlist[i].liquidity,
        exchange: pairlist[i].exchange,
      })
    }
    setTopVolumePairs(pairs)

    // fetch winners pair list
    pairlist = await axios.get(`${apiUrlPrefix}/tokens-overview?chainId=${chainId}&orderBy=winners`).then(res => res.data)
    pairs = []
    for (let i = 0; i < pairlist.length; i++) {
      pairs.push({
        name: pairlist[i].token0.replace('Wrapped ', 'W').replace('(PoS)', '') + '/' + pairlist[i].token1.replace('Wrapped ', 'W').replace('(PoS)', ''),
        address0: pairlist[i].token0Address,
        address1: pairlist[i].token1Address,
        exchange: pairlist[i].exchange,
        price: (pairlist[i].token0Price / pairlist[i].token1Price).toPrecision(2),
        price_24h: pairlist[i].priceVariation,
        volume: parseFloat(pairlist[i].volumeUSD).toFixed(2),
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
        name: pairlist[i].token0.replace('Wrapped ', 'W').replace('(PoS)', '') + '/' + pairlist[i].token1.replace('Wrapped ', 'W').replace('(PoS)', ''),
        address0: pairlist[i].token0Address,
        address1: pairlist[i].token1Address,
        exchange: pairlist[i].exchange,
        price: (pairlist[i].token0Price / pairlist[i].token1Price).toPrecision(2),
        price_24h: pairlist[i].priceVariation,
        volume: parseFloat(pairlist[i].volumeUSD).toFixed(2),
        swaps: pairlist[i].txCount,
        liquidity: pairlist[i].liquidity,
        fdv: 'undefined',
      })
    }
    setLosersPairs(pairs)

    // fetch new pairs list
    pairlist = await axios.get(`${apiUrlPrefix}/new-pairs?chainId=${chainId}`).then(res => res.data)
    pairs = []
    for (let i = 0; i < pairlist.length; i++) {
      pairs.push({
        name: pairlist[i].token0.replace('Wrapped ', 'W').replace('(PoS)', '') + '/' + pairlist[i].token1.replace('Wrapped ', 'W').replace('(PoS)', ''),
        address0: pairlist[i].token0Address,
        address1: pairlist[i].token1Address,
        exchange: pairlist[i].exchange,
        price: pairlist[i].token1Price != "0" ? (pairlist[i].token0Price / pairlist[i].token1Price).toPrecision(2) : "-",
        price_24h: pairlist[i].priceVariation,
        volume: parseFloat(pairlist[i].volumeUSD).toFixed(2),
        swaps: pairlist[i].txCount,
        liquidity: pairlist[i].liquidity,
        createdAt: pairlist[i].createdAtTimestamp,
      })
    }
    setNewPairs(pairs)
  }

  useEffect(() => {
    getPairList()
  }, [])

  return (
    <div>
      <div style={{ paddingRight: '60%', border: '0.75px solid #333333' }}>
        <ComponentTabs
          option={marketType}
          options={marketTypes}
          onChange={item => { setMarketType(item) }}
        />
      </div>

      {marketType == "Spots Market" &&
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
                <div className={styles.statsdivider} />

                <LivePairsTable dataSource={newPairs.slice(0, 5)} />

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
                  {topVolumePairs.slice(0, 5).map((pair, idx) => pair ? (
                    <div className={styles.statsRow}>
                      <div className={styles.label}>{idx + 1}. {pair.name}</div>
                      <div className={styles.value}>{pair.volume}</div>
                    </div>) : null
                  )}
                </div>

              </div>
            </div>

            {/* Trending */}
            {/* <div className={styles.chartCell}>
          <div className={styles.statsContainer}>
            <div className={styles.statstitle}>
              Trending
              <span className={styles.seeMore} onClick={() => { setMode('Trending') }}>
                More >
              </span>
            </div>

            <div className={styles.statscontent}>
              {trendingPairs.slice(0, 5).map((pair, idx) => pair ? (
                <div className={styles.statsRow}>
                  <div className={styles.label}>{idx+1}. {pair.name}</div>
                  <div className={styles.value}>{(pair.price_24h*100).toPrecision(2)}%</div>
                </div>) : null
              )}
            </div>

          </div>
        </div> */}

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
                  {winnersPairs.slice(0, 5).map((pair, idx) => pair ? (
                    <div className={styles.statsRow}>
                      <div className={styles.label}>{idx + 1}. {pair.name}</div>
                      <div className={styles.value}>{(pair.price_24h * 100).toPrecision(2)}%</div>
                    </div>) : null
                  )}
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
                  {losersPairs.slice(0, 5).map((pair, idx) => pair ? (
                    <div className={styles.statsRow}>
                      <div className={styles.label}>{idx + 1}. {pair.name}</div>
                      <div className={styles.value}>{(pair.price_24h * 100).toPrecision(2)}%</div>
                    </div>) : null
                  )}
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
            {/* <button
          type="button"
          className={styles.middleToggleButton}
          style={{ backgroundColor: mode == 'NewPairs' ? "#2e3032" : "transparent", color: mode == 'LivePairs' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('NewPairs') }}
        >
          New Pairs
        </button> */}
            <button
              type="button"
              className={styles.middleToggleButton}
              style={{ backgroundColor: mode == 'TopVolume' ? "#2e3032" : "transparent", color: mode == 'TopVolume' ? "white" : "", border: '0.75px solid #333333' }}
              onClick={() => { setMode('TopVolume') }}
            >
              Top Volume
            </button>
            {/* <button
          type="button"
          className={styles.middleToggleButton}
          style={{ backgroundColor: mode == 'Trending' ? "#2e3032" : "transparent", color: mode == 'Trending' ? "white" : "", border: '0.75px solid #333333' }}
          onClick={() => { setMode('Trending') }}
        >
          Trending
        </button> */}
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

          {mode == 'Pairs' && <PairsTable dataSource={topVolumePairs} />}
          {mode == 'Winners' && <PairsTable dataSource={winnersPairs} />}
          {mode == 'Losers' && <PairsTable dataSource={losersPairs} />}
          {mode == 'NewPairs' && <LivePairsTable dataSource={newPairs} />}
          {mode == 'TopVolume' && <TopVolumeTable dataSource={topVolumePairs} />}
          {/* {mode == 'Trending' && <TrendingTable dataSource={topVolumePairs} />} */}

        </div>}

    </div>
  );

}

export default MarketIndex;
