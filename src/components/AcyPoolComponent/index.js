import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ethers } from 'ethers';
import { Tooltip } from 'antd'
import { useChainId } from '@/utils/helpers';
import { useWeb3React } from '@web3-react/core';
import { useConstantLoader } from '@/constants';
import { getTokens, getContract } from '@/constants/future_option_power.js';
import { useConnectWallet } from '@/components/ConnectWallet';
import { approveTokens, addLiquidity, removeLiquidity } from '@/services/derivatives';
import {
  bigNumberify,
  parseValue,
  fetcher,
  expandDecimals,
  formatAmount,
  formatAmountFree,
  PLACEHOLDER_ACCOUNT,
  ALP_DECIMALS,
  USD_DECIMALS,
  LONGDIGIT,
  SHORTDIGIT,
  BASIS_POINTS_DIVISOR,
  MINT_BURN_FEE_BASIS_POINTS,
  BURN_FEE_BASIS_POINTS,
} from '@/acy-dex-futures/utils';
import ComponentTabs from '../ComponentTabs';
import BuyInputSection from '@/pages/BuyGlp/components/BuyInputSection';
import glp40Icon from '@/pages/BuyGlp/components/ic_glp_40.svg'
import ComponentButton from '../ComponentButton';
import ERC20 from '@/abis/future-option-power/ERC20.json';
import Router from '@/abis/future-option-power/Router.json';
import Reader from '@/abis/future-option-power/Reader.json';
import Alp from '@/abis/future-option-power/Alp.json'

import styles from './styles.less';

