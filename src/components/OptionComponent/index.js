import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Input, Button } from 'antd';
import { ethers } from 'ethers'
import useSWR from 'swr'
import { useConstantLoader } from '@/constants';
import { getTokens, getContract } from '@/constants/future_option_power.js';
import { useChainId } from '@/utils/helpers';
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from '@/components/ConnectWallet';
import { PLACEHOLDER_ACCOUNT, fetcher, parseValue, expandDecimals, bigNumberify, formatAmount } from '@/acy-dex-futures/utils';
import { AcyPerpetualCard, AcyDescriptions, AcyPerpetualButton } from '../Acy';
import { approveTokens, trade } from '@/services/derivatives';
import PerpetualTabs from '../PerpetualComponent/components/PerpetualTabs';
import AccountInfoGauge from '../AccountInfoGauge';
import AcyPoolComponent from '../AcyPoolComponent';
import ERC20 from '@/acy-dex-futures/abis/ERC20.json'
import Token from '@/acy-dex-futures/abis/Token.json'
import Reader from '@/abis/future-option-power/Reader.json'
import IPool from '@/abis/future-option-power/IPool.json'

import styles from './styles.less';

const { AddressZero } = ethers.constants;

const OptionComponent = props => {

  const {
    mode,
    setMode,
    selectedToken,
    symbol,
  } = props

  const { account, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader(props)
  const { chainId } = useChainId()
  const connectWalletByLocalStorage = useConnectWallet()
  const { active, library } = useWeb3React()
  const tokens = getTokens(chainId)

  ///////////// read contract /////////////

  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const tokenAllowanceAddress = selectedToken.address === AddressZero ? nativeTokenAddress : selectedToken.address;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, poolAddress], {
    fetcher: fetcher(library, ERC20)
  });
  const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader)
  });
  const { data: symbolInfo, mutate: updateSymbolInfo } = useSWR([chainId, readerAddress, "getSymbolInfo", poolAddress, symbol, []], {
    fetcher: fetcher(library, Reader)
  });

  useEffect(() => {
    if (active) {
      library.on("block", () => {
        updateTokenAllowance()
        updateTokenInfo()
        updateSymbolInfo()
      });
      return () => {
        library.removeListener("block", onBlock);
      };
    }
  }, [
    active,
    library,
    chainId,
    updateTokenAllowance,
    updateTokenInfo,
    updateSymbolInfo,
  ]);

  ///////////// for UI /////////////

  const optionMode = ['Buy', 'Sell', 'Pool']
  const [percentage, setPercentage] = useState('')
  const [selectedTokenValue, setSelectedTokenValue] = useState("0")
  const [usdValue, setUsdValue] = useState(0)
  const [isApproving, setIsApproving] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100)
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100)
  const [slippageError, setSlippageError] = useState('')
  const [deadline, setDeadline] = useState()

  const selectedTokenAmount = parseValue(selectedTokenValue, selectedToken && selectedToken.decimals)
  const needApproval =
    selectedToken.address !== AddressZero &&
    tokenAllowance &&
    selectedTokenAmount &&
    selectedTokenAmount.gt(tokenAllowance)

  const getPercentageButton = value => {
    if (percentage != value) {
      return (
        <button
          className={styles.percentageButton}
          onClick={() => { setPercentage(value) }}>
          {value}
        </button>
      )
    } else {
      return (
        <button
          className={styles.percentageButtonActive}
          onClick={() => { setPercentage(value) }}>
          {value}
        </button>
      )
    }
  }

  const getPrimaryText = () => {
    if (!active) {
      return 'Connect Wallet'
    }
    if (needApproval && isWaitingForApproval) {
      return 'Waiting for Approval'
    }
    if (isApproving) {
      return `Approving ${selectedToken.symbol}...`;
    }
    if (needApproval) {
      return `Approve ${selectedToken.symbol}`;
    }
    return mode == 'Buy' ? 'Buy / Long' : 'Sell / Short'
  }

  useEffect(() => {
    setShowDescription(false)
  }, [chainId, mode])

  useEffect(() => {
    let tokenAmount = (Number(percentage.split('%')[0]) / 100) * formatAmount(tokenInfo?.filter(item => item.token == selectedToken.address)[0]?.balance, 18, 2)
    setSelectedTokenValue(tokenAmount)
    setUsdValue((tokenAmount * formatAmount(symbolInfo?.markPrice, 18)).toFixed(2))
  }, [percentage])

  useEffect(() => {
    if (selectedToken && isWaitingForApproval && !needApproval) {
      setIsWaitingForApproval(false)
    }
  }, [selectedToken, selectedTokenAmount, needApproval])


  ///////////// write contract /////////////

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    if (needApproval) {
      approveTokens(library, poolAddress, Token, selectedToken.address, setIsWaitingForApproval, setIsApproving)
      return
    }
    if (mode == ' Buy') {
      trade(chainId, library, poolAddress, IPool, account, symbol, selectedTokenAmount, expandDecimals(50001, 18))
    } else {
      trade(chainId, library, poolAddress, IPool, account, symbol, selectedTokenAmount.mul(bigNumberify(-1)), expandDecimals(50001, 18))
    }
  }

  return (
    <div className={styles.main}>
      <AcyPerpetualCard style={{ backgroundColor: 'transparent', border: 'none', margin: '-8px' }}>
        <div className={styles.modeSelector}>
          <PerpetualTabs
            option={mode}
            options={optionMode}
            onChange={(mode) => { setMode(mode) }}
          />
        </div>

        {mode == 'Pool'
          ?
          <AcyPoolComponent />
          :
          <>
            <div className={styles.rowFlexContainer}>

              <div style={{ display: 'flex' }}>
                <div className={styles.inputContainer}>
                  <input
                    type="number"
                    placeholder="Amount"
                    className={styles.optionInput}
                    value={selectedTokenValue}
                    onChange={e => {
                      setSelectedTokenValue(e.target.value)
                      setShowDescription(true)
                      setUsdValue((e.target.value * formatAmount(symbolInfo?.markPrice, 18)).toFixed(2))
                    }}
                  />
                  <span className={styles.inputLabel}>{selectedToken.symbol}</span>
                </div>
                <div className={styles.inputContainer}>
                  <input
                    type="number"
                    min="0"
                    className={styles.optionInput}
                    value={usdValue}
                    onChange={e => { }}
                  />
                  <span className={styles.inputLabel}>USD</span>
                </div>
              </div>

              <div className={styles.buttonContainer}>
                {getPercentageButton('25%')}
                {getPercentageButton('50%')}
                {getPercentageButton('75%')}
                {getPercentageButton('100%')}
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

              <AcyPerpetualButton
                style={{ margin: '25px 0 0 0', width: '100%' }}
                onClick={onClickPrimary}
              >
                {getPrimaryText()}
              </AcyPerpetualButton>

            </div>

            <AccountInfoGauge account={account} library={library} chainId={chainId} tokens={tokens} />
          </>
        }

      </AcyPerpetualCard>
    </div>
  );
}

export default connect(({ global, transaction, swap, loading }) => ({
  global,
  transaction,
  account: global.account,
  swap,
  loading: loading.global,
}))(OptionComponent);