import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import styled from 'styled-components';
import { Slider, Input, Button } from 'antd';
import { useConstantLoader } from '@/constants';
import { useLocalStorageSerializeKey } from '@/acy-dex-futures/utils';
import { AcyPerpetualCard, AcyDescriptions, AcyPerpetualButton } from '../Acy';
import PerpetualTabs from '../PerpetualComponent/components/PerpetualTabs';
import AccountInfoGauge from '../AccountInfoGauge';
import AcyPoolComponent from '../AcyPoolComponent';

import styles from './styles.less';
import AcyPool from '../AcyPool';

const OptionComponent = props => {

  const {
    mode,
    setMode,
    volume,
    setVolume,
    percentage,
    setPercentage,
    powers,
  } = props

  const {
    account,
    library,
    chainId,
    farmSetting: { INITIAL_ALLOWED_SLIPPAGE }
  } = useConstantLoader(props);

  const optionMode = ['Buy', 'Sell', 'Pool']
  
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

  const getPrimaryText = () => {
    if (mode == 'Buy') {
      return 'Buy / Long'
    } else {
      return 'Sell / Short'
    }
  }

  const onClickPrimary = () => {

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
            onChange={(mode)=>{setMode(mode)}}
          />
        </div>

        {mode == 'Pool'
          ?
            <AcyPoolComponent />
          :
          <>
            <div className={styles.rowFlexContainer}>

              <div className={styles.inputContainer}>
                <input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  className={styles.optionInput}
                  value={volume}
                  onChange={e => {
                    setVolume(e.target.value)
                    setShowDescription(true)
                  }}
                />
                <span className={styles.inputLabel}>USD</span>
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

            {!powers && <AccountInfoGauge />}
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