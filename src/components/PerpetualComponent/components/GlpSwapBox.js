/* eslint-disable array-callback-return */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/extensions */
import React, { useState, useEffect, useImperativeHandle } from 'react'
import { useHistory } from 'react-router-dom'
import { ethers } from "ethers"
import { Icon, Tooltip, Tabs } from 'antd'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'
import { constantInstance, useConstantLoader } from '@/constants'
import { useConnectWallet } from '@/components/ConnectWallet'
import { AcyIcon, AcyTabs, AcyButton, AcyPerpetualButton } from "@/components/Acy"

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
import Reader from '@/acy-dex-futures/abis/Reader.json'
import RewardReader from '@/acy-dex-futures/abis/RewardReader.json'
import Vault from '@/acy-dex-futures/abis/Vault.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import Glp from '@/acy-dex-futures/abis/Glp.json'
import Usdg from "@/acy-dex-futures/abis/Usdg.json"
import RewardTracker from '@/acy-dex-futures/abis/RewardTracker.json'
import Vester from '@/acy-dex-futures/abis/Vester.json'
import RewardRouter from '@/acy-dex-futures/abis/RewardRouter.json'
import Token from '@/acy-dex-futures/abis/Token.json'
import { callContract } from '@/acy-dex-futures/Api'
import * as Api from '@/acy-dex-futures/Api';

import PerpetualTabs from './PerpetualTabs'
import BuyInputSection from '@/pages/BuyGlp/components/BuyInputSection'
import TokenTable from '@/pages/BuyGlp/components/SwapTokenTable'
import glp40Icon from '@/pages/BuyGlp/components/ic_glp_40.svg'

import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/powers.js';
import IPool from '@/abis/future-option-power/IPool.json'

import styles from './GlpSwap.less'

const { AddressZero } = ethers.constants
const { TabPane } = Tabs

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
    if (tokenlist[i].address === tokenAddr) {
      return tokenlist[i]
    }
  }
  return undefined
}

function getTokenfromSymbol(tokenlist, symbol) {
  for (let i = 0; i < tokenlist.length; i++) {
    if (tokenlist[i].symbol === symbol) {
      return tokenlist[i]
    }
  }
  return undefined
}

// function getWrappedToken(tokenlist) {
//   let wrappedToken;
//   for (const t of tokenlist) {
//     if (t.isWrapped) {
//       wrappedToken = t;
//     }
//   }
//   return wrappedToken;
// }

function getNativeToken(tokenlist) {
  let nativeToken;
  for (const t of tokenlist) {
    if (t.isNative) {
      nativeToken = t;
    }
  }
  return nativeToken;
}

