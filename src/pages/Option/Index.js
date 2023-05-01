import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Drawer } from 'antd';
import AcyCard from '@/components/AcyCard';
import DerivativeComponent from '@/components/DerivativeComponent'
import ComponentTabs from '@/components/ComponentTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';
import * as Api from '@/acy-dex-futures/Api';
import { fetcher, getProvider, bigNumberify } from '@/acy-dex-futures/utils';
import { useConstantLoader } from '@/constants';
import { BigNumber, ethers } from 'ethers'
import Pool from '@/acy-dex-futures/abis/Pool.json'
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/future_option_power.js';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import styled from "styled-components";
import styles from './styles.less'
import { PositionTable } from '@/components/OptionComponent/TableComponent';

import Reader from '@/abis/future-option-power/Reader.json'
import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core';

function safeDiv(a, b) {
  return b.isZero() ? BigNumber.from(0) : a.div(b);
}
function safeDiv2(a, b) {
  return b == 0 ? 0 : a / b;
}

export function getPosition(rawPositionData, symbolData) {
  if (!rawPositionData || !symbolData) {
    return
  }
  let positionQuery = []
  for (let i = 0; i < rawPositionData.positions.length; i++) {
    const temp = rawPositionData.positions[i]
    const volume = ethers.utils.formatUnits(temp[2], 18)
    if (volume != 0) {
      const symbol = symbolData.find(obj => {
        return obj.address === temp[0]
      })
      const { markPrice, initialMarginRatio, indexPrice, minTradeVolume } = symbol

      const cost = ethers.utils.formatUnits(temp.cost, 18)
      const cumulativeFundingPerVolume = ethers.utils.formatUnits(temp.cumulativeFundingPerVolume, 18)
      const marginUsage = Math.abs(volume * indexPrice) * initialMarginRatio
      const unrealizedPnl = volume * indexPrice - cost
      const _accountFunding = temp.cumulativeFundingPerVolume.mul(temp[2])
      const accountFunding = ethers.utils.formatUnits(_accountFunding, 36)
      const _entryPrice = safeDiv(temp.cost, temp[2])
      // const entryPrice = ethers.utils.formatUnits(_entryPrice,0)
      const entryPrice = safeDiv2(cost, volume)
      let liquidationPrice
      if (volume >= 0) {
        liquidationPrice = markPrice * (1 - initialMarginRatio / 2) - (marginUsage - cost) / (volume * (1 - initialMarginRatio / 2))
      } else {
        liquidationPrice = markPrice * (1 + initialMarginRatio / 2) + (marginUsage - cost) / (volume * (1 + initialMarginRatio / 2))
      }

      const position = {
        symbol: temp[1],
        address: temp[0],
        position: Math.abs(volume),
        entryPrice: entryPrice,
        markPrice: markPrice,
        marginUsage: marginUsage,
        unrealizedPnl: unrealizedPnl,
        accountFunding: accountFunding,
        type: volume >= 0 ? "Long" : "Short",
        minTradeVolume: minTradeVolume,
        liquidationPrice: liquidationPrice,
      };
      positionQuery.push(position)
    }
  }
  return positionQuery;
}

export function getSymbol(rawSymbolData) {
  if (!rawSymbolData) {
    return
  }
  let symbolQuery = []
  for (let i = 0; i < rawSymbolData.length; i++) {
    const temp = rawSymbolData[i]
    const symbol = {
      tokenname: temp[1]?.substring(0, 3),
      symbol: temp[1],
      address: temp[2],
      markPrice: ethers.utils.formatUnits(temp.markPrice, 18),
      indexPrice: ethers.utils.formatUnits(temp.indexPrice, 18),
      initialMarginRatio: ethers.utils.formatUnits(temp.initialMarginRatio, 18), //0.1
      minTradeVolume: ethers.utils.formatUnits(temp.minTradeVolume, 18)

    };
    symbolQuery.push(symbol)
  }
  return symbolQuery;
}

const Option = props => {
  const { account, library, active } = useWeb3React();
  let { chainId } = useChainId();

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const { data: symbolsInfo, mutate: updateSymbolsInfo } = useSWR([chainId, readerAddress, "getSymbolsInfo", poolAddress, []], {
    fetcher: fetcher(library, Reader)
  });
  const { data: rawPositionData, mutate: updatePosition } = useSWR([chainId, readerAddress, 'getTdInfo', poolAddress, account], {
    fetcher: fetcher(library, Reader)
  })

  const symbolData = getSymbol(symbolsInfo)
  const positionData = getPosition(rawPositionData, symbolData)

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updatePosition()
        updateSymbolsInfo()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId,
    updateSymbolsInfo, updatePosition]
  )

  let option_tokens_symbol = []
  let option_token = []

  useMemo(() => {
    symbolsInfo?.filter(ele => ele[0] == "option")?.forEach((ele) => {
      option_tokens_symbol.push({
        symbol: ele[1],
        name: ele[1].split('USD')[0],
      })
    })
    option_tokens_symbol?.forEach((ele) => {
      if (!option_token.includes(ele.name)) {
        option_token.push(ele.name)
      }
    })
  }, [symbolsInfo, option_token, activeSymbol])

  const [mode, setMode] = useState('Buy')
  const [tableContent, setTableContent] = useState("Positions");
  const [activeSymbol, setActiveSymbol] = useState('BTCUSD-60000-C')
  const [latestPrice, setLatestPrice] = useState(0);
  const [priceChangePercentDelta, setPriceChangePercentDelta] = useState(0);
  const onChangePrice = (curPrice, change) => {
    setLatestPrice(curPrice);
    setPriceChangePercentDelta(change);
  }

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        {/* LEFT CHARTS */}
        <>
          {mode == 'Pool' ?
            <AcyPool />
            : <div className={`${styles.colItem} ${styles.priceChart}`}>
              <AcySymbolNav data={option_token} />
              <AcySymbol
                activeSymbol={activeSymbol}
                setActiveSymbol={setActiveSymbol}
                coinList={option_tokens_symbol}
                latestPriceColor={priceChangePercentDelta * 1 >= 0 && '#0ecc83' || '#fa3c58'}
                latestPrice={latestPrice}
                latestPricePercentage={priceChangePercentDelta}
              />
              <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
                <ExchangeTVChart
                  chartTokenSymbol={activeSymbol}
                  pageName="Option"
                  chainId={chainId}
                  onChangePrice={onChangePrice}
                />
              </div>

              <div className={styles.bottomWrapper}>
                <div className={styles.bottomTab}>
                  <ComponentTabs
                    option={tableContent}
                    options={["Positions", "Orders"]}
                    onChange={item => { setTableContent(item) }}
                  />
                </div>
              </div>
              <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', width: '100%', borderTop: '0.75px solid #333333', borderRadius: '0' }}>
                <div className={`${styles.colItem} ${styles.priceChart}`}>
                  <div className={styles.positionsTable}>
                    {tableContent == "Positions" && (
                      <PositionTable dataSource={positionData} chainId={chainId} />
                    )}
                    {tableContent == "Orders" && (
                      <div>ORDERS</div>
                    )}
                  </div>
                </div>
              </AcyCard>
            </div >
          }
        </>

        {/* RIGHT INTERACTIVE COMPONENT */}
        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <DerivativeComponent
              mode={mode}
              setMode={setMode}
              chainId={chainId}
              symbol={activeSymbol}
              pageName="Option"
            />
          </AcyCard>
        </div>
      </div >
    </div >
  );
}

export default Option
