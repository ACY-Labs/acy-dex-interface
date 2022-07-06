import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import AcyCard from '@/components/AcyCard';
import OptionComponent from '@/components/OptionComponent'
import PerpetualTabs from '@/components/PerpetualComponent/components/PerpetualTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import { fetcher, getInfoTokens, expandDecimals, useLocalStorageByChainId } from '@/acy-dex-futures/utils';
// import { API_URL, useConstantLoader, getGlobalTokenList, constantInstance } from '@/constants';
import { useConstantLoader, constantInstance } from '@/constants';
import { ARBITRUM_DEFAULT_COLLATERAL_SYMBOL } from '@/acy-dex-futures/utils';
import { ethers } from 'ethers'
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'

import styles from './styles.less'

const Option = props => {
  const { account, library, chainId, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();

  const { AddressZero } = ethers.constants

  const [mode, setMode] = useState('Buy')
  const [volume, setVolume] = useState(0)
  const [percentage, setPercentage] = useState('')

  const { perpetuals } = useConstantLoader()
  const readerAddress = perpetuals.getContract("Reader")
  const vaultAddress = perpetuals.getContract("Vault")
  const nativeTokenAddress = perpetuals.getContract("NATIVE_TOKEN")

  const tokens = constantInstance.perpetuals.tokenList;
  const whitelistedTokens = tokens.filter(token => token.symbol !== "USDG");
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address);

  const defaultTokenSelection = useMemo(() => ({
    ["Pool"]: {
      from: AddressZero,
      to: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
    },
    ["Long"]: {
      from: AddressZero,
      to: AddressZero,
    },
    ["Short"]: {
      from: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
      to: AddressZero,
    }
  }), [chainId, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL])


  const tokenAddresses = tokens.map(token => token.address)
  const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(chainId, "Exchange-token-selection-v2", defaultTokenSelection)


  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })
  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })
  const { data: fundingRateInfo, mutate: updateFundingRateInfo } = useSWR(account && [chainId, readerAddress, "getFundingRates"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, whitelistedTokenAddresses]),
  })

  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo);

  const setToTokenAddress = useCallback((selectedSwapOption, address) => {
    const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
    newTokenSelection[selectedSwapOption].to = address
    setTokenSelection(newTokenSelection)
  }, [tokenSelection, setTokenSelection])

  function getTokenBySymbol(tokenlist, symbol) {
    for (let i = 0; i < tokenlist.length; i++) {
      if (tokenlist[i].symbol === symbol) {
        return tokenlist[i]
      }
    }
    return undefined
  }
  const [kChartTab, setKChartTab] = useState("BTC")
  const kChartTabs = ["BTC", "ETH"]
  const selectChart = item => {
    setKChartTab(item)
    onClickSetActiveToken(item)
  }
  const onClickSetActiveToken = (e) => {
    console.log("hereim see click token", e)
    setActiveToken1((supportedTokens.filter(ele => ele.symbol == e))[0]);
  }

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        <div className={styles.chartTokenSelectorTab}>
            <PerpetualTabs
              option={kChartTab}
              options={kChartTabs}
              onChange={selectChart}
            />
          </div>
        <div className={`${styles.colItem} ${styles.priceChart}`}>
          <div style={{ borderTop: '0.75px solid #333333' }}>
            <ExchangeTVChart
              swapOption={'LONG'}
              fromTokenAddress={"0x0000000000000000000000000000000000000000"}
              toTokenAddress={"0x05d6f705C80d9F812d9bc1A142A655CDb25e2571"}
              // period={'5m'}
              infoTokens={infoTokens}
              chainId={chainId}
              // positions={positions}
              // savedShouldShowPositionLines,
              // orders={orders}
              setToTokenAddress={setToTokenAddress}
            />
          </div>
        </div>

        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <OptionComponent
              mode={mode}
              setMode={setMode}
              volume={volume}
              setVolume={setVolume}
              percentage={percentage}
              setPercentage={setPercentage}
            />
          </AcyCard>
        </div>
      </div>

    </div>
  );
}

export default Option