export const GlpSwapBox = (props) => {

  const {
    isBuying,
    setIsBuying,
    swapTokenAddress,
    setSwapTokenAddress,
    isWaitingForApproval,
    setIsWaitingForApproval,
  } = props

  const { account } = useConstantLoader(props)

  const chainId = 80001;
  const { active, activate, library } = useWeb3React()
  const connectWallet = getInjectedHandler(activate)
  const savedSlippageAmount = getSavedSlippageAmount(chainId)

  const history = useHistory()
  const tabLabel = isBuying ? 'buy' : 'sell'

  // const tokens = constantInstance.perpetuals.tokenList;
  const tokens = getTokens(chainId);
  const whitelistedTokens = tokens.filter(t => t.symbol !== "USDG")
  const tokenList = whitelistedTokens.filter(t => !t.isWrapped)

  const [swapValue, setSwapValue] = useState("")
  const [glpValue, setGlpValue] = useState("")
  // const [swapTokenAddress, setSwapTokenAddress] = useState(tokens[0].address)
  const [isApproving, setIsApproving] = useState(false)
  // const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [anchorOnSwapAmount, setAnchorOnSwapAmount] = useState(true)
  const [feeBasisPoints, setFeeBasisPoints] = useState("")
  const [modalError, setModalError] = useState(false)

  // const tokensForBalanceAndSupplyQuery = [stakedGlpTrackerAddress, usdgAddress]

  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address)
  const readerAddress = getContract(chainId, "Reader");
  const vaultAddress = getContract(chainId, "Vault");
  const usdgAddress = getContract(chainId, "USDG");
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN");
  const routerAddress = getContract(chainId, "Router");
  const glpManagerAddress = getContract(chainId, "GlpManager");
  const glpAddress = getContract(chainId, "GLP");
  const rewardRouterAddress = getContract(chainId, "RewardRouter");
  const IPoolAddress = getContract(chainId, "pool");

  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })
  const tokenAddresses = tokens.map(token => token.address)
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })

  // const { data: balancesAndSupplies, mutate: updateBalancesAndSupplies } = useSWR([chainId, readerAddress, "getTokenBalancesWithSupplies", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, ReaderV2, [tokensForBalanceAndSupplyQuery]),
  // })

  // const { data: aums, mutate: updateAums } = useSWR([chainId, glpManagerAddress, "getAums"], {
  //   fetcher: fetcher(library, GlpManager),
  // })

  const { data: totalTokenWeights, mutate: updateTotalTokenWeights } = useSWR([chainId, vaultAddress, "totalTokenWeights"], {
    fetcher: fetcher(library, Vault),
  })
  const tokenAllowanceAddress = swapTokenAddress === AddressZero ? nativeTokenAddress : swapTokenAddress
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, glpManagerAddress], {
    fetcher: fetcher(library, Glp)
  });
  const { data: lastPurchaseTime, mutate: updateLastPurchaseTime } = useSWR([chainId, glpManagerAddress, "lastAddedAt", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, GlpManager),
  })

  // todo: glpBalance -> GLP.balanceOf(account)
  const { data: glpBalance, mutate: updateGlpBalance } = useSWR([chainId, glpAddress, "balanceOf", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Glp),
  })
  // const { data: glpBalance, mutate: updateGlpBalance } = useSWR([chainId, feeGlpTrackerAddress, "stakedAmounts", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, RewardTracker),
  // })

  // const { data: reservedAmount, mutate: updateReservedAmount } = useSWR([chainId, glpVesterAddress, "pairAmounts", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, Vester),
  // })

  // const { gmxPrice, mutate: updateGmxPrice } = useGmxPrice(chainId, { arbitrum: library }, active)
  // const rewardTrackersForStakingInfo = [ stakedGlpTrackerAddress, feeGlpTrackerAddress ]
  // const { data: stakingInfo, mutate: updateStakingInfo } = useSWR([chainId, rewardReaderAddress, "getStakingInfo", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, RewardReader, [rewardTrackersForStakingInfo]),
  // })

  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, undefined)
  const swapToken = getToken(tokens, swapTokenAddress)
  const swapTokenInfo = getTokenInfo(infoTokens, swapTokenAddress)
  const swapTokenBalance = (swapTokenInfo && swapTokenInfo.balance) ? swapTokenInfo.balance : bigNumberify(0)

  const swapAmount = parseValue(swapValue, swapToken && swapToken.decimals)
  const glpAmount = parseValue(glpValue, GLP_DECIMALS)
  const needApproval = isBuying && swapTokenAddress !== AddressZero && tokenAllowance && swapAmount && swapAmount.gt(tokenAllowance)

  const redemptionTime = lastPurchaseTime ? lastPurchaseTime.add(GLP_COOLDOWN_DURATION) : undefined
  const inCooldownWindow = redemptionTime && parseInt(Date.now() / 1000, 10) < redemptionTime

  const { data: glpSupply, mutate: updateGlpSupply } = useSWR([chainId, glpAddress, "totalSupply"], {
    fetcher: fetcher(library, Glp),
  })

  // todo: usdgSupply
  const { data: usdgSupply, mutate: updateUsdgSupply } = useSWR([chainId, usdgAddress, "totalSupply"], {
    fetcher: fetcher(library, Usdg),
  })
  // const glpSupply = balancesAndSupplies ? balancesAndSupplies[1] : bigNumberify(0)
  // const usdgSupply = balancesAndSupplies ? balancesAndSupplies[3] : bigNumberify(0)

  // let aum
  // if (aums && aums.length > 0) {
  //   aum = isBuying ? aums[0] : aums[1]
  // }
  const { data: aumInUsdg, mutate: updateAumInUsdg } = useSWR([chainId, glpManagerAddress, "getAumInUsda", true], {
    fetcher: fetcher(library, GlpManager),
  })
  const glpPrice = (aumInUsdg && aumInUsdg.gt(0) && glpSupply.gt(0)) ? aumInUsdg.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  // const glpPrice = (aum && aum.gt(0) && glpSupply.gt(0)) ? aum.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  let glpBalanceUsd
  if (glpBalance) {
    glpBalanceUsd = glpBalance.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  }
  const glpSupplyUsd = glpSupply ? glpSupply.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS)) : bigNumberify(0)

  // let reserveAmountUsd
  // if (reservedAmount) {
  //   reserveAmountUsd = reservedAmount.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  // }

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

  const onSelectSwapToken = (symbol) => {
    const token = getTokenfromSymbol(tokens, symbol)
    setSwapTokenAddress(token.address)
    setIsWaitingForApproval(false)
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
  // if (glpBalance && reservedAmount) {
  //   maxSellAmount = glpBalance.sub(reservedAmount)
  // }

  // const wrappedTokenSymbol = getWrappedToken(tokens).symbol
  const nativeTokenSymbol = getNativeToken(tokens).symbol

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        console.log("update on block: ", tokenAllowance, tokenAllowanceAddress)
        updateVaultTokenInfo()
        updateTokenBalances()
        // updateBalancesAndSupplies(undefined, true)
        // updateAums(undefined, true)
        updateTotalTokenWeights()
        updateTokenAllowance()
        updateLastPurchaseTime()
        // updateStakingInfo(undefined, true)
        // updateGmxPrice(undefined, true)
        // updateReservedAmount(undefined, true)
        updateGlpBalance()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId,
    updateVaultTokenInfo,
    updateTokenBalances,
    // updateBalancesAndSupplies,
    // updateAums, 
    updateTotalTokenWeights,
    updateTokenAllowance,
    updateLastPurchaseTime,
    // updateStakingInfo, 
    // updateGmxPrice,
    // updateReservedAmount, 
    updateGlpBalance
  ])

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
        return [`Insufficient ALP balance`]
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

    console.log("get primary text: ", needApproval, isWaitingForApproval)
    if (needApproval && isWaitingForApproval) { return "Waiting for Approval" }
    if (isApproving) { return `Approving ${swapToken.symbol}...` }
    if (needApproval) { return `Approve ${swapToken.symbol}` }

    if (isSubmitting) { return isBuying ? `Buying...` : `Selling...` }

    return isBuying ? "Buy ALP" : "Sell ALP"
  }

  const buyGlp = () => {
    setIsSubmitting(true)

    let params = [
      swapTokenAddress, // token address
      swapAmount, // token amount
      [], //OracleSignature[] memory oracleSignatures
    ]
    console.log("swapTokenAddress", swapTokenAddress)
    const contract = new ethers.Contract(IPoolAddress, IPool.abi, library.getSigner());
    const method = "addLiquidity"

    Api.callContract(chainId, contract, method, params, {
      // value,
      sentMsg: "Buy submitted!",
      failMsg: "Buy failed.",
      successMsg: `${parseFloat(glpAmount).toFixed(4)} ALP bought with ${parseFloat(swapAmount).toFixed(4)} ${swapToken.symbol}.`,
    })
      .then(async () => {
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const sellGlp = () => {
    setIsSubmitting(true)

    let params = [
      swapTokenAddress, // token address
      swapAmount, // token amount
      [], //OracleSignature[] memory oracleSignatures
    ]
    console.log("swapTokenAddress", swapTokenAddress)
    const contract = new ethers.Contract(IPoolAddress, IPool.abi, library.getSigner());
    const method = "removeLiquidity"

    Api.callContract(chainId, contract, method, params, {
      // value,
      sentMsg: "Sell submitted!",
      failMsg: "Sell failed.",
      successMsg: `${parseFloat(glpAmount).toFixed(4)} ALP sold for ${parseFloat(swapAmount).toFixed(4)} ${swapToken.symbol}.`,
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
      chainId,
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
      history.push('/login')
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

    // addLiquidity();
  }

  const [buySellLabel, setBuySellLabel] = useState("Buy ALP")
  const buySellTabs = ['Buy ALP', 'Sell ALP']

  // const switchSwapOption = (hash = '') => {
  //   history.push(`${history.location.pathname}#${hash}`)
  //   setIsBuying(!(hash === 'redeem'))
  // }

  const onSwapOptionChange = (opt) => {
    if (opt === "Sell ALP") {
      // switchSwapOption('redeem')
      setIsBuying(false)
      setBuySellLabel("Sell ALP")
    } else {
      // switchSwapOption()
      setIsBuying(true)
      setBuySellLabel("Buy ALP")
    }
  }

  //for contracts 

  const addLiquidity = async () => {
    console.log("add liquidity")
    let params = [
      swapTokenAddress, // token address
      swapValue, // token amount
      [], //OracleSignature[] memory oracleSignatures
    ]
    console.log("swapTokenAddress", swapTokenAddress)
    const contract = new ethers.Contract(IPoolAddress, IPool.abi, library.getSigner());
    let method = "addLiquidity";
    if (swapTokenAddress === AddressZero) {
      method = "addLiquidityETH";
      // params = []
    }
  }

  const removeLiquidity = async () => {
    let params = [
      swapTokenAddress, // token address
      swapValue, // token amount
      [], //OracleSignature[] memory oracleSignatures
    ]
    const contract = new ethers.Contract(IPoolAddress, IPool.abi, library.getSigner());
    let method = "removeLiquidity";
  }

  return (
    <div className="GlpSwap">
      <div className={styles.BuySellSelector}>
        <PerpetualTabs
          option={buySellLabel}
          options={buySellTabs}
          type="inline"
          onChange={onSwapOptionChange}
        />
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

      {/* <div className={styles.Arrow}>
        <Icon style={{ fontSize: '16px' }} type="arrow-down" />
      </div> */}

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

      <div className={styles.centerButton}>
        <AcyPerpetualButton
          style={{ marginTop: '25px' }}
          onClick={onClickPrimary}
          disabled={!isPrimaryEnabled()}
        >
          {getPrimaryText()}
        </AcyPerpetualButton>
      </div>

    </div>
  )

}

export const GlpSwapDetailBox = (props) => {

  const {
    isBuying,
    setIsBuying,
    tokens,
    infoTokens,
    glpPrice,
    glpBalance,
    glpBalanceUsd,
    // reservedAmount,
    // reserveAmountUsd,
    // stakingInfo,
    glpSupply,
    glpSupplyUsd,
    // gmxPrice,
  } = props

  // const wrappedTokenSymbol = getWrappedToken(tokens).symbol
  const nativeTokenSymbol = getNativeToken(tokens).symbol

  const nativeToken = getTokenInfo(infoTokens, AddressZero)
  // const stakingData = getStakingData(stakingInfo)

  // let totalApr = bigNumberify(0)
  // let feeGlpTrackerAnnualRewardsUsd
  // let feeGlpTrackerApr = bigNumberify(0)
  // if (stakingData && stakingData.feeGlpTracker && stakingData.feeGlpTracker.tokensPerInterval && nativeToken && nativeToken.minPrice && glpSupplyUsd && glpSupplyUsd.gt(0)) {
  //   feeGlpTrackerAnnualRewardsUsd = stakingData.feeGlpTracker.tokensPerInterval.mul(SECONDS_PER_YEAR).mul(nativeToken.minPrice).div(expandDecimals(1, 18))
  //   feeGlpTrackerApr = feeGlpTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(glpSupplyUsd)
  //   totalApr = totalApr.add(feeGlpTrackerApr)
  // }

  // let stakedGlpTrackerAnnualRewardsUsd
  // let stakedGlpTrackerApr = bigNumberify(0)
  // if (gmxPrice && stakingData && stakingData.stakedGlpTracker && stakingData.stakedGlpTracker.tokensPerInterval && glpSupplyUsd && glpSupplyUsd.gt(0)) {
  //   stakedGlpTrackerAnnualRewardsUsd = stakingData.stakedGlpTracker.tokensPerInterval.mul(SECONDS_PER_YEAR).mul(gmxPrice).div(expandDecimals(1, 18))
  //   stakedGlpTrackerApr = stakedGlpTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(glpSupplyUsd)
  //   totalApr = totalApr.add(stakedGlpTrackerApr)
  // }

  return (
    <div className={styles.GlpSwapstatscard}>
      <div className={styles.GlpSwapstatsmark}>
        <div className={styles.GlpSwapstatsicon}>
          <img src={glp40Icon} alt="glp40Icon" />
        </div>
        <div className={styles.GlpSwapinfo}>
          <div className={styles.statstitle}>ALP</div>
          <div className={styles.statssubtitle}>ALP</div>
        </div>
      </div>

      <div className={styles.GlpSwapdivider} />

      <div className={styles.GlpSwapstatscontent}>
        <div className={styles.GlpSwapcardrow}>
          <div className={styles.label}>Price</div>
          <div className={styles.value}>
            ${formatAmount(glpPrice, GLP_DECIMALS, 2, true)}
          </div>
        </div>
        <div className={styles.GlpSwapcardrow}>
          <div className={styles.label}>Wallet</div>
          <div className={styles.value}>
            {formatAmount(glpBalance, GLP_DECIMALS, 4, true)} ALP (${formatAmount(glpBalanceUsd, USD_DECIMALS, 2, true)})
          </div>
        </div>
      </div>

      <div className={styles.GlpSwapdivider} />

      <div className={styles.GlpSwapstatscontent}>
        {/* {!isBuying &&
          <div className={styles.GlpSwapcardrow}>
            <div className={styles.label}>Reserved</div>
            <Tooltip
              placement='bottomLeft'
              color='#b5b5b6'
              mouseEnterDelay={0.5}
              title={`${formatAmount(reservedAmount, 18, 4, true)} ALP have been reserved for vesting.`}
            >
              <div className={styles.TooltipHandle}>
                ${formatAmount(reservedAmount, 18, 4, true)} ALP (${formatAmount(reserveAmountUsd, USD_DECIMALS, 2, true)})
              </div>
            </Tooltip>
          </div>
        }
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
        </div> */}

        <div className={styles.GlpSwapcardrow}>
          <div className={styles.label}>Total Supply</div>
          <div className={styles.value}>
            {formatAmount(glpSupply, GLP_DECIMALS, 4, true)} ALP (${formatAmount(glpSupplyUsd, GLP_DECIMALS, 2, true)})
          </div>
        </div>
      </div>

    </div>
  )
}

export const GlpSwapTokenTable = (props) => {

  const {
    isBuying,
    setIsBuying,
    setSwapTokenAddress,
    setIsWaitingForApproval,
    tokenList,
    infoTokens,
    glpAmount,
    glpPrice,
    usdgSupply,
    totalTokenWeights,
    account
  } = props

  const onSelectSwapToken = (token) => {
    setSwapTokenAddress(token.address)
    setIsWaitingForApproval(false)
  }

  const tokenListData = []
  let totalPool = 0
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

    const tData = isBuying ? {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      price: formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, 2, true),
      pool: formatAmount(managedUsd, USD_DECIMALS, 2, true),
      wallet: `${formatKeyAmount(tokenInfo, "balance", tokenInfo.decimals, 2, true)} ${tokenInfo.symbol} ($${formatAmount(balanceUsd, USD_DECIMALS, 2, true)})`,
      fees: formatAmount(tokenFeeBps, 2, 2, true, "-") + ((tokenFeeBps !== undefined && tokenFeeBps.toString().length > 0) ? "%" : "")
    } : {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      price: formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, 2, true),
      available: `${formatKeyAmount(tokenInfo, "availableAmount", token.decimals, 2, true)} ${token.symbol} ($${formatAmount(availableAmountUsd, USD_DECIMALS, 2, true)})`,
      wallet: `${formatKeyAmount(tokenInfo, "balance", tokenInfo.decimals, 2, true)} ${tokenInfo.symbol} ($${formatAmount(balanceUsd, USD_DECIMALS, 2, true)}`,
      fees: formatAmount(tokenFeeBps, 2, 2, true, "-") + ((tokenFeeBps !== undefined && tokenFeeBps.toString().length > 0) ? "%" : "")
    }
    if (isBuying) {
      totalPool += parseFloat(tData.pool.replace(",", ""))
    }
    tokenListData.push(tData)
  })

  if (isBuying) {
    tokenListData.map((tData) => {
      tData.poolPercent = parseFloat(tData.pool.replace(",", "")) / totalPool * 100
      return tData;
    })
  }

  return (
    <>
      {tokenListData.length > 0
        ? (<TokenTable
          dataSourceCoin={tokenListData}
          isBuying={isBuying}
          onClickSelectToken={onSelectSwapToken}
          glpAmount={glpAmount}
          glpPrice={glpPrice}
          usdgSupply={usdgSupply}
          totalTokenWeights={totalTokenWeights}
          account={account}
        />)
        : (<Icon type="loading" />)}
    </>
  )
}