import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import styled from 'styled-components';
import { Slider, Input, Button } from 'antd';
import { ethers } from 'ethers'
import useSWR from 'swr'
import { useConstantLoader } from '@/constants';
import { getTokens, getContract } from '@/constants/powers.js'
import { useChainId } from '@/utils/helpers';
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from '@/components/ConnectWallet';
import { PLACEHOLDER_ACCOUNT, useLocalStorageSerializeKey, fetcher, parseValue, approveTokens, getTokenInfo, getInfoTokens, expandDecimals, bigNumberify } from '@/acy-dex-futures/utils';
import { AcyPerpetualCard, AcyDescriptions, AcyPerpetualButton } from '../Acy';
import PerpetualTabs from '../PerpetualComponent/components/PerpetualTabs';
import AccountInfoGauge from '../AccountInfoGauge';
import AcyPoolComponent from '../AcyPoolComponent';
import AcyPool from '../AcyPool';
import Glp from '@/acy-dex-futures/abis/Glp.json'
import Token from '@/acy-dex-futures/abis/Token.json'

import styles from './styles.less';

const { AddressZero } = ethers.constants;

const OptionComponent = props => {

  const {
    mode,
    setMode,
    percentage,
    setPercentage,
    selectedToken,
    symbol,
    onTrade,
  } = props

  const { account,library, farmSetting: { INITIAL_ALLOWED_SLIPPAGE }} = useConstantLoader(props);
  const { chainId } = useChainId();
  const connectWalletByLocalStorage = useConnectWallet();
  const { active, activate } = useWeb3React();
  
  const optionMode = ['Buy', 'Sell', 'Pool']
  const [selectedTokenValue, setSelectedTokenValue] = useState("0");
  const [usdValue, setUsdValue] = useState(0)
  const [isApproving, setIsApproving] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  const [leverageOption, setLeverageOption] = useLocalStorageSerializeKey([chainId, "Option-leverage-value"], "2");
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

  const tokens = getTokens(chainId)
  const tokenAddresses = tokens.map(token => token.address)
  const whitelistedTokens = tokens.filter(t => t.symbol !== "USDG")
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address)
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
  const routerAddress = getContract(chainId, "Router")

  const tokenAllowanceAddress = selectedToken.address === AddressZero ? nativeTokenAddress : selectedToken.address;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, Glp)
  });

  const selectedTokenAmount = parseValue(selectedTokenValue, selectedToken && selectedToken.decimals)
  const needApproval = 
    selectedToken.address !== AddressZero &&
    tokenAllowance &&
    selectedTokenAmount &&
    selectedTokenAmount.gt(tokenAllowance)

  const approveTokens = () => {
    setIsApproving(true);
    const contract = new ethers.Contract(
      selectedToken.address,
      Token.abi,
      library.getSigner()
    );
    contract.approve(routerAddress, ethers.constants.MaxUint256)
      .then(async res => {
        setIsWaitingForApproval(true)
        console.log(selectedToken.symbol, 'Approved!')
      })
      .catch(e => {
        console.error(e);
      })
      .finally(() => {
        setIsApproving(false);
      });
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

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    if(needApproval) {
      approveTokens()
      return
    }
    if(mode ==' Buy') {
      onTrade(symbol, selectedTokenAmount, expandDecimals(50001, 18))
    } else {
      onTrade(symbol, selectedTokenAmount.mul(bigNumberify(-1)), expandDecimals(50001, 18))
    }
  }

  const [showDescription, setShowDescription] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageError, setSlippageError] = useState('');
  const [deadline, setDeadline] = useState();
  useEffect(() => {
    setShowDescription(false)
  }, [chainId, mode])

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

              <div style={{display: 'flex'}}>
                <div className={styles.inputContainer}>
                  <input
                    type="number"
                    placeholder="Amount"
                    className={styles.optionInput}
                    value={selectedTokenValue}
                    onChange={e => {
                      setSelectedTokenValue(e.target.value)
                      setShowDescription(true)
                      //todo: get token price
                      setUsdValue(e.target.value)
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

            <AccountInfoGauge />
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