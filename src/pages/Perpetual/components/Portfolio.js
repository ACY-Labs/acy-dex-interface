import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BASIS_POINTS_DIVISOR,
  ALP_DECIMALS,
  USD_DECIMALS,
  USDG_ADDRESS,
  DEFAULT_MAX_USDG_AMOUNT,
  parseValue,
  expandDecimals,
  bigNumberify,
  formatAmount,
} from '@/acy-dex-futures/utils';
import { getServerUrl } from '@/acy-dex-futures/utils/_Helpers';
import { getTokens } from '@/acy-dex-futures/data/_Tokens';
import { getContract } from '@/acy-dex-futures/utils/Addresses';
import useSWR from 'swr'
import { fetcher } from '@/acy-dex-futures/utils';
import glp40Icon from '@/pages/BuyGlp/components/ic_glp_40.svg'
import TokenWeightChart from './TokenWeightChart';
import TokenWeightPieChart from './TokenWeightPieChart';
import { useAlpData, useFeesData, useVolumeData, useTotalVolumeFromServer } from '@/pages/Stats/Perpetual/dataProvider';
import { formatNumber } from '@/pages/Stats/Perpetual/test';

import styles from '../styles.less';

function getTokenBySymbol(tokenlist, symbol) {
  for (let i = 0; i < tokenlist.length; i++) {
    if (tokenlist[i].symbol === symbol) {
      return tokenlist[i]
    }
  }
  return undefined
}

