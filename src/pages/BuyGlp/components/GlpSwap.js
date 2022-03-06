
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/extensions */
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { ethers } from "ethers"
import { Icon, Tooltip } from 'antd'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'
import { useConstantLoader } from '@/constants'
import { useConnectWallet } from '@/components/ConnectWallet'
import { AcyIcon, AcyTabs, AcyButton } from "@/components/Acy"

import {
  getInfoTokens,
  getTokenInfo,
  expandDecimals,
  fetcher,
  bigNumberify,
  formatAmount,
  formatAmountFree,
  formatKeyAmount,
  getBuyGlpToAmount,
  getBuyGlpFromAmount,
  getSellGlpFromAmount,
  getSellGlpToAmount,
  parseValue,
  approveTokens,
  getUsd,
  adjustForDecimals,
  getInjectedHandler,
  getSavedSlippageAmount,
  GLP_DECIMALS,
  USD_DECIMALS,
  BASIS_POINTS_DIVISOR,
  GLP_COOLDOWN_DURATION,
  SECONDS_PER_YEAR,
  USDG_DECIMALS,
  DEFAULT_MAX_USDG_AMOUNT,
  PLACEHOLDER_ACCOUNT
} from '@/acy-dex-futures/utils/index'
import {
  readerAddress,
  rewardReaderAddress,
  vaultAddress,
  nativeTokenAddress,
  stakedGlpTrackerAddress,
  feeGlpTrackerAddress,
  usdgAddress,
  glpManagerAddress,
  rewardRouterAddress,
  glpVesterAddress,
  tempLibrary,
  tempChainID
} from '@/acy-dex-futures/samples/constants'
import ReaderV2 from '@/acy-dex-futures/abis/ReaderV2.json'
import RewardReader from '@/acy-dex-futures/abis/RewardReader.json'
import VaultV2 from '@/acy-dex-futures/abis/VaultV2.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import RewardTracker from '@/acy-dex-futures/abis/RewardTracker.json'
import Vester from '@/acy-dex-futures/abis/Vester.json'
import RewardRouter from '@/acy-dex-futures/abis/RewardRouter.json'
import Token from '@/acy-dex-futures/abis/Token.json'
import { callContract, useGmxPrice } from '@/acy-dex-futures/core/Perpetual'
import * as defaultToken from '@/acy-dex-futures/samples/TokenList'

import BuyInputSection from './BuyInputSection'
import TokenTable  from './SwapTokenTable'
import glp40Icon from './ic_glp_40.svg'

import styles from './GlpSwap.less'

const { AddressZero } = ethers.constants
const { AcyTabPane } = AcyTabs

function getStakingData(stakingInfo) {
  if (!stakingInfo || stakingInfo.length === 0) {
    return
  }

  const keys = ["stakedGlpTracker", "feeGlpTracker"]
  const data = {}
  const propsLength = 5

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    data[key] = {
      claimable: stakingInfo[i * propsLength],
      tokensPerInterval: stakingInfo[i * propsLength + 1],
      averageStakedAmounts: stakingInfo[i * propsLength + 2],
      cumulativeRewards: stakingInfo[i * propsLength + 3],
      totalSupply: stakingInfo[i * propsLength + 4]
    }
  }

  return data
}

function getToken(tokenlist, tokenAddr) {
  for (let i = 0; i < tokenlist.length; i++) {
    if(tokenlist[i].address === tokenAddr) {
      return tokenlist[i]
    }
  }
  return undefined
}

function getWrappedToken(tokenlist) {
  let wrappedToken;
  for (const t of tokenlist) {
    if(t.isWrapped) {
      wrappedToken = t;
    }
  }
  return wrappedToken;
}

function getNativeToken(tokenlist) {
  let nativeToken;
  for (const t of tokenlist) {
    if(t.isNative) {
      nativeToken = t;
    }
  }
  return nativeToken;
}

