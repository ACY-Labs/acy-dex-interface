import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ethers } from 'ethers';
import { Tooltip, Input, Button } from 'antd'
import { useChainId } from '@/utils/helpers';
import { useWeb3React } from '@web3-react/core';
import { useConstantLoader } from '@/constants';
import { INITIAL_ALLOWED_SLIPPAGE, getTokens, getContract } from '@/constants/future_option_power.js';
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
import { AcyDescriptions } from '../Acy';
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
  const [selectedToken, setSelectedToken] = useState()
  const [whitelistedTokens, setWhitelistedTokens] = useState([])

  ///////////// read contract /////////////

  const poolAddress = getContract(chainId, "pool")
  const routerAddress = getContract(chainId, "router")
  const readerAddress = getContract(chainId, "reader");
  const alpAddress = getContract(chainId, 'alp')
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")

  const tokenAllowanceAddress = selectedToken?.address === ethers.constants.AddressZero ? nativeTokenAddress : selectedToken?.address;
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
  const { data: symbolsData, mutate: updateSymbolsData } = useSWR([chainId, readerAddress, 'getSymbolsInfo', poolAddress, []], {
    fetcher: fetcher(library, Reader)
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
  const [alpValue, setAlpValue] = useState('0')
  const [alpAmount, setAlpAmount] = useState(bigNumberify(0))
  const [feeBasisPoints, setFeeBasisPoints] = useState("")
  const [payBalance, setPayBalance] = useState('$0.00');
  const [receiveBalance, setReceiveBalance] = useState('$0.00');
  const [anchorOnSwapAmount, setAnchorOnSwapAmount] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100)
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100)
  const [slippageError, setSlippageError] = useState('')
  const [deadline, setDeadline] = useState()

  const needApproval = isBuying ?
    selectedToken?.address != ethers.constants.AddressZero &&
    tokenAllowance &&
    selectedTokenAmount &&
    selectedTokenAmount.gt(tokenAllowance)
    : alpAllowance &&
    alpAmount &&
    alpAmount.gt(alpAllowance)

  const alpPrice = poolInfo ? poolInfo.totalSupply.gt(0) ? parseInt(poolInfo.liquidity) / parseInt(poolInfo.totalSupply) : 1 : 0
  const alpSupplyUsd = alpSupply ? alpSupply.mul(parseValue(alpPrice, ALP_DECIMALS)) : bigNumberify(0)
  const alpBalanceUsd = alpBalance ? alpBalance.mul(parseValue(alpPrice, ALP_DECIMALS)) : bigNumberify(0)
  const selectedTokenPrice = selectedToken?.price
  const selectedTokenBalance = selectedToken?.balance
  const amountUsd = selectedTokenPrice?.mul(selectedTokenAmount)
  const minTradeVolume = formatAmount(symbolsData?.find(item => item.symbol?.toLowerCase() == props.selectedSymbol?.toLowerCase()).minTradeVolume, 18)

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
    let inputString = e.target.value
    if (inputString === "") {
      setSelectedTokenValue("0")
    }
    else if (inputString[0] === "0" && inputString[1] === "0" && inputString[2] === ".") {
      setSelectedTokenValue(inputString.substring(1))
    }
    else {
      setSelectedTokenValue(inputString)
    }
    setShowDescription(true)
    setAnchorOnSwapAmount(true)
    setShowDescription(true)
    if (e.target.value === "") {
      setSelectedTokenValue("0")
    }
    else if (e.target.value % minTradeVolume == 0) {
      setSelectedTokenValue(e.target.value)
    }
    else {
      setSelectedTokenValue(Math.floor(e.target.value / minTradeVolume) * minTradeVolume)
    }
  }

  const onAlpValueChange = (e) => {
    setAnchorOnSwapAmount(false)
    setShowDescription(true)
    if (e.target.value === "") {
      setAlpValue("0")
    }
    else if (e.target.value[0] === "0") {
      let num = parseFloat(e.target.value)
      setAlpValue(num.toString())
    }
    else {
      setAlpValue(e.target.value)
    }
  }

  const onSelectToken = (symbol) => {
    setSelectedToken(whitelistedTokens.filter(token => token.symbol == symbol)[0])
    setIsWaitingForApproval(false)
  }

  const getError = () => {
    if (!selectedTokenAmount || selectedTokenAmount.eq(0)) { return ["Enter an amount"] }
    if (!alpAmount || alpAmount.eq(0)) { return ["Enter an amount"] }

    if (isBuying) {
      if (selectedTokenBalance && selectedTokenAmount && selectedTokenAmount.gt(selectedTokenBalance)) {
        return [`Insufficient ${selectedToken?.symbol} balance`]
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
    if (isApproving) { return isBuying ? `Approving ${selectedToken?.symbol}...` : 'Approving ALP...' }
    if (needApproval) { return isBuying ? `Approve ${selectedToken?.symbol}` : 'Approve ALP' }
    if (isSubmitting) { return isBuying ? `Buying...` : `Selling...` }

    return isBuying ? "Buy ALP" : "Sell ALP"
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let tokens = []
    tokenInfo?.map(token => {
      tokens.push({ symbol: token.symbol, address: token.token, balance: token.balance, price: token.price, decimals: 18 })
    })
    setWhitelistedTokens(tokens)
    setSelectedToken(whitelistedTokens[0])
  }, [tokenInfo])

  useEffect(() => {
    setShowDescription(false)
  }, [chainId])

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
      let swapBigValue = parseValue(selectedTokenValue, selectedToken?.decimals)
      let alpBigPrice = parseValue(alpPrice, ALP_DECIMALS)
      let alpBigValue = parseValue(alpValue, ALP_DECIMALS)
      let pay = selectedTokenPrice.mul(swapBigValue)
      let receive = alpBigPrice.mul(alpBigValue)
      setPayBalance(`$${formatAmount(pay, selectedToken?.decimals * 2, 2, true)}`)
      setReceiveBalance(`$${formatAmount(receive, ALP_DECIMALS * 2, 2, true)}`)
    }
  }, [selectedToken, selectedTokenValue, alpValue])

  useEffect(() => {
    if (anchorOnSwapAmount) {
      if (!selectedTokenAmount) {
        setAlpValue('0')
        setFeeBasisPoints("")
        return
      }
      if (isBuying) {

        let nextAmount = alpPrice && amountUsd?.div(parseValue(alpPrice, ALP_DECIMALS))
          .mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - MINT_BURN_FEE_BASIS_POINTS)

        let nextValue = formatAmountFree(nextAmount, ALP_DECIMALS, ALP_DECIMALS)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setAlpValue(nextValue.toString())
        setFeeBasisPoints(MINT_BURN_FEE_BASIS_POINTS)
      } else {
        let nextAmount = alpPrice && amountUsd?.div(parseValue(alpPrice, ALP_DECIMALS))
          .mul(expandDecimals(1, selectedToken?.decimals)).div(expandDecimals(1, ALP_DECIMALS))
          .mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - BURN_FEE_BASIS_POINTS)

        let nextValue = formatAmountFree(nextAmount, ALP_DECIMALS, ALP_DECIMALS)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setAlpValue(nextValue.toString())
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

        let nextValue = formatAmountFree(nextAmount, selectedToken?.decimals, selectedToken?.decimals)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setSelectedTokenValue(nextValue)
        setFeeBasisPoints(MINT_BURN_FEE_BASIS_POINTS)
      } else {
        let nextAmount = alpAmount.mul(parseValue(alpPrice, ALP_DECIMALS)).div(selectedTokenPrice)
          .mul(expandDecimals(1, ALP_DECIMALS)).div(expandDecimals(1, selectedToken?.decimals))
          .mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - BURN_FEE_BASIS_POINTS)

        let nextValue = formatAmountFree(nextAmount, selectedToken?.decimals, selectedToken?.decimals)
        nextValue = nextValue > 1000 ? Math.round(nextValue * LONGDIGIT) / LONGDIGIT : Math.round(nextValue * SHORTDIGIT) / SHORTDIGIT

        setSelectedTokenValue(nextValue)
        setFeeBasisPoints(BURN_FEE_BASIS_POINTS)
      }
    }
  }, [
    isBuying,
    selectedToken,
    selectedTokenAmount,
    selectedTokenPrice,
    anchorOnSwapAmount,
    alpAmount,
    alpPrice,
  ])

  ///////////// write contract /////////////

  const buyAlp = () => {
    setIsSubmitting(true)
    const minLp = parseValue(alpPrice, ALP_DECIMALS)?.mul(bigNumberify(10000 - slippageTolerance * 100)).div(bigNumberify(10000))
    addLiquidity(chainId, library, routerAddress, Router, selectedToken, selectedTokenAmount, minLp, setIsSubmitting)
  }

  const sellAlp = () => {
    setIsSubmitting(true)
    const minOut = selectedTokenAmount.mul(bigNumberify(10000 - slippageTolerance * 100)).div(bigNumberify(10000))
    removeLiquidity(chainId, library, routerAddress, Router, selectedToken, alpAmount, minOut, setIsSubmitting)
  }

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    if (needApproval) {
      isBuying ? approveTokens(library, routerAddress, ERC20, selectedToken?.address, selectedTokenAmount, setIsWaitingForApproval, setIsApproving)
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
            tokenlist={whitelistedTokens}
            topLeftLabel='Pay '
            balance={payBalance}
            topRightLabel='Balance: '
            tokenBalance={`${formatAmount(selectedTokenBalance, selectedToken?.decimals, 4, true)}`}
            inputValue={selectedTokenValue}
            onInputValueChange={onTokenValueChange}
            onSelectToken={onSelectToken}
          />}

        {!isBuying &&
          <BuyInputSection
            token={selectedToken}
            tokenlist={whitelistedTokens}
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
            tokenlist={whitelistedTokens}
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
            tokenlist={whitelistedTokens}
            topLeftLabel="Receive"
            balance={receiveBalance}
            topRightLabel='Balance: '
            tokenBalance={`${formatAmount(selectedTokenBalance, selectedToken?.decimals, 4, true)}`}
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

        {showDescription ?
          <AcyDescriptions>
            <div className={styles.breakdownTopContainer}>
              <div className={styles.slippageContainer}>
                <span style={{ fontWeight: 600 }}>Slippage tolerance</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <Input
                    className={styles.input}
                    value={inputSlippageTol || ''}
                    onChange={e => {
                      setInputSlippageTol(e.target.value);
                    }}
                    suffix={<strong>%</strong>}
                  />
                  <Button
                    type="primary"
                    style={{
                      marginLeft: '10px',
                      background: '#2e3032',
                      borderColor: 'transparent',
                    }}
                    onClick={() => {
                      if (isNaN(inputSlippageTol)) {
                        setSlippageError('Please input valid slippage value!');
                      } else {
                        setSlippageError('');
                        setSlippageTolerance(parseFloat(inputSlippageTol));
                      }
                    }}
                  >
                    Set
                  </Button>
                </div>
                {slippageError.length > 0 && (
                  <span style={{ fontWeight: 600, color: '#c6224e' }}>{slippageError}</span>
                )}
              </div>
              <div className={styles.slippageContainer}>
                <span style={{ fontWeight: 600, marginBottom: '10px' }}>Transaction deadline</span>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: '33.6px',
                    marginTop: '10px',
                  }}
                >
                  <Input
                    className={styles.input}
                    type="number"
                    value={Number(deadline).toString()}
                    onChange={e => setDeadline(e.target.valueAsNumber || 0)}
                    placeholder={30}
                    suffix={<strong>minutes</strong>}
                  />
                </div>
              </div>
            </div>
          </AcyDescriptions>
          : null}

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

      {/* <div className={styles.GlpSwapstatscard}>
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

      </div> */}
    </div>
  )

}

export default AcyPoolComponent