const NOW = Math.floor(Date.now() / 1000)
const Portfolio = props => {

  const {
    chainId,
    alpPrice,
    alpSupply,
    alpSupplyUsd,
    alpBalance,
    alpBalanceUsd,
    tokens,
    tokenList,
    aum,
  } = props

  // const { infoTokens } = useInfoTokens(chainId, vaultTokenInfo, tokens, undefined, undefined); 
  const DEFAULT_GROUP_PERIOD = 86400
  const [fromValue, setFromValue] = useState()
  const [toValue, setToValue] = useState()
  const [groupPeriod, setGroupPeriod] = useState(DEFAULT_GROUP_PERIOD)

  const setDateRange = useCallback(range => {
    setFromValue(new Date(Date.now() - range * 1000).toISOString().slice(0, 10))
    setToValue(undefined)
  }, [setFromValue, setToValue])

  const from = fromValue ? +new Date(fromValue) / 1000 : undefined
  const to = toValue ? +new Date(toValue) / 1000 : NOW

  const params = { from, to, groupPeriod }
  const [alpData, alpLoading] = useAlpData(params)
  const [totalAum, totalAumDelta] = useMemo(() => {
    if (!alpData) {
      return []
    }
    const total = alpData[alpData.length - 1]?.aum
    const delta = total - alpData[alpData.length - 2]?.aum
    return [total, delta]
  }, [alpData])

  const [feesData, feesLoading] = useFeesData(params)
  const [totalFees, totalFeesDelta] = useMemo(() => {
    if (!feesData) {
      return []
    }
    const total = feesData[feesData.length - 1]?.cumulative
    const delta = total - feesData[feesData.length - 2]?.cumulative
    return [total, delta]
  }, [feesData])

  const [volumeData, volumeLoading] = useVolumeData(params)
  const [totalVolume] = useTotalVolumeFromServer()
  const totalVolumeDelta = useMemo(() => {
    if (!volumeData) {
      return null
    }
    return volumeData[volumeData.length - 1].all
  }, [volumeData])

  const eth = tokens[getTokenBySymbol(tokens, "ETH").address];
  const ethFloorPriceFund = expandDecimals(350 + 148 + 384, 18);
  const glpFloorPriceFund = expandDecimals(660001, 18);
  const usdcFloorPriceFund = expandDecimals(784598 + 200000, 30);

  let totalFloorPriceFundUsd;
  if (eth && eth.contractMinPrice && alpPrice) {
    const ethFloorPriceFundUsd = ethFloorPriceFund.mul(eth.contractMinPrice).div(expandDecimals(1, eth.decimals));
    const glpFloorPriceFundUsd = glpFloorPriceFund.mul(alpPrice).div(expandDecimals(1, 18));
    totalFloorPriceFundUsd = ethFloorPriceFundUsd.add(glpFloorPriceFundUsd).add(usdcFloorPriceFund);
  }

  // let glpMarketCap
  // if (alpPrice && alpSupply) {
  //   glpMarketCap = alpPrice.mul(alpSupply).div(expandDecimals(1, ALP_DECIMALS));
  // }

  // console.log('joy', glpMarketCap, formatAmount(glpMarketCap, ALP_DECIMALS, 0, true))

  let adjustedUsdgSupply = bigNumberify(0);
  for (let i = 0; i < tokenList.length; i++) {
    const token = tokenList[i];
    const tokenInfo = tokens[token.address];
    // console.log('joy tokenInfo', tokenInfo, tokenInfo.usdgAmount)
    if (tokenInfo && tokenInfo.usdgAmount) {
      adjustedUsdgSupply = adjustedUsdgSupply.add(tokenInfo.usdgAmount);
    }
  }

  let stableGlp = 0;
  let totalGlp = 0;
  // let glpPool = tokenList.map((token) => {
  //   const tokenInfo = infoTokens[token.address]; 
  //   if (tokenInfo.usdgAmount && adjustedUsdgSupply) {
  //     const currentWeightBps = tokenInfo.usdgAmount.mul(BASIS_POINTS_DIVISOR).div(adjustedUsdgSupply);
  //     if (tokenInfo.isStable) {
  //       stableGlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
  //     }
  //     totalGlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
  //     return {
  //       fullname: token.name,
  //       name: token.symbol,
  //       value: parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`),
  //     };
  //   }
  //   return null;
  // });

  let stablePercentage = totalGlp > 0 ? ((stableGlp * 100) / totalGlp).toFixed(2) : "0.0";

  return (
    <div className={styles.portfolio}>
      <div className={styles.statsContainer}>
        <div className={styles.statstitle}>Overview</div>
        <div className={styles.statsdivider} />
        <div className={styles.statscontent}>
          {alpData && <div className={styles.statsRow}>
            <div className={styles.label}>Assets Under Management</div>
            {/* <div className={styles.value}>{formatNumber(alpData[alpData.length - 1].aum, { currency: true })}</div> */}
            <div className={styles.value}>{formatAmount(aum, ALP_DECIMALS, 4, true)}</div>
            
            <div className={styles.statsRow}>
              <div className={styles.label}>APY</div>
              <div className={styles.value}>      ... %</div>
            </div>
          </div>}

          {/* <div className={styles.statsRow}>
            <div className={styles.label}>ALP Pool</div>
            <div className={styles.value}>{formatNumber(totalAum, { currency: true })}</div>
          </div>

          {volumeData && <div className={styles.statsRow}>
            <div className={styles.label}>24h Volume</div>
            <div className={styles.value}>{formatNumber(volumeData[volumeData.length - 1].cumulative, { currency: true })}</div>
          </div>}

          <div className={styles.statsRow}>
            <div className={styles.label}>Long Position</div>
            <div className={styles.value}>XXX</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.label}>Short Position</div>
            <div className={styles.value}>XXX</div>
          </div>

          {/* <div className={styles.statsRow}>
            <div className={styles.label}>Fees</div>
            <div className={styles.value}>XXX</div>
          </div> */}

          {/*<div className={styles.statsRow}>
            <div className={styles.label}>Total Fees</div>
            <div className={styles.value}>{formatNumber(totalFees, { currency: true })}</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.label}>Total Volume</div>
            <div className={styles.value}>{formatNumber(totalVolume, { currency: true })}</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.label}>Floor Price Fund</div>
            <div className={styles.value}>${formatAmount(totalFloorPriceFundUsd, 30, 0, true)}</div>
          </div> */}

        </div>

      </div>
      <div className={styles.statsContainer}>
        <div className={styles.GlpSwapstatsmark}>
          <div className={styles.GlpSwapstatsicon}>
            <img src={glp40Icon} alt="glp40Icon" />
          </div>
          <div className={styles.GlpSwapinfo}>
            <div className={styles.statstitle}>ALP</div>
            <div className={styles.statssubtitle}>ALP</div>
          </div>
        </div>
        <div className={styles.statsdivider} />
        <div className={styles.statscontent}>
          <div className={styles.statsRow}>
            <div className={styles.label}>Price</div>
            {/* <div className={styles.value}>${formatAmount(alpPrice, ALP_DECIMALS, 2, true)}</div> */}
            <div className={styles.value}>${alpPrice.toFixed(6)}</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.label}>Supply</div>
            {/* <div className={styles.value}>{formatAmount(alpSupply, ALP_DECIMALS, 4, true)} ALP (${formatAmount(alpSupplyUsd, ALP_DECIMALS, 0, true)})</div> */}
            <div className={styles.value}>{formatAmount(alpSupply, ALP_DECIMALS, 4, true)} ALP (${formatAmount(alpSupplyUsd, ALP_DECIMALS * 2, 4, true)})</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.label}>In Wallet</div>
            <div className={styles.value}>{formatAmount(alpBalance, ALP_DECIMALS, 4, true)} ALP (${formatAmount(alpBalanceUsd, ALP_DECIMALS * 2, 4, true)})</div>
            {/* <div className={styles.value}>${formatAmount(glpMarketCap, ALP_DECIMALS, 0, true)}</div> */}
          </div>

          {/* <div className={styles.statsRow}>
            <div className={styles.label}>Total Staked</div>
            <div className={styles.value}>${formatAmount(glpMarketCap, ALP_DECIMALS, 0, true)}</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.label}>Market Cap</div>
            <div className={styles.value}>${formatAmount(glpMarketCap, ALP_DECIMALS, 0, true)}</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.label}>Stablecoin Percentage</div>
            <div className={styles.value}>{stablePercentage}%</div>
          </div> */}
        </div>
        {/* Bar Chart */}
        {/* <TokenWeightChart
          tokenList={tokenList}
          infoTokens={infoTokens}
        /> */}
        <TokenWeightPieChart
          tokenList={tokenList}
        />
      </div>
    </div>
  );
}

export default Portfolio