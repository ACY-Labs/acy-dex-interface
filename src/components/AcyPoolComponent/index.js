import React, { useState } from 'react';
import { useConstantLoader } from '@/constants';
import { GlpSwapBox, GlpSwapDetailBox } from '../PerpetualComponent/components/GlpSwapBox';
import Reader from '@/acy-dex-futures/abis/Reader.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import Glp from '@/acy-dex-futures/abis/ERC20.json'
import useSWR from 'swr'
import {
  USD_DECIMALS,
  GLP_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  expandDecimals,
  fetcher,
  getInfoTokens,
  bigNumberify,
} from '@/acy-dex-futures/utils'
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/powers.js';

import styles from './styles.less';

const AcyPoolComponent = props => {

  const { account, library, perpetuals } = useConstantLoader();
  let chainId = 80001;

  const tokens = getTokens(chainId);
  const whitelistedTokens = tokens.filter(t => t.symbol !== "USDG")
  const tokenAddresses = tokens.map(token => token.address)
  // const readerAddress = perpetuals.getContract("Reader")
  // const vaultAddress = perpetuals.getContract("Vault")
  // const nativeTokenAddress = perpetuals.getContract("NATIVE_TOKEN")
  // const glpManagerAddress = perpetuals.getContract("GlpManager")
  // const glpAddress = perpetuals.getContract("GLP")
  const readerAddress = getContract(chainId, "Reader");
  const vaultAddress = getContract(chainId, "Vault");
  const usdgAddress = getContract(chainId, "USDG");
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN");
  const routerAddress = getContract(chainId, "Router");
  const glpManagerAddress = getContract(chainId, "GlpManager");
  const glpAddress = getContract(chainId, "GLP");
  const rewardRouterAddress = getContract(chainId, "RewardRouter");

  const [isBuying, setIsBuying] = useState(true)
  const [swapTokenAddress, setSwapTokenAddress] = useState(tokens[1].address)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address)
  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })

  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })

  const { data: glpBalance, mutate: updateGlpBalance } = useSWR([chainId, glpAddress, "balanceOf", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Glp),
  })

  const { data: glpSupply, mutate: updateGlpSupply } = useSWR([chainId, glpAddress, "totalSupply"], {
    fetcher: fetcher(library, Glp),
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
  console.log("contract getInfoTokens acy pool comp", tokens)
  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, undefined)

  return (
    <div className={styles.mainContent}>
      <GlpSwapBox
        isBuying={isBuying}
        setIsBuying={setIsBuying}
        swapTokenAddress={swapTokenAddress}
        setSwapTokenAddress={setSwapTokenAddress}
        isWaitingForApproval={isWaitingForApproval}
        setIsWaitingForApproval={setIsWaitingForApproval}
      />

      <GlpSwapDetailBox
        isBuying={isBuying}
        setIsBuying={setIsBuying}
        tokens={tokens}
        infoTokens={infoTokens}
        glpPrice={glpPrice}
        glpBalance={glpBalance}
        glpBalanceUsd={glpBalanceUsd}
        glpSupply={glpSupply}
        glpSupplyUsd={glpSupplyUsd}
      />
    </div>
  );
}

export default AcyPoolComponent