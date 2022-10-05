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
  GLP_DECIMALS,
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  parseValue,
  getInfoTokens,
  expandDecimals,
  bigNumberify,
  fetcher,
} from '@/acy-dex-futures/utils';
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'
import Vault from '@/acy-dex-futures/abis/Vault.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import Glp from '@/acy-dex-futures/abis/ERC20.json'
import Usdg from "@/acy-dex-futures/abis/Usdg.json"

import useSWR from 'swr'
import AcyCard from '../AcyCard';
import PerpetualTabs from '../PerpetualComponent/components/PerpetualTabs';
import ChartWrapper from '@/pages/Stats/Perpetual/components/ChartWrapper';
import Portfolio from '@/pages/Perpetual/components/Portfolio';
import { GlpSwapTokenTable } from '../PerpetualComponent/components/GlpSwapBox';
import { useConstantLoader, constantInstance } from '@/constants';
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/powers.js';

import styles from './styles.less';

const AcyPool = props => {

  const { account, library, chainId } = useConstantLoader();

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

  const supportedTokens = getTokens(chainId)
  const tokens = getTokens(chainId)
  // const supportedTokens = constantInstance.perpetuals.tokenList;
  const whitelistedTokens = supportedTokens.filter(token => token.symbol !== "USDG");
  const glp_tokenList = whitelistedTokens.filter(t => !t.isWrapped)
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address);

  const [isBuying, setIsBuying] = useState(true)
  const [swapTokenAddress, setSwapTokenAddress] = useState(tokens[0].address)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  const [glpValue, setGlpValue] = useState("")
  const glpAmount = parseValue(glpValue, GLP_DECIMALS)

  const vaultAddress = getContract(chainId, "Vault")
  const usdgAddress = getContract(chainId, "USDG")
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
  const routerAddress = getContract(chainId, "Router")
  const glpManagerAddress = getContract(chainId, "GlpManager")
  const glpAddress = getContract(chainId, "GLP")
  const orderBookAddress = getContract(chainId, "OrderBook")
  const readerAddress = getContract(chainId, "Reader")

  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })

  const tokenAddresses = tokens.map(token => token.address)
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })

  const { data: fundingRateInfo, mutate: updateFundingRateInfo } = useSWR(account && [chainId, readerAddress, "getFundingRates"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, whitelistedTokenAddresses]),
  })

  const { data: totalTokenWeights, mutate: updateTotalTokenWeights } = useSWR([chainId, vaultAddress, "totalTokenWeights"], {
    fetcher: fetcher(library, Vault),
  })

  const { data: glpBalance, mutate: updateGlpBalance } = useSWR([chainId, glpAddress, "balanceOf", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Glp),
  })

  const { data: glpSupply, mutate: updateGlpSupply } = useSWR([chainId, glpAddress, "totalSupply"], {
    fetcher: fetcher(library, Glp),
  })

  const { data: glpUsdgSupply, mutate: updateGlpUsdgSupply } = useSWR([chainId, usdgAddress, "totalSupply"], {
    fetcher: fetcher(library, Usdg),
  })

  const { data: aumInUsdg, mutate: updateAumInUsdg } = useSWR([chainId, glpManagerAddress, "getAumInUsda", true], {
    fetcher: fetcher(library, GlpManager),
  })

  const glpPrice = (aumInUsdg && aumInUsdg.gt(0) && glpSupply && glpSupply.gt(0)) ? aumInUsdg.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)

  let glpBalanceUsd
  if (glpBalance) {
    glpBalanceUsd = glpBalance.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  }
  
  const glpSupplyUsd = glpSupply ? glpSupply.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS)) : bigNumberify(0)
 
  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo);

  return (
    <div className={`${styles.colItem} ${styles.priceChart}`}>
      <div>
        <div className={styles.chartTokenSelectorTab}>
          <PerpetualTabs
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
              glpPrice={glpPrice}
              glpSupply={glpSupply}
              glpSupplyUsd={glpSupplyUsd}
              tokens={tokens}
              tokenList={glp_tokenList}
              vaultTokenInfo={vaultTokenInfo}
              aum={aumInUsdg}
              infoTokens={infoTokens}
            />
            <AcyCard style={{ backgroundColor: 'transparent' }}>
              <GlpSwapTokenTable
                isBuying={isBuying}
                setIsBuying={setIsBuying}
                setSwapTokenAddress={setSwapTokenAddress}
                setIsWaitingForApproval={setIsWaitingForApproval}
                tokenList={glp_tokenList}
                infoTokens={infoTokens}
                glpAmount={glpAmount}
                glpPrice={glpPrice}
                usdgSupply={glpUsdgSupply}
                totalTokenWeights={totalTokenWeights}
                account={account}
              />
            </AcyCard>
          </>}
      </div>

      <div className={styles.bottomWrapper}>
        <div className={styles.chartTokenSelectorTab}>
          <PerpetualTabs
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