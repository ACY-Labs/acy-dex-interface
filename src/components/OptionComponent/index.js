import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import styled from 'styled-components';
import { Slider } from 'antd';
import { useConstantLoader } from '@/constants';
import { useLocalStorageSerializeKey } from '@/acy-dex-futures/utils';
import { AcyPerpetualCard, AcyDescriptions, AcyPerpetualButton } from '../Acy';
import PerpetualTabs from '../PerpetualComponent/components/PerpetualTabs';

import styles from './styles.less';

const OptionComponent = props => {

  const {
    mode,
    setMode,
    volume,
    setVolume,
    percentage,
    setPercentage,
  } = props

  const {
    account,
    library,
    chainId,
  } = useConstantLoader(props);

  const optionMode = ['Buy', 'Sell']
  const modeSelect = mode => {
    setMode(mode)
  }

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

  return (
    <div className={styles.main}>
      <AcyPerpetualCard style={{ backgroundColor: 'transparent', border: 'none', margin: '-8px' }}>
        <div className={styles.modeSelector}>
          <PerpetualTabs
            option={mode}
            options={optionMode}
            onChange={modeSelect}
          />
        </div>

        <div className={styles.rowFlexContainer}>
          <span className={styles.title}>Set Volume</span>

          <div className={styles.inputContainer}>
            <input
              type="number"
              min="0"
              placeholder="0.0"
              className={styles.optionInput}
              value={volume}
              onChange={e => { setVolume(e.target.value) }}
            />
            <span className={styles.inputLabel}>USD</span>
          </div>

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
              <StyledSlider
                min={0.1}
                max={30.5}
                step={0.1}
                marks={leverageMarks}
                value={leverageOption}
                onChange={value => setLeverageOption(value)}
                defaultValue={leverageOption}
              />
            </div>
          </AcyDescriptions>

          <div className={styles.buttonContainer}>
            {getPercentageButton('25%')}
            {getPercentageButton('50%')}
            {getPercentageButton('75%')}
            {getPercentageButton('100%')}
          </div>
          <AcyPerpetualButton
            style={{ margin: '25px 0 0 0', width: '100%' }}
            onClick={onClickPrimary}
          >
            {getPrimaryText()}
          </AcyPerpetualButton>

        </div>
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