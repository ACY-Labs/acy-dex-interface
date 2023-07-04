import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Slider } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import useSWR from 'swr'
import { ethers } from 'ethers';
import { INITIAL_ALLOWED_SLIPPAGE, getTokens, getContract } from '@/constants/future_option_power.js';
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from '@/components/ConnectWallet';
import { PLACEHOLDER_ACCOUNT, fetcher, parseValue, bigNumberify, formatAmount, getOracleSignature } from '@/acy-dex-futures/utils';
import { AcyDescriptions } from '../Acy';
import ComponentCard from '../ComponentCard';
import ComponentButton from '../ComponentButton';
import { approveTokens, trade, createTradeOrder } from '@/services/derivatives';
import ComponentTabs from '../ComponentTabs';
import AccountInfoGauge from '../AccountInfoGauge';
import AcyPoolComponent from '../AcyPoolComponent';
import Segmented from '../AcySegmented';
import Reader from '@/abis/future-option-power/Reader.json'
import IPool from '@/abis/future-option-power/IPool.json'
import OrderBook from '@/abis/future-option-power/OrderBook.json'
import styled from "styled-components";

import styles from './styles.less';
import { parse } from 'date-fns';
import { ConsoleSqlOutlined } from '@ant-design/icons';

const StyledSlider = styled(Slider)`
  .ant-slider-track {
    background: #929293;
    height: 3px;
  }
  .ant-slider-rail {
    background: #29292c;
    height: 3px;
  }
  .ant-slider-handle {
    background: #929293;
    width: 12px;
    height: 12px;
    border: none;
  }
  .ant-slider-handle-active {
    background: #929293;
    width: 12px;
    height: 12px;
    border: none;
  }
  .ant-slider-dot {
    border: 1.5px solid #29292c;
    border-radius: 1px;
    background: #29292c;
    width: 2px;
    height: 10px;
  }
  .ant-slider-dot-active {
    border: 1.5px solid #929293;
    border-radius: 1px;
    background: #929293;
    width: 2px;
    height: 10px;
  }
  .ant-slider-with-marks {
      margin-bottom: 50px;
  }
`;

const leverageMarks = {
  1: {
    style: { color: '#b5b6b6', },
    label: '1x'
  },
  5: {
    style: { color: '#b5b6b6', },
    label: '5x'
  },
  10: {
    style: { color: '#b5b6b6', },
    label: '10x'
  },
  15: {
    style: { color: '#b5b6b6', },
    label: '15x'
  },
  20: {
    style: { color: '#b5b6b6', },
    label: '20x'
  },
  25: {
    style: { color: '#b5b6b6', },
    label: '25x'
  },
  30: {
    style: { color: '#b5b6b6', },
    label: '30x'
  }
};