const AcyPoolComponent = props => {

  const { chainId } = useChainId()
  const { account, active, library } = useWeb3React()
  const connectWalletByLocalStorage = useConnectWallet()
  const tokens = getTokens(chainId)
  const [selectedToken, setSelectedToken] = useState(tokens[1])

  ///////////// read contract /////////////

  const poolAddress = getContract(chainId, "pool")
  const routerAddress = getContract(chainId, "router")
  const readerAddress = getContract(chainId, "reader");
  const alpAddress = getContract(chainId, 'alp')
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")

  const tokenAllowanceAddress = selectedToken.address === ethers.constants.AddressZero ? nativeTokenAddress : selectedToken.address;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, ERC20)
  });
  const { data: alpAllowance, mutate: updateAlpAllowance } = useSWR([chainId, alpAddress, "allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, ERC20)
  });
  const { data: poolInfo, mutate: updatePoolInfo } = useSWR([chainId, readerAddress, "getPoolInfo", poolAddress], {
    fetcher: fetcher(library, Reader),
  })
  const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader)
  });
  const { data: alpBalance, mutate: updateAlpBalance } = useSWR([chainId, alpAddress, "balanceOf", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Alp),
  })
  const { data: alpSupply, mutate: updateAlpSupply } = useSWR([chainId, alpAddress, "totalSupply"], {
    fetcher: fetcher(library, Alp),
  })

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updatePoolInfo()
        updateTokenInfo()
        updateTokenAllowance()
        updateAlpBalance()
        updateAlpSupply()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [
    active,
    library,
    chainId,
    updatePoolInfo,
    updateTokenInfo,
    updateTokenAllowance,
    updateAlpBalance,
    updateAlpSupply,
  ])

  ///////////// for UI /////////////

  const [isBuying, setIsBuying] = useState(true)
  const [mode, setMode] = useState("Buy ALP")
  const [selectedTokenValue, setSelectedTokenValue] = useState(0)
  const [selectedTokenAmount, setSelectedTokenAmount] = useState(parseValue(selectedTokenValue, selectedToken?.decimals))
  const [alpValue, setAlpValue] = useState(0)
  const [alpAmount, setAlpAmount] = useState(parseValue(alpValue, ALP_DECIMALS))
  const [feeBasisPoints, setFeeBasisPoints] = useState("")
  const [payBalance, setPayBalance] = useState('$0.00');
  const [receiveBalance, setReceiveBalance] = useState('$0.00');
  const [anchorOnSwapAmount, setAnchorOnSwapAmount] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  const needApproval = isBuying ?
    selectedToken.address != ethers.constants.AddressZero &&
    tokenAllowance &&
    selectedTokenAmount &&
    selectedTokenAmount.gt(tokenAllowance)
    : alpAllowance &&
    alpAmount &&
    alpAmount.gt(alpAllowance)

  const alpPrice = poolInfo ? poolInfo.totalSupply.gt(0) ? parseInt(poolInfo.liquidity) / parseInt(poolInfo.totalSupply) : expandDecimals(1, USD_DECIMALS) : 0
  const alpSupplyUsd = alpSupply ? alpSupply.mul(parseValue(alpPrice, ALP_DECIMALS)) : bigNumberify(0)
  const alpBalanceUsd = alpBalance ? alpBalance.mul(parseValue(alpPrice, ALP_DECIMALS)) : bigNumberify(0)
  const selectedTokenPrice = tokenInfo?.find(item => item.token?.toLowerCase() == selectedToken.address?.toLowerCase())?.price
  const selectedTokenBalance = tokenInfo?.find(item => item.token?.toLowerCase() == selectedToken.address?.toLowerCase())?.balance
  const amountUsd = selectedTokenPrice?.mul(selectedTokenAmount)

  let feePercentageText = formatAmount(feeBasisPoints, 2, 2, true, "-")
  if (feeBasisPoints !== undefined && feeBasisPoints.toString().length > 0) {
    feePercentageText += "%"
  }

  const onModeChange = (opt) => {
    if (opt === "Sell ALP") {
      setIsBuying(false)
      setMode("Sell ALP")
    } else {
      setIsBuying(true)
      setMode("Buy ALP")
    }
  }

  const onTokenValueChange = (e) => {
    setAnchorOnSwapAmount(true)
    setSelectedTokenValue(e.target.value)
  }

  const onAlpValueChange = (e) => {
    setAnchorOnSwapAmount(false)
    setAlpValue(e.target.value)
  }

  const onSelectToken = (symbol) => {
    setSelectedToken(tokens.filter(token => token.symbol == symbol)[0])
    setIsWaitingForApproval(false)
  }

  const getError = () => {
    if (!selectedTokenAmount || selectedTokenAmount.eq(0)) { return ["Enter an amount"] }
    if (!alpAmount || alpAmount.eq(0)) { return ["Enter an amount"] }

    if (isBuying) {
      if (selectedTokenBalance && selectedTokenAmount && selectedTokenAmount.gt(selectedTokenBalance)) {
        return [`Insufficient ${selectedToken.symbol} balance`]
      }
    } else {
      if (poolInfo && poolInfo.totalSupply && alpAmount && alpAmount.gt(poolInfo.totalSupply)) {
        return [`Insufficient ALP balance`]
      }
      if (poolInfo && selectedTokenAmount && selectedTokenAmount.gt(poolInfo.liquidity)) {
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
    if (isApproving) { return isBuying ? `Approving ${selectedToken.symbol}...` : 'Approving ALP...' }
    if (needApproval) { return isBuying ? `Approve ${selectedToken.symbol}` : 'Approve ALP' }
    if (isSubmitting) { return isBuying ? `Buying...` : `Selling...` }

    return isBuying ? "Buy ALP" : "Sell ALP"
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setSelectedTokenAmount(parseValue(selectedTokenValue, selectedToken?.decimals))
  }, [selectedTokenValue])

  useEffect(() => {
    setAlpAmount(parseValue(alpValue, ALP_DECIMALS))
  }, [alpValue])

  useEffect(() => {
    setIsSubmitting(false)
  }, [chainId, selectedToken, selectedTokenAmount, isBuying])

  useEffect(() => {
    if (selectedToken && isWaitingForApproval && !needApproval) {
      setIsWaitingForApproval(false)
    }
  }, [selectedToken, selectedTokenAmount, needApproval])

  useEffect(() => {
    if (selectedTokenValue == 0) {
      setPayBalance(`-`)
    }
    if (alpValue == '0') {
      setReceiveBalance(`-`)
    }
    if (selectedTokenPrice && selectedTokenValue && alpPrice && alpValue) {
      let swapBigValue = parseValue(selectedTokenValue, selectedToken.decimals)
      let alpBigPrice = parseValue(alpPrice, ALP_DECIMALS)
      let alpBigValue = parseValue(alpValue, ALP_DECIMALS)
      let pay = selectedTokenPrice.mul(swapBigValue)
      let receive = alpBigPrice.mul(alpBigValue)
      setPayBalance(`$${formatAmount(pay, selectedToken.decimals * 2, 2, true)}`)
      setReceiveBalance(`$${formatAmount(receive, ALP_DECIMALS * 2, 2, true)}`)
    }
  }, [selectedToken, selectedTokenValue, alpValue])

  useEffect(() => {
    if (anchorOnSwapAmount) {
      if (!selectedTokenAmount) {
        setAlpValue(0)
        setFeeBasisPoints("")
        return
      }
      if (isBuying) {
        
        let nextAmount = alpPrice && amountUsd?.div(parseValue(alpPrice, ALP_DECIMALS))
          .mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - MINT_BURN_FEE_BASIS_POINTS)

        let nextValue = formatAmountFree(nextAmount, ALP_DECIMALS, ALP_DECIMALS)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setAlpValue(nextValue)
        setFeeBasisPoints(MINT_BURN_FEE_BASIS_POINTS)
      } else {
        let nextAmount = alpPrice && amountUsd.div(parseValue(alpPrice, ALP_DECIMALS))
          .mul(expandDecimals(1, selectedToken.decimals)).div(expandDecimals(1, ALP_DECIMALS))
          .mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - BURN_FEE_BASIS_POINTS)

        let nextValue = formatAmountFree(nextAmount, ALP_DECIMALS, ALP_DECIMALS)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setAlpValue(nextValue)
        setFeeBasisPoints(BURN_FEE_BASIS_POINTS)
      }
      return
    }

    if (!alpAmount) {
      setSelectedTokenValue("")
      setFeeBasisPoints("")
      return
    }

    if (selectedToken) {
      if (isBuying) {
        let nextAmount = alpAmount.mul(parseValue(alpPrice, ALP_DECIMALS)).div(selectedTokenPrice)
          .mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - MINT_BURN_FEE_BASIS_POINTS)

        let nextValue = formatAmountFree(nextAmount, selectedToken.decimals, selectedToken.decimals)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setSelectedTokenValue(nextValue)
        setFeeBasisPoints(MINT_BURN_FEE_BASIS_POINTS)
      } else {
        let nextAmount = alpAmount.mul(parseValue(alpPrice, ALP_DECIMALS)).div(selectedTokenPrice)
          .mul(expandDecimals(1, ALP_DECIMALS)).div(expandDecimals(1, selectedToken.decimals))
          .mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - BURN_FEE_BASIS_POINTS)

        let nextValue = formatAmountFree(nextAmount, selectedToken.decimals, selectedToken.decimals)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setSelectedTokenValue(nextValue)
        setFeeBasisPoints(BURN_FEE_BASIS_POINTS)
      }
    }
  }, [
    isBuying,
    selectedToken,
    selectedTokenAmount,
    anchorOnSwapAmount,
    alpAmount,
    alpPrice,
  ])

  ///////////// write contract /////////////

  const buyAlp = () => {
    setIsSubmitting(true)
    const minLp = parseValue(alpValue * 0.95, ALP_DECIMALS)
    addLiquidity(chainId, library, routerAddress, Router, selectedToken, selectedTokenAmount, minLp, setIsSubmitting)
  }

  const sellAlp = () => {
    setIsSubmitting(true)
    // const minOut = parseValue(alpValue * 0.95, ALP_DECIMALS)
    const minOut = bigNumberify(0)
    removeLiquidity(chainId, library, routerAddress, Router, selectedToken, selectedTokenAmount, minOut, setIsSubmitting)
  }

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    if (needApproval) {
      isBuying ? approveTokens(library, routerAddress, ERC20, selectedToken.address, selectedTokenAmount, setIsWaitingForApproval, setIsApproving)
      : approveTokens(library, routerAddress, Alp, alpAddress, alpAmount, setIsWaitingForApproval, setIsApproving)
      return
    }
    const [, modal] = getError()
    if (modal) {
      return
    }
    isBuying ? buyAlp() : sellAlp()
  }

  return (
    <div className={styles.mainContent}>
      <div className="GlpSwap">
        <div className={styles.BuySellSelector}>
          <ComponentTabs
            option={mode}
            options={['Buy ALP', 'Sell ALP']}
            type="inline"
            onChange={onModeChange}
          />
        </div>

        {isBuying &&
          <BuyInputSection
            token={selectedToken}
            tokenlist={tokens}
            topLeftLabel='Pay '
            balance={payBalance}
            topRightLabel='Balance: '
            tokenBalance={`${formatAmount(selectedTokenBalance, selectedToken.decimals, 4, true)}`}
            inputValue={selectedTokenValue}
            onInputValueChange={onTokenValueChange}
            onSelectToken={onSelectToken}
          />}

        {!isBuying &&
          <BuyInputSection
            token={selectedToken}
            tokenlist={tokens}
            topLeftLabel='Pay'
            balance={payBalance}
            topRightLabel='Available: '
            tokenBalance={`${formatAmount(poolInfo?.totalSupply, ALP_DECIMALS, 4, true)}`}
            inputValue={alpValue}
            onInputValueChange={onAlpValueChange}
            isLocked={!isBuying}
          />}

        {isBuying &&
          <BuyInputSection
            token={selectedToken}
            tokenlist={tokens}
            topLeftLabel="Receive"
            balance={receiveBalance}
            topRightLabel='Balance: '
            tokenBalance={`${formatAmount(selectedTokenBalance, ALP_DECIMALS, 4, true)}`}
            inputValue={alpValue}
            onInputValueChange={onAlpValueChange}
            isLocked={isBuying}
          />}

        {!isBuying &&
          <BuyInputSection
            token={selectedToken}
            tokenlist={tokens}
            topLeftLabel="Receive"
            balance={receiveBalance}
            topRightLabel='Balance: '
            tokenBalance={`${formatAmount(selectedTokenBalance, selectedToken.decimals, 4, true)}`}
            inputValue={selectedTokenValue}
            onInputValueChange={onTokenValueChange}
            onSelectToken={onSelectToken}
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
          <ComponentButton
            style={{ marginTop: '25px' }}
            onClick={onClickPrimary}
            disabled={!isPrimaryEnabled()}
          >
            {getPrimaryText()}
          </ComponentButton>
        </div>

      </div>

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
            ${alpPrice.toFixed(4)}
          </div>
        </div>
        <div className={styles.GlpSwapcardrow}>
          <div className={styles.label}>Wallet</div>
          <div className={styles.value}>
            {formatAmount(alpBalance, ALP_DECIMALS, 4, true)} ALP (${formatAmount(alpBalanceUsd, USD_DECIMALS, 2, true)})
          </div>
        </div>
      </div>

      <div className={styles.GlpSwapdivider} />

      <div className={styles.GlpSwapstatscontent}>
        <div className={styles.GlpSwapcardrow}>
          <div className={styles.label}>Total Supply</div>
          <div className={styles.value}>
            {formatAmount(alpSupply, ALP_DECIMALS, 4, true)} ALP (${formatAmount(alpSupplyUsd, USD_DECIMALS, 2, true)})
          </div>
        </div>
      </div>

    </div>
    </div>
  )

}

export default AcyPoolComponent