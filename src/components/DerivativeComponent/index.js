import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import useSWR from 'swr'
import { ethers } from 'ethers';
import { INITIAL_ALLOWED_SLIPPAGE, getTokens, getContract } from '@/constants/future_option_power.js';
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from '@/components/ConnectWallet';
import { PLACEHOLDER_ACCOUNT, fetcher, parseValue, bigNumberify, formatAmount } from '@/acy-dex-futures/utils';
import { AcyDescriptions } from '../Acy';
import ComponentCard from '../ComponentCard';
import ComponentButton from '../ComponentButton';
import { approveTokens, trade } from '@/services/derivatives';
import ComponentTabs from '../ComponentTabs';
import AccountInfoGauge from '../AccountInfoGauge';
import AcyPoolComponent from '../AcyPoolComponent';
import Segmented from '../AcySegmented';
import Reader from '@/abis/future-option-power/Reader.json'
import IPool from '@/abis/future-option-power/IPool.json'

import styles from './styles.less';
import { parse } from 'date-fns';
import { ConsoleSqlOutlined } from '@ant-design/icons';

const DerivativeComponent = props => {

  const {
    mode,
    setMode,
    chainId,
    tokens,
    selectedToken,
    symbol,
  } = props

  const connectWalletByLocalStorage = useConnectWallet()
  const { account, active, library } = useWeb3React()

  ///////////// read contract /////////////

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader)
  });
  const { data: symbolInfo, mutate: updateSymbolInfo } = useSWR([chainId, readerAddress, "getSymbolInfo", poolAddress, symbol, []], {
    fetcher: fetcher(library, Reader)
  });

  console.log("derivative ui symbolInfo", symbolInfo)
  useEffect(() => {
    if (active) {
      library.on("block", () => {
        updateTokenInfo()
        updateSymbolInfo()
      });
      return () => {
        library.removeAllListeners('block');
      };
    }
  }, [
    active,
    library,
    chainId,
    updateTokenInfo,
    updateSymbolInfo,
  ]);

  ///////////// for UI /////////////

  const optionMode = ['Buy', 'Sell', 'Pool']
  const [percentage, setPercentage] = useState('')
  const [selectedTokenValue, setSelectedTokenValue] = useState("0")
  const [selectedTokenAmount, setSelectedTokenAmount] = useState(parseValue(selectedTokenValue, selectedToken && selectedToken.decimals))
  const [usdValue, setUsdValue] = useState(0)
  const [isApproving, setIsApproving] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100)
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100)
  const [slippageError, setSlippageError] = useState('')
  const [deadline, setDeadline] = useState()
  const [marginToken, setMarginToken] = useState(tokens[1])

  // const selectedTokenAmount = parseValue(selectedTokenValue, selectedToken && selectedToken.decimals)
  // const selectedTokenPrice = tokenInfo?.find(item => item.token?.toLowerCase() == selectedToken.address?.toLowerCase())?.price
  // const selectedTokenBalance = tokenInfo?.find(item => item.token?.toLowerCase() == selectedToken.address?.toLowerCase())?.balance
  const symbolMarkPrice = symbolInfo?.markPrice
  const symbolMinTradeVolume = symbolInfo?.minTradeVolume
  const minTradeVolume = symbolMinTradeVolume ? ethers.utils.formatUnits(symbolMinTradeVolume, 18) : 0.001
  const minTradeDecimal = minTradeVolume? minTradeVolume.toString().includes('.')?minTradeVolume.toString().split('.')[1].length:0:3

  const getPrimaryText = () => {
    if (!active) {
      return 'Connect Wallet'
    }
    if (isApproving) {
      return `Approving ${selectedToken.symbol}...`;
    }
    return mode == 'Buy' ? 'Buy / Long' : 'Sell / Short'
  }

  useEffect(() => {
    setShowDescription(false)
    setMarginToken(tokens[1])
  }, [tokens])

  // useEffect(() => {
  //   let tokenAmount = (Number(percentage.split('%')[0]) / 100) * formatAmount(selectedTokenBalance, 18, 2)
  //   handleTokenValueChange(tokenAmount)
  // }, [percentage])

  // useEffect(() => {
  // setUsdValue((selectedTokenValue * formatAmount(selectedTokenPrice, 18, 2)).toFixed(2))
  // console.log("derivative usd see usdvalue", (selectedTokenValue * formatAmount(selectedTokenPrice, 18, 2)).toFixed(2), usdValue)
  // }, [selectedTokenValue, selectedTokenPrice])

  const handleTokenValueChange = (value) => {
    if (value % minTradeVolume == 0) {
      setSelectedTokenValue(value)
    } else {
      setSelectedTokenValue(Math.floor(value / minTradeVolume) * minTradeVolume)
    }
  }
  const handleUsdValueChange = (value) => {
    setUsdValue(value)
    // console.log("derivative usd see symbolMarkPrice", symbolMarkPrice)
    const bigValue = parseValue(value, 18+minTradeDecimal)
    let tokenValue = bigValue?.div(symbolMarkPrice)
    tokenValue = formatAmount(tokenValue, minTradeDecimal)
    //selectedTokenValue is for display
    //selectedTokenAmount is sent to contract
    if(tokenValue%minTradeVolume==0){
      setSelectedTokenValue(tokenValue)
      setSelectedTokenAmount(parseValue(tokenValue, selectedToken && selectedToken.decimals))
    }else{
      setSelectedTokenValue(Math.floor(tokenValue/minTradeVolume)*minTradeVolume)
      setSelectedTokenAmount(parseValue(Math.floor(tokenValue/minTradeVolume)*minTradeVolume),  selectedToken && selectedToken.decimals)
    }
  }

  ///////////// write contract /////////////

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    if (mode == 'Buy') {
      trade(chainId, library, poolAddress, IPool, account, symbol, selectedTokenAmount, symbolMarkPrice?.mul(bigNumberify(10000 + slippageTolerance * 100)).div(bigNumberify(10000)))
    } else {
      trade(chainId, library, poolAddress, IPool, account, symbol, selectedTokenAmount.mul(bigNumberify(-1)), symbolMarkPrice?.mul(bigNumberify(10000 - slippageTolerance * 100)).div(bigNumberify(10000)))
    }
  }

  return (
    <div className={styles.main}>
      <ComponentCard style={{ backgroundColor: 'transparent', border: 'none', margin: '-8px' }}>
        <div className={styles.modeSelector}>
          <ComponentTabs
            option={mode}
            options={optionMode}
            onChange={(mode) => { setMode(mode) }}
          />
        </div>

        {mode == 'Pool'
          ?
          <AcyPoolComponent selectedSymbol={symbol} />
          :
          <>
            <div className={styles.rowFlexContainer}>
              <div>
                {/* <div style={{ display: 'flex' }}> */}
                {/* <div className={styles.inputContainer}>
                  <input
                    type="number"
                    min="0"
                    placeholder="Amount"
                    className={styles.optionInput}
                    value={selectedTokenValue}
                    onChange={e => {
                      // setSelectedTokenValue(e.target.value)
                      handleTokenValueChange(e.target.value)
                      setShowDescription(true)
                    }}
                  />
                  <span className={styles.inputLabel}>{selectedToken}</span>
                </div> */}
                <div className={styles.inputContainer}>
                  <input
                    type="number"
                    min="0"
                    className={styles.optionInput}
                    value={usdValue}
                    // value={"0"}
                    onChange={e => {
                      handleUsdValueChange(e.target.value)
                      setShowDescription(true)
                    }}
                  />
                  <span className={styles.inputLabel}>USD</span>
                </div>
                <div className={styles.symbolAmount}>= {selectedTokenValue} {symbol}</div>
              </div>
              {/* </div> */}
              <div style={{ margin: '40px 0' }}>
                <Segmented onChange={(value) => { setPercentage(value) }} options={['10%', '25%', '50%', '75%', '100%']} />
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

              <ComponentButton
                style={{ margin: '25px 0 0 0', width: '100%' }}
                onClick={onClickPrimary}
              >
                {getPrimaryText()}
              </ComponentButton>

            </div>

            <AccountInfoGauge
              account={account}
              library={library}
              chainId={chainId}
              tokens={tokens}
              active={active}
              token={marginToken}
              setToken={setMarginToken}
              symbol={symbol}
            />
          </>
        }

      </ComponentCard>
    </div>
  );
}

export default DerivativeComponent