const DerivativeComponent = props => {

  const {
    mode,
    setMode,
    chainId,
    symbol,
    pageName,
  } = props

  const connectWalletByLocalStorage = useConnectWallet()
  const { account, active, library } = useWeb3React()

  ///////////// read contract /////////////

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")
  const orderbookAddress = getContract(chainId, "orderbook")

  const { data: symbolInfo, mutate: updateSymbolInfo } = useSWR([chainId, readerAddress, "getSymbolInfo", poolAddress, symbol, []], {
    fetcher: fetcher(library, Reader)
  });
  const { data: estimateMaxVolume, mutate: updateEstimateMaxVolume } = useSWR([chainId, readerAddress, "estimateMaxVolume", poolAddress, account, symbol, mode == 'Buy'], {
    fetcher: fetcher(library, Reader)
  });
  const { data: minExecutionFee, mutate: updateMinExecutionFee } = useSWR([chainId, orderbookAddress, "minExecutionFee"], {
    fetcher: fetcher(library, OrderBook)
  });
  useEffect(() => {
    if (active) {
      library.on("block", () => {
        updateSymbolInfo()
        updateEstimateMaxVolume()
        updateMinExecutionFee()
      });
      return () => {
        library.removeAllListeners('block');
      };
    }
  }, [
    active,
    library,
    chainId,
    updateSymbolInfo,
    updateEstimateMaxVolume,
    updateMinExecutionFee,
  ]);

  ///////////// for UI /////////////

  const optionMode = ['Buy', 'Sell', 'Pool']
  const [orderType, setOrderType] = useState('Market')
  const [limitPrice, setLimitPrice] = useState()
  const [percentage, setPercentage] = useState('')
  const [tradeVolume, setTradeVolume] = useState(0)
  const [usdValue, setUsdValue] = useState()
  const [showDescription, setShowDescription] = useState(false)
  const [showSlippage, setShowSlippage] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100)
  const [slippageError, setSlippageError] = useState('')
  const [leverageOption, setLeverageOption] = useState("2")

  const symbolMarkPrice = symbolInfo?.markPrice
  const minTradeVolume = symbolInfo?.minTradeVolume ? ethers.utils.formatUnits(symbolInfo?.minTradeVolume, 18) : 0.001

  const getPrimaryText = () => {
    if (!active) {
      return 'Connect Wallet'
    }
    if (isValid(tradeVolume)) {
      return 'Invalid Trade Volume'
    }
    if (orderType == 'Limit') {
      return 'Create Limit Order'
    }
    return mode == 'Buy' ? 'Buy / Long' : 'Sell / Short'
  }

  const handleUsdValueChange = (usdValue) => {
    setUsdValue(usdValue)
    const tokenValue = usdValue * leverageOption / formatAmount(symbolMarkPrice, 18)
    const tokenVolume = tokenValue % minTradeVolume == 0 ? tokenValue : tokenValue.toFixed(-Math.log10(minTradeVolume))
    setTradeVolume(tokenVolume)
  }

  const isValid = (value) => {
    if (pageName == 'Future' && value > formatAmount(estimateMaxVolume, 18)) {
      return false
    }
    return value == 0 || Math.floor(value % minTradeVolume) != 0
  }

  useEffect(() => {
    handleUsdValueChange(usdValue)
  }, [leverageOption])

  useEffect(() => {
    setShowDescription(false)
    setShowSlippage(false)
  }, [symbol, chainId, mode])

  ///////////// write contract /////////////

  const onClickPrimary = async () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }

    let oracleSignature = []
    if (pageName != 'Future') {
      oracleSignature = await getOracleSignature()
    }

    if (orderType == 'Limit') {
      mode == 'Buy' ?
        createTradeOrder(
          chainId,
          library,
          orderbookAddress,
          OrderBook,
          symbol,
          parseValue(tradeVolume, 18),
          parseValue(limitPrice, 18),
          false,
          symbolMarkPrice?.mul(bigNumberify(10000 + slippageTolerance * 100)).div(bigNumberify(10000)),
          minExecutionFee,
        )
        :
        createTradeOrder(
          chainId,
          library,
          orderbookAddress,
          OrderBook,
          symbol,
          parseValue(-tradeVolume, 18),
          parseValue(limitPrice, 18),
          true,
          symbolMarkPrice?.mul(bigNumberify(10000 - slippageTolerance * 100)).div(bigNumberify(10000)),
          minExecutionFee,
        )

      return
    }

    mode == 'Buy' ?
      trade(
        chainId,
        library,
        poolAddress,
        IPool,
        account,
        symbol,
        parseValue(tradeVolume, 18),
        symbolMarkPrice?.mul(bigNumberify(10000 + slippageTolerance * 100)).div(bigNumberify(10000)),
        oracleSignature
      )
      :
      trade(
        chainId,
        library,
        poolAddress,
        IPool,
        account,
        symbol,
        parseValue(-tradeVolume, 18),
        symbolMarkPrice?.mul(bigNumberify(10000 - slippageTolerance * 100)).div(bigNumberify(10000)),
        oracleSignature
      )
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
                <div style={{ marginLeft: 10 }}>
                  <ComponentTabs
                    option={orderType}
                    options={['Market', 'Limit']}
                    type="inline"
                    onChange={e => { setOrderType(e) }}
                  />
                </div>
                <div className={styles.inputContainer} style={{ display: 'flow-root', textAlignLast: 'right', padding: '8px 10px 6px 10px' }}>
                  <div style={{ display: 'flex', fontSize: '16px', marginBottom: '3px' }}>
                    <input
                      type="number"
                      min="0"
                      className={styles.optionInput}
                      style={{ width: '100%' }}
                      placeholder="Size"
                      value={usdValue}
                      onChange={e => {
                        handleUsdValueChange(e.target.value)
                        setShowDescription(true)
                      }}
                    />
                    <span className={styles.inputLabel}>USD</span>
                  </div>
                  {/* <span style={{ fontSize: '12px', color: 'gray' }}>Trade Volume: {formatAmount(tradeVolume, 18)}</span> */}
                </div>
                {orderType == "Limit" &&
                  <div className={styles.inputContainer} style={{ display: 'flow-root', textAlignLast: 'right', padding: '8px 10px 6px 10px' }}>
                    <div style={{ display: 'flex', fontSize: '16px', marginBottom: '3px' }}>
                      <input
                        type="number"
                        min="0"
                        className={styles.optionInput}
                        style={{ width: '100%' }}
                        placeholder="Price"
                        value={limitPrice}
                        onChange={e => {
                          setLimitPrice(e.target.value)
                        }}
                      />
                      <span className={styles.inputLabel}>USD</span>
                    </div>
                  </div>}
              </div>
              {showDescription &&
                <div style={{ margin: '20px 0' }}>
                  <div className={styles.slippageTitle} onClick={() => { setShowSlippage(!showSlippage) }}>
                    Slippage Setting
                    {showSlippage ? <UpOutlined style={{ marginLeft: 5 }} /> : <DownOutlined style={{ marginLeft: 5 }} />}
                  </div>
                  {showSlippage &&
                    <div className={styles.slippageContainer}>
                      <span style={{ fontWeight: 300 }}>Slippage tolerance</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <Input
                          className={styles.input}
                          value={slippageTolerance || ''}
                          onChange={e => {
                            if (isNaN(parseFloat(e.target.value))) {
                              setSlippageError('Please input valid slippage value!');
                            } else {
                              setSlippageError('');
                              setSlippageTolerance(e.target.value);
                            }
                          }}
                          suffix={<strong>%</strong>}
                        />
                      </div>
                      {slippageError.length > 0 && (
                        <span style={{ fontWeight: 600, color: '#c6224e' }}>{slippageError}</span>
                      )}
                    </div>
                  }
                </div>
              }

              <AcyDescriptions>
                <div className={styles.leverageContainer}>
                  <div className={styles.slippageContainer}>
                    <div className={styles.leverageLabel}>
                      <span>Leverage</span>
                      <div className={styles.leverageInputContainer}>
                        <button
                          className={styles.leverageButton}
                          onClick={() => {
                            if (leverageOption > 0.1) {
                              setLeverageOption((parseFloat(leverageOption) - 0.1).toFixed(1))
                            }
                          }}
                        >
                          <span> - </span>
                        </button>
                        <input
                          type="number"
                          value={leverageOption}
                          onChange={e => {
                            let val = parseFloat(e.target.value)
                            if (val < 0.1) {
                              setLeverageOption(0.1)
                            } else if (val >= 0.1 && val <= 30.5) {
                              setLeverageOption(Math.round(val * 10) / 10)
                            } else {
                              setLeverageOption(30.5)
                            }
                          }}
                          className={styles.leverageInput}
                        />
                        <button
                          className={styles.leverageButton}
                          onClick={() => {
                            if (leverageOption < 30.5) {
                              setLeverageOption((parseFloat(leverageOption) + 0.1).toFixed(1))
                            }
                          }}
                        >
                          <span> + </span>
                        </button>
                      </div>

                    </div>
                  </div>

                  <span className={styles.leverageSlider}>
                    <StyledSlider
                      min={0.1}
                      max={30.5}
                      step={0.1}
                      marks={leverageMarks}
                      value={leverageOption}
                      onChange={value => setLeverageOption(value)}
                      defaultValue={leverageOption}
                      style={{ color: 'red' }}
                    />
                  </span>

                </div>
              </AcyDescriptions>

              <ComponentButton
                style={{ margin: '25px 0 0 0', width: '100%' }}
                onClick={onClickPrimary}
                disabled={(account && isValid(tradeVolume)) || !(orderType == 'Market' || limitPrice != '' && limitPrice != '0')}
              >
                {getPrimaryText()}
              </ComponentButton>

            </div>

            <AccountInfoGauge
              account={account}
              library={library}
              chainId={chainId}
              active={active}
              symbol={symbol}
            />
          </>
        }

      </ComponentCard>
    </div>
  );
}

export default DerivativeComponent