export default function GlpSwap(props) {

  const { isBuying, setIsBuying } = props
  const { account } = useConstantLoader(props)
  const savedSlippageAmount = getSavedSlippageAmount(tempChainID)

  const { active, activate, library } = useWeb3React()
  const connectWallet = getInjectedHandler(activate)
  // const connectWalletByLocalStorage = useConnectWallet();
  
  const history = useHistory()
  const tabLabel = isBuying ? 'buy' : 'sell'

  const tokens = defaultToken.default
  const whitelistedTokens = tokens.filter(t => t.symbol !== "USDG")
  const tokenList = whitelistedTokens.filter(t => !t.isWrapped)

  const [swapValue, setSwapValue] = useState("")
  const [glpValue, setGlpValue] = useState("")
  const [swapTokenAddress, setSwapTokenAddress] = useState(tokens[0].address)
  const [isApproving, setIsApproving] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [anchorOnSwapAmount, setAnchorOnSwapAmount] = useState(true)
  const [feeBasisPoints, setFeeBasisPoints] = useState("")
  const [modalError, setModalError] = useState(false)

  const tokensForBalanceAndSupplyQuery = [stakedGlpTrackerAddress, usdgAddress]
  

  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address)
  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([tempChainID, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, ReaderV2, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })

  const tokenAddresses = tokens.map(token => token.address)
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([tempChainID, readerAddress, "getTokenBalances", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, ReaderV2, [tokenAddresses]),
  })

  const { data: balancesAndSupplies, mutate: updateBalancesAndSupplies } = useSWR([tempChainID, readerAddress, "getTokenBalancesWithSupplies", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, ReaderV2, [tokensForBalanceAndSupplyQuery]),
  })

  const { data: aums, mutate: updateAums } = useSWR([tempChainID, glpManagerAddress, "getAums"], {
    fetcher: fetcher(library, GlpManager),
  })

  const { data: totalTokenWeights, mutate: updateTotalTokenWeights } = useSWR([tempChainID, vaultAddress, "totalTokenWeights"], {
    fetcher: fetcher(library, VaultV2),
  })

  const tokenAllowanceAddress = swapTokenAddress === AddressZero ? nativeTokenAddress : swapTokenAddress
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([tempChainID, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, glpManagerAddress], {
    fetcher: fetcher(library, Token),
  })

  const { data: lastPurchaseTime, mutate: updateLastPurchaseTime } = useSWR([tempChainID, glpManagerAddress, "lastAddedAt", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, GlpManager),
  })

  const { data: glpBalance, mutate: updateGlpBalance } = useSWR([tempChainID, feeGlpTrackerAddress, "stakedAmounts", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, RewardTracker),
  })

  const { data: reservedAmount, mutate: updateReservedAmount } = useSWR([tempChainID, glpVesterAddress, "pairAmounts", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Vester),
  })

  const { gmxPrice, mutate: updateGmxPrice } = useGmxPrice(tempChainID, { arbitrum: library }, active)

  const rewardTrackersForStakingInfo = [ stakedGlpTrackerAddress, feeGlpTrackerAddress ]
  const { data: stakingInfo, mutate: updateStakingInfo } = useSWR([tempChainID, rewardReaderAddress, "getStakingInfo", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, RewardReader, [rewardTrackersForStakingInfo]),
  })


  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, undefined)
  const swapToken = getToken(tokens, swapTokenAddress)
  const swapTokenInfo = getTokenInfo(infoTokens, swapTokenAddress)
  const swapTokenBalance = (swapTokenInfo && swapTokenInfo.balance) ? swapTokenInfo.balance : bigNumberify(0)

  const swapAmount = parseValue(swapValue, swapToken && swapToken.decimals)
  const glpAmount = parseValue(glpValue, GLP_DECIMALS)
  const needApproval = isBuying && swapTokenAddress !== AddressZero && tokenAllowance && swapAmount && swapAmount.gt(tokenAllowance)

  const redemptionTime = lastPurchaseTime ? lastPurchaseTime.add(GLP_COOLDOWN_DURATION) : undefined
  const inCooldownWindow = redemptionTime && parseInt(Date.now() / 1000, 10) < redemptionTime

  const glpSupply = balancesAndSupplies ? balancesAndSupplies[1] : bigNumberify(0)
  const usdgSupply = balancesAndSupplies ? balancesAndSupplies[3] : bigNumberify(0)
  let aum
  if (aums && aums.length > 0) {
    aum = isBuying ? aums[0] : aums[1]
  }
  const glpPrice = (aum && aum.gt(0) && glpSupply.gt(0)) ? aum.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  let glpBalanceUsd
  if (glpBalance) {
    glpBalanceUsd = glpBalance.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  }

  const glpSupplyUsd = glpSupply.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))


  let reserveAmountUsd
  if (reservedAmount) {
    reserveAmountUsd = reservedAmount.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  }

  const swapUsdMin = getUsd(swapAmount, swapTokenAddress, false, infoTokens)
  const glpUsdMax = (glpAmount && glpPrice) ? glpAmount.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS)) : undefined

  const onSwapValueChange = (e) => {
    setAnchorOnSwapAmount(true)
    setSwapValue(e.target.value)
  }

  const onGlpValueChange = (e) => {
    setAnchorOnSwapAmount(false)
    setGlpValue(e.target.value)
  }

  const onSelectSwapToken = (token) => {
    console.log('select token: ',token.symbol)
    setSwapTokenAddress(token.address)
    setIsWaitingForApproval(false)
  }

  const nativeToken = getTokenInfo(infoTokens, AddressZero)
  const stakingData = getStakingData(stakingInfo)

  let totalApr = bigNumberify(0)
  let feeGlpTrackerAnnualRewardsUsd
  let feeGlpTrackerApr
  if (stakingData && stakingData.feeGlpTracker && stakingData.feeGlpTracker.tokensPerInterval && nativeToken && nativeToken.minPrice && glpSupplyUsd && glpSupplyUsd.gt(0)) {
    feeGlpTrackerAnnualRewardsUsd = stakingData.feeGlpTracker.tokensPerInterval.mul(SECONDS_PER_YEAR).mul(nativeToken.minPrice).div(expandDecimals(1, 18))
    feeGlpTrackerApr = feeGlpTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(glpSupplyUsd)
    totalApr = totalApr.add(feeGlpTrackerApr)
  }

  let stakedGlpTrackerAnnualRewardsUsd
  let stakedGlpTrackerApr
  if (gmxPrice && stakingData && stakingData.stakedGlpTracker && stakingData.stakedGlpTracker.tokensPerInterval && glpSupplyUsd && glpSupplyUsd.gt(0)) {
    stakedGlpTrackerAnnualRewardsUsd = stakingData.stakedGlpTracker.tokensPerInterval.mul(SECONDS_PER_YEAR).mul(gmxPrice).div(expandDecimals(1, 18))
    stakedGlpTrackerApr = stakedGlpTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(glpSupplyUsd)
    totalApr = totalApr.add(stakedGlpTrackerApr)
  }


  let payBalance = "$0.00"
  let receiveBalance = "$0.00"
  if (isBuying) {
    if (swapUsdMin) {
      payBalance = `$${formatAmount(swapUsdMin, USD_DECIMALS, 2, true)}`
    }
    if (glpUsdMax) {
      receiveBalance = `$${formatAmount(glpUsdMax, USD_DECIMALS, 2, true)}`
    }
  } else {
    if (glpUsdMax) {
      payBalance = `$${formatAmount(glpUsdMax, USD_DECIMALS, 2, true)}`
    }
    if (swapUsdMin) {
      receiveBalance = `$${formatAmount(swapUsdMin, USD_DECIMALS, 2, true)}`
    }
  }

  let feePercentageText = formatAmount(feeBasisPoints, 2, 2, true, "-")
  if (feeBasisPoints !== undefined && feeBasisPoints.toString().length > 0) {
    feePercentageText += "%"
  }

  let maxSellAmount = glpBalance
  if (glpBalance && reservedAmount) {
    maxSellAmount = glpBalance.sub(reservedAmount)
  }

  const wrappedTokenSymbol = getWrappedToken(tokens).symbol
  const nativeTokenSymbol = getNativeToken(tokens).symbol

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updateVaultTokenInfo(undefined, true)
        updateTokenBalances(undefined, true)
        updateBalancesAndSupplies(undefined, true)
        updateAums(undefined, true)
        updateTotalTokenWeights(undefined, true)
        updateTokenAllowance(undefined, true)
        updateLastPurchaseTime(undefined, true)
        updateStakingInfo(undefined, true)
        updateGmxPrice(undefined, true)
        updateReservedAmount(undefined, true)
        updateGlpBalance(undefined, true)
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, tempChainID,
    updateVaultTokenInfo, updateTokenBalances, updateBalancesAndSupplies,
    updateAums, updateTotalTokenWeights, updateTokenAllowance,
    updateLastPurchaseTime, updateStakingInfo, updateGmxPrice,
    updateReservedAmount, updateGlpBalance])

  useEffect(() => {
    const updateSwapAmounts = () => {
      if (anchorOnSwapAmount) {
        if (!swapAmount) {
          setGlpValue("")
          setFeeBasisPoints("")
          return
        }
        if (isBuying) {
          const { amount: nextAmount, feeBasisPoints: feeBps } = getBuyGlpToAmount(swapAmount, swapTokenAddress, infoTokens, glpPrice, usdgSupply, totalTokenWeights)
          const nextValue = formatAmountFree(nextAmount, GLP_DECIMALS, GLP_DECIMALS)
          setGlpValue(nextValue)
          setFeeBasisPoints(feeBps)
        } else {
          const { amount: nextAmount, feeBasisPoints: feeBps } = getSellGlpFromAmount(swapAmount, swapTokenAddress, infoTokens, glpPrice, usdgSupply, totalTokenWeights)
          const nextValue = formatAmountFree(nextAmount, GLP_DECIMALS, GLP_DECIMALS)
          setGlpValue(nextValue)
          setFeeBasisPoints(feeBps)
        }

        return
      }

      if (!glpAmount) {
        setSwapValue("")
        setFeeBasisPoints("")
        return
      }

      if (swapToken) {
        if (isBuying) {
          const { amount: nextAmount, feeBasisPoints: feeBps } = getBuyGlpFromAmount(glpAmount, swapTokenAddress, infoTokens, glpPrice, usdgSupply, totalTokenWeights)
          const nextValue = formatAmountFree(nextAmount, swapToken.decimals, swapToken.decimals)
          setSwapValue(nextValue)
          setFeeBasisPoints(feeBps)
        } else {
          const { amount: nextAmount, feeBasisPoints: feeBps } = getSellGlpToAmount(glpAmount, swapTokenAddress, infoTokens, glpPrice, usdgSupply, totalTokenWeights, true)
          const nextValue = formatAmountFree(nextAmount, swapToken.decimals, swapToken.decimals)
          setSwapValue(nextValue)
          setFeeBasisPoints(feeBps)
        }
      }
    }
    updateSwapAmounts()
  }, [isBuying, anchorOnSwapAmount, swapAmount,
    glpAmount, swapToken, glpPrice, usdgSupply,
    totalTokenWeights])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const getError = () => {
    if (!isBuying && inCooldownWindow) {
      return [`Redemption time not yet reached`]
    }

    if (!swapAmount || swapAmount.eq(0)) { return ["Enter an amount"] }
    if (!glpAmount || glpAmount.eq(0)) { return ["Enter an amount"] }

    if (isBuying) {
      const swapTokenInfo = getTokenInfo(infoTokens, swapTokenAddress)
      if (swapTokenInfo && swapTokenInfo.balance && swapAmount && swapAmount.gt(swapTokenInfo.balance)) {
        return [`Insufficient ${swapTokenInfo.symbol} balance`]
      }

      if (swapTokenInfo.maxUsdgAmount && swapTokenInfo.usdgAmount && swapUsdMin) {
        const usdgFromAmount = adjustForDecimals(swapUsdMin, USD_DECIMALS, USDG_DECIMALS)
        const nextUsdgAmount = swapTokenInfo.usdgAmount.add(usdgFromAmount)
        if (swapTokenInfo.maxUsdgAmount.gt(0) && nextUsdgAmount.gt(swapTokenInfo.maxUsdgAmount)) {
          return [`${swapTokenInfo.symbol} pool exceeded, try different token`, true]
        }
      }
    }

    if (!isBuying) {
      if (maxSellAmount && glpAmount && glpAmount.gt(maxSellAmount)) {
        return [`Insufficient GLP balance`]
      }

      const swapTokenInfo = getTokenInfo(infoTokens, swapTokenAddress)
      if (swapTokenInfo && swapTokenInfo.availableAmount && swapAmount && swapAmount.gt(swapTokenInfo.availableAmount)) {
        return [`Insufficient liquidity`]
      }
    }

    return [false]
  }

  const isPrimaryEnabled = () => {
    if (!active) { return true }
    const [error, modal] = getError()
    if (error && !modal) { return false }
    if ((needApproval && isWaitingForApproval) || isApproving) { return false }
    if (isApproving) { return false }
    if (isSubmitting) { return false }
    return true
  }

  const getPrimaryText = () => {
    if (!active) { return "Connect Wallet" }
    const [error, modal] = getError()
    if (error && !modal) { return error }

    if (needApproval && isWaitingForApproval) { return "Waiting for Approval" }
    if (isApproving) { return `Approving ${swapToken.symbol}...` }
    if (needApproval) { return `Approve ${swapToken.symbol}` }

    if (isSubmitting) { return isBuying ? `Buying...` : `Selling...` }

    return isBuying ? "Buy GLP" : "Sell GLP"
  }

  const buyGlp = () => {
    setIsSubmitting(true)

    const minGlp = glpAmount.mul(BASIS_POINTS_DIVISOR - savedSlippageAmount).div(BASIS_POINTS_DIVISOR)

    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner())
    const method = swapTokenAddress === AddressZero ? "mintAndStakeGlpETH" : "mintAndStakeGlp"
    const params = swapTokenAddress === AddressZero ? [0, minGlp] : [swapTokenAddress, swapAmount, 0, minGlp]
    const value = swapTokenAddress === AddressZero ? swapAmount : 0

    callContract(tempChainID, contract, method, params, {
      value,
      sentMsg: "Buy submitted!",
      failMsg: "Buy failed.",
      successMsg: `${parseFloat(glpAmount).toFixed(4)} GLP bought with ${parseFloat(swapAmount).toFixed(4)} ${swapToken.symbol}.`,
    })
      .then(async () => {
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const sellGlp = () => {
    setIsSubmitting(true)

    const minOut = swapAmount.mul(BASIS_POINTS_DIVISOR - savedSlippageAmount).div(BASIS_POINTS_DIVISOR)

    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner())
    const method = swapTokenAddress === AddressZero ? "unstakeAndRedeemGlpETH" : "unstakeAndRedeemGlp"
    const params = swapTokenAddress === AddressZero ? [glpAmount, minOut, account] : [swapTokenAddress, glpAmount, minOut, account]

    callContract(tempChainID, contract, method, params, {
      sentMsg: "Sell submitted!",
      failMsg: "Sell failed.",
      successMsg: `${parseFloat(glpAmount).toFixed(4)} GLP sold for ${parseFloat(swapAmount).toFixed(4)} ${swapToken.symbol}.`,
    })
      .then(async () => {
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const approveFromToken = () => {
    approveTokens({
      setIsApproving,
      library,
      tokenAddress: swapToken.address,
      spender: glpManagerAddress,
      chainId: tempChainID,
      onApproveSubmitted: () => {
        setIsWaitingForApproval(true)
      },
      infoTokens,
      getTokenInfo
    })
  }

  const onClickPrimary = () => {

    if (!account) {
      connectWallet()
      // connectWalletByLocalStorage()
      return
    }

    if (needApproval) {
      approveFromToken()
      return
    }

    const [, modal] = getError()
    if (modal) {
      setModalError(true)
      return
    }

    if (isBuying) {
      buyGlp()
    } else {
      sellGlp()
    }
  }

  const switchSwapOption = (hash = '') => {
    history.push(`${history.location.pathname}#${hash}`)
    setIsBuying(!(hash === 'redeem'))
  }

  const onSwapOptionChange = (opt) => {
    if (opt === "sell") {
      switchSwapOption('redeem')
    } else {
      switchSwapOption()
    }
  }

  const tokenListData = []
  tokenList.map((token) => {
    let tokenFeeBps
    if (isBuying) {
      const { feeBasisPoints: feeBps } = getBuyGlpFromAmount(glpAmount, token.address, infoTokens, glpPrice, usdgSupply, totalTokenWeights)
      tokenFeeBps = feeBps
    } else {
      const { feeBasisPoints: feeBps } = getSellGlpToAmount(glpAmount, token.address, infoTokens, glpPrice, usdgSupply, totalTokenWeights)
      tokenFeeBps = feeBps
    }
    const tokenInfo = getTokenInfo(infoTokens, token.address)
    let managedUsd
    if (tokenInfo && tokenInfo.managedUsd) {
      managedUsd = tokenInfo.managedUsd
    }
    let availableAmountUsd
    if (tokenInfo && tokenInfo.minPrice && tokenInfo.availableAmount) {
      availableAmountUsd = tokenInfo.availableAmount.mul(tokenInfo.minPrice).div(expandDecimals(1, token.decimals))
    }
    let balanceUsd
    if (tokenInfo && tokenInfo.minPrice && tokenInfo.balance) {
      balanceUsd = tokenInfo.balance.mul(tokenInfo.minPrice).div(expandDecimals(1, token.decimals))
    }

    let maxUsdgAmount = DEFAULT_MAX_USDG_AMOUNT
    if (tokenInfo.maxUsdgAmount && tokenInfo.maxUsdgAmount.gt(0)) {
      maxUsdgAmount = tokenInfo.maxUsdgAmount
    }

    let tData = isBuying ? {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      price: formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, 2, true),
      pool: formatAmount(managedUsd, USD_DECIMALS, 2, true),
      wallet: formatKeyAmount(tokenInfo, "balance", tokenInfo.decimals, 2, true) + ' ' +  tokenInfo.symbol + ' ($' + formatAmount(balanceUsd, USD_DECIMALS, 2, true) + ')',
      fees: formatAmount(tokenFeeBps, 2, 2, true, "-") + ((tokenFeeBps !== undefined && tokenFeeBps.toString().length > 0) ? "%" : "")
    } : {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      price: formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, 2, true),
      available: formatKeyAmount(tokenInfo, "availableAmount", token.decimals, 2, true) + ' ' + token.symbol + ' ($' + formatAmount(availableAmountUsd, USD_DECIMALS, 2, true) +')',
      wallet: formatKeyAmount(tokenInfo, "balance", tokenInfo.decimals, 2, true) + ' ' + tokenInfo.symbol + ' ($' + formatAmount(balanceUsd, USD_DECIMALS, 2, true),
      fees: formatAmount(tokenFeeBps, 2, 2, true, "-") + ((tokenFeeBps !== undefined && tokenFeeBps.toString().length > 0) ? "%" : "")
    }

    tokenListData.push(tData)
  })

  return (
    <div className="GlpSwap">

      <div className={styles.GlpSwapcontent}>

        <div className={styles.GlpSwapstatscard}>
          <div className={styles.GlpSwapstatsmark}>
            <div className={styles.GlpSwapstatsicon}>
              <img src={glp40Icon} alt="glp40Icon" />
            </div>
            <div className={styles.GlpSwapinfo}>
              <div className={styles.statstitle}>GLP</div>
              <div className={styles.statssubtitle}>GLP</div>
            </div>
          </div>

          <div className={styles.GlpSwapdivider} />

          <div className={styles.GlpSwapstatscontent}>
            <div className={styles.GlpSwapcardrow}>
              <div className={styles.label}>Price</div>
              <div className={styles.value}>
                ${formatAmount(glpPrice, USD_DECIMALS, 2, true)}
              </div>
            </div>
            <div className={styles.GlpSwapcardrow}>
              <div className={styles.label}>Wallet</div>
              <div className={styles.value}>
                {formatAmount(glpBalance, GLP_DECIMALS, 4, true)} GLP (${formatAmount(glpBalanceUsd, USD_DECIMALS, 2, true)})
              </div>
            </div>
          </div>

          <div className={styles.GlpSwapdivider} />

          <div className={styles.GlpSwapstatscontent}>
            {!isBuying && 
            <div className={styles.GlpSwapcardrow}>
              <div className={styles.label}>Reserved</div>
              <Tooltip 
                placement='bottomLeft' 
                color='#b5b5b6' 
                mouseEnterDelay={0.5}
                title={`${formatAmount(reservedAmount, 18, 4, true)} GLP have been reserved for vesting.`}
              >
                <div className={styles.TooltipHandle}>
                  ${formatAmount(reservedAmount, 18, 4, true)} GLP (${formatAmount(reserveAmountUsd, USD_DECIMALS, 2, true)})
                </div>
              </Tooltip>
            </div>}
            <div className={styles.GlpSwapcardrow}>
              <div className={styles.label}>APR</div>
              <Tooltip 
                placement='bottomLeft' 
                color='#b5b5b6' 
                mouseEnterDelay={0.5}
                title={() => (
                  <>
                    <div className="Tooltip-row">
                      <span className="label">{nativeTokenSymbol} ({wrappedTokenSymbol}) APR{' '}</span>
                      <span>{formatAmount(feeGlpTrackerApr, 2, 2, false)}%</span>
                    </div>
                    <div className="Tooltip-row">
                      <span className="label">Escrowed GMX APR{' '}</span>
                      <span>{formatAmount(stakedGlpTrackerApr, 2, 2, false)}%</span>
                    </div>
                  </>
                )}
              >
                <div className={styles.TooltipHandle}>
                  ${formatAmount(totalApr, 2, 2, true)}%
                </div>
              </Tooltip>
            </div>
            
            <div className={styles.GlpSwapcardrow}>
              <div className={styles.label}>Total Supply</div>
              <div className={styles.value}>
                {formatAmount(glpSupply, GLP_DECIMALS, 4, true)} GLP (${formatAmount(glpSupplyUsd, USD_DECIMALS, 2, true)})
              </div>
            </div>
          </div>

        </div>

        <div className={styles.GlpSwapbox}>

          <div className={styles.BuySellTabs}>
            <AcyTabs 
              onChange={onSwapOptionChange}
              activeKey={tabLabel}
            >
              <AcyTabPane tab="Buy GLP" key='buy' />
              <AcyTabPane tab="Sell GLP" key='sell' />
            </AcyTabs> 
          </div>

          {isBuying && 
            <BuyInputSection
              token={swapToken}
              tokenlist={tokens}
              topLeftLabel='Pay ' 
              balance={payBalance} 
              topRightLabel='Balance: '
              tokenBalance={`${formatAmount(swapTokenBalance, swapToken.decimals, 4, true)}`}
              inputValue={swapValue}
              onInputValueChange={onSwapValueChange}
              onSelectToken={onSelectSwapToken}
            />}

          {!isBuying && 
            <BuyInputSection
              token={swapToken}
              tokenlist={tokens}
              topLeftLabel='Pay'
              balance={payBalance}
              topRightLabel='Available: '
              tokenBalance={`${formatAmount(maxSellAmount, GLP_DECIMALS, 4, true)}`}
              inputValue={glpValue}
              onInputValueChange={onGlpValueChange}
              isLocked={!isBuying}
            />}

          <div className={styles.Arrow}>
            <Icon style={{ fontSize: '16px' }} type="arrow-down" />
          </div>

          {isBuying && 
            <BuyInputSection
              token={swapToken}
              tokenlist={tokens}
              topLeftLabel="Receive"
              balance={receiveBalance}
              topRightLabel='Balance: '
              tokenBalance={`${formatAmount(glpBalance, GLP_DECIMALS, 4, true)}`}
              inputValue={glpValue}
              onInputValueChange={onGlpValueChange}
              isLocked={isBuying}
            />}

          {!isBuying && 
            <BuyInputSection
              token={swapToken}
              tokenlist={tokens}
              topLeftLabel="Receive"
              balance={receiveBalance}
              topRightLabel='Balance: '
              tokenBalance={`${formatAmount(swapTokenBalance, swapToken.decimals, 4, true)}`}
              inputValue={swapValue}
              onInputValueChange={onSwapValueChange}
              onSelectToken={onSelectSwapToken}
            />}

          <div>
            <div className={styles.ExchangeInfoRow}>
              <div className={styles.ExchangeInfoLabel}>
                {feeBasisPoints > 50 ? "WARNING: High Fees" : "Fees"}
              </div>
              <div className={styles.FeeBlock}>
                {isBuying &&
                <Tooltip 
                  placement='bottomRight' 
                  mouseEnterDelay={0.5}
                  title={() => (
                    <>
                      {feeBasisPoints > 50 && <div>To reduce fees, select a different asset to pay with.</div>}
                      Check the "Save on Fees" section below to get the lowest fee percentages.
                    </>
                  )}
                >
                  <div className={styles.TooltipHandle}>
                    {feePercentageText}
                  </div>
                </Tooltip>}
                {!isBuying &&
                <Tooltip 
                  placement='bottomRight' 
                  mouseEnterDelay={0.5}
                  title={() => (
                    <>
                      {feeBasisPoints > 50 && <div>To reduce fees, select a different asset to receive.</div>}
                      Check the "Save on Fees" section below to get the lowest fee percentages.
                    </>
                  )}
                >
                  <div className={styles.TooltipHandle}>
                    {feePercentageText}
                  </div>
                </Tooltip>}
              </div>
            </div>
          </div>

          <div>
            <AcyButton 
              style={{ marginTop: '25px' }}
              onClick={onClickPrimary} 
              disabled={!isPrimaryEnabled()}
            >
              {getPrimaryText()}
            </AcyButton>
          </div>
          

        </div>
        
      </div>

      <div className={styles.titleblock}>
        <h3>
          <AcyIcon.MyIcon width={30} type="arrow" />
          <span className={styles.span}>Save on Fees</span>
        </h3>
        {isBuying &&
        <div className={styles.subtitle}>
          Fees may vary depending on which asset you use to buy GLP.<br /> Enter the amount of GLP you want to purchase in the order form, then check here to compare fees.
        </div>}
        {!isBuying &&
        <div className={styles.subtitle}>
          Fees may vary depending on which asset you sell GLP for.<br /> Enter the amount of GLP you want to redeem in the order form, then check here to compare fees.
        </div>}
      </div>

      {tokenListData.length > 0 
      ? (<TokenTable 
          dataSourceCoin={tokenListData} 
          isBuying={isBuying} 
          onClickSelectToken={onSelectSwapToken}
      />) 
      : (<Icon type="loading" />)}

    </div>
  )

}