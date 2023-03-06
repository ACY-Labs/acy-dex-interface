import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFeesData, useAlpData, useAlpPriceData } from '@/pages/Stats/Perpetual/dataProvider';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  yaxisFormatterNumber,
  tooltipLabelFormatter,
  tooltipFormatterNumber,
  CHART_HEIGHT,
  YAXIS_WIDTH,
  COLORS,
} from '@/pages/Stats/Perpetual/test'
import {
  ALP_DECIMALS,
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  parseValue,
  expandDecimals,
  bigNumberify,
  fetcher,
} from '@/acy-dex-futures/utils';
// import Reader from '@/acy-dex-futures/abis/ReaderV2.json'
import Vault from '@/acy-dex-futures/abis/Vault.json'
// import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
// import Glp from '@/acy-dex-futures/abis/ERC20.json'
// import Usdg from "@/acy-dex-futures/abis/Usdg.json"
//verified
import Reader from '@/abis/future-option-power/Reader.json';
import Alp from '@/abis/future-option-power/Alp.json'

import useSWR from 'swr'
import AcyCard from '../AcyCard';
import ComponentTabs from '../ComponentTabs';
import ChartWrapper from '@/pages/Stats/Perpetual/components/ChartWrapper';
import Portfolio from '@/pages/Perpetual/components/Portfolio';
import { GlpSwapTokenTable } from '../PerpetualComponent/components/GlpSwapBox';
import { useConstantLoader, constantInstance } from '@/constants';
import { useChainId } from '@/utils/helpers';
import { useWeb3React } from '@web3-react/core';
import { getTokens, getContract } from '@/constants/future_option_power.js';

import styles from './styles.less';

const AcyPool = props => {

  const { account } = useConstantLoader();
  // const { chainId } = useChainId()

  //TODO: chainId should be retrieved from useChainId
  const chainId = 80001
  const { active, activate, library } = useWeb3React()

  const [poolTab, setPoolTab] = useState("ALP Price")
  const poolTabs = ["ALP Price", "Portfolio"]

  const [poolGraphTab, setPoolGraphTab] = useState("Action")
  const poolGraphTabs = ["Action"]

  const NOW = Math.floor(Date.now() / 1000)
  const DEFAULT_GROUP_PERIOD = 86400
  const [groupPeriod, setGroupPeriod] = useState(DEFAULT_GROUP_PERIOD)
  const params = { undefined, NOW, groupPeriod }

  const [feesData, feesLoading] = useFeesData(params)
  const [alpData, alpLoading] = useAlpData(params)
  const [alpPriceData, alpPriceDataLoading] = useAlpPriceData(alpData, feesData, params)

  const tokens = getTokens(chainId)

  const [isBuying, setIsBuying] = useState(true)
  const [swapTokenAddress, setSwapTokenAddress] = useState(tokens[0].address)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  const [alpValue, setAlpValue] = useState("")
  const alpAmount = parseValue(alpValue, ALP_DECIMALS)

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")
  const alpAddress = getContract(chainId, 'alp')

  const tokenAddresses = tokens.map(token => token.address)
  
  const { data: poolInfo, mutate: updatePoolInfo } = useSWR([chainId, readerAddress, "getPoolInfo", poolAddress], {
    fetcher: fetcher(library, Reader),
  })
  const { data: alpBalance, mutate: updateAlpBalance } = useSWR([chainId, alpAddress, "balanceOf", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Alp),
  })
  const { data: alpSupply, mutate: updateAlpSupply } = useSWR([chainId, alpAddress, "totalSupply"], {
    fetcher: fetcher(library, Alp),
  })
  //for aum
  const { data: lpInfo, mutate: updateLpInfo } = useSWR([chainId, readerAddress, "getLpInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader),
  })
  //for GlpSwapTokenTable
  const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader)
  });

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updatePoolInfo()
        updateAlpBalance()
        updateAlpSupply()
        updateLpInfo()
        updateTokenInfo()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId,
    updatePoolInfo,
    updateAlpBalance,
    updateAlpSupply,
    updateLpInfo,
    updateTokenInfo,
  ])

  const alpPrice = poolInfo ? poolInfo.totalSupply.gt(0) ? parseInt(poolInfo.liquidity) / parseInt(poolInfo.totalSupply) : expandDecimals(1, USD_DECIMALS) : 0
  const alpBalanceUsd = alpBalance ? alpBalance.mul(parseValue(alpPrice, ALP_DECIMALS)) : bigNumberify(0)
  const alpSupplyUsd = alpSupply ? alpSupply.mul(parseValue(alpPrice, ALP_DECIMALS)) : bigNumberify(0)
  const aum = lpInfo ? lpInfo.liquidity : bigNumberify(0)
 
  return (
    <div className={`${styles.colItem} ${styles.priceChart}`}>
      <div>
        <div className={styles.chartTokenSelectorTab}>
          <ComponentTabs
            option={poolTab}
            options={poolTabs}
            onChange={(item)=>{setPoolTab(item)}}
          />
        </div>

        {poolTab == "ALP Price" &&
          <div className={styles.chart}>
            <ChartWrapper
              title="ALP Price Comparison"
              loading={alpLoading}
              data={alpPriceData}
            >
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={alpPriceData} syncId="syncAlp">
                  <CartesianGrid strokeDasharray="3 3" stroke='#333333' />
                  <XAxis dataKey="timestamp" tickFormatter={tooltipLabelFormatter} minTickGap={30} />
                  <YAxis dataKey="performanceSyntheticCollectedFees" domain={[60, 210]} unit="%" tickFormatter={yaxisFormatterNumber} width={YAXIS_WIDTH} />
                  <YAxis dataKey="alpPrice" domain={[0.4, 1.7]} orientation="right" yAxisId="right" tickFormatter={yaxisFormatterNumber} width={YAXIS_WIDTH} />
                  <Tooltip
                    formatter={tooltipFormatterNumber}
                    labelFormatter={tooltipLabelFormatter}
                    contentStyle={{ textAlign: 'left' }}
                  />
                  <Legend />
                  <Line isAnimationActive={false} type="monotone" unit="$" strokeWidth={1} yAxisId="right" dot={false} dataKey="alpPrice" name="ALP Price" stroke={COLORS[1]} />
                  <Line isAnimationActive={false} type="monotone" unit="$" strokeWidth={1} yAxisId="right" dot={false} dataKey="alpPlusFees" name="ALP w/ fees" stroke={COLORS[12]} />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>}

        {poolTab == "Portfolio" &&
          <>
            <Portfolio
              chainId={chainId}
              alpPrice={alpPrice}
              alpSupply={alpSupply}
              alpSupplyUsd={alpSupplyUsd}
              alpBalance={alpBalance}
              alpBalanceUsd={alpBalanceUsd}
              tokens={tokens}
              tokenList={tokens}
              aum={aum}
            />
            <AcyCard style={{ backgroundColor: 'transparent' }}>
              <GlpSwapTokenTable
                isBuying={isBuying}
                setIsBuying={setIsBuying}
                setSwapTokenAddress={setSwapTokenAddress}
                setIsWaitingForApproval={setIsWaitingForApproval}
                tokens={tokens}
                tokenInfo={tokenInfo}
                alpAmount={alpAmount}
                alpPrice={alpPrice}
                account={account}
              />
            </AcyCard>
          </>}
      </div>

      <div className={styles.bottomWrapper}>
        <div className={styles.chartTokenSelectorTab}>
          <ComponentTabs
            option={poolGraphTab}
            options={poolGraphTabs}
            onChange={(item)=>{setPoolGraphTab(item)}}
          />
        </div>
        {poolGraphTab == "Action" &&
          <div>Action</div>}
      </div>
    </div>
  );
}

export default AcyPool