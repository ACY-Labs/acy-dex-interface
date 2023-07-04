import React, { useState, useEffect, useMemo } from 'react';
import AcyCard from '@/components/AcyCard';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import AcyPool from '@/components/AcyPool';
import ComponentTabs from '@/components/ComponentTabs';
import DerivativeComponent from '@/components/DerivativeComponent'
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import { PositionTable } from '@/components/OptionComponent/TableComponent';
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/future_option_power.js';
import { fetcher, getSymbol, getPosition, formatAmount } from '@/acy-dex-futures/utils';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers'
import useSWR from 'swr'
import Pool from '@/acy-dex-futures/abis/Pool.json'
import Reader from '@/abis/future-option-power/Reader.json'

import styles from './styles.less'

const Powers = props => {
  const { account, library, active } = useWeb3React();

  let { chainId } = useChainId();
  const tokens = getTokens(chainId);

  ///data 
  const [symbol, setSymbol] = useState('BTC^2')
  //for chart 24h data tab
  const [curPrice, setCurPrice] = useState(0);
  const [priceDeltaPercent, setPriceDeltaPercent] = useState(0);
  const [deltaIsMinus, setDeltaIsMinus] = useState(false);
  const [dailyHigh, setDailyHigh] = useState(0)
  const [dailyLow, setDailyLow] = useState(0)
  const [dailyVol, setDailyVol] = useState(0)
  ///// read reader contract, getTdInfo and getSymbolsInfo
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

  let power_tokens_symbol = []
  let power_token = []

  useMemo(() => {
    symbolsInfo?.filter(ele => ele[0] == "power")?.forEach((ele) => {
      power_tokens_symbol.push({
        symbol: ele[1],
        name: ele[1].split('^')[0],
        price: parseFloat(formatAmount(ele?.markPrice, 18)) == 0 ? parseFloat(formatAmount(ele?.markPrice, 18, 8)).toPrecision(2) : formatAmount(ele?.markPrice, 18),
      })
    })
    power_tokens_symbol?.forEach((ele) => {
      if (!power_token.includes(ele.name)) {
        power_token.push(ele.name)
      }
    })
  }, [symbolsInfo, power_token, activeSymbol])

  const [mode, setMode] = useState('Buy')
  const [tableContent, setTableContent] = useState("Positions");
  const [activeSymbol, setActiveSymbol] = useState('BTC^2')
  const [latestPrice, setLatestPrice] = useState(0);
  const [priceChangePercentDelta, setPpriceChangePercentDelta] = useState(0);
  const onChangePrice = (curPrice, change) => {
    setLatestPrice(curPrice);
    setPpriceChangePercentDelta(change);
  }

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        <>
          {mode == 'Pool' ?
            <AcyPool />
            : <div className={`${styles.colItem} ${styles.priceChart}`}>
              <AcySymbolNav data={power_token} />
              <AcySymbol
                pageName="Powers"
                activeSymbol={activeSymbol}
                setActiveSymbol={setActiveSymbol}
                coinList={power_tokens_symbol}
                latestPriceColor={priceDeltaPercent * 1 >= 0 && '#0ecc83' || '#fa3c58'}
                latestPrice={curPrice}
                latestPricePercentage={priceDeltaPercent}
                dailyLow={dailyLow}
                dailyHigh={dailyHigh}
                dailyVol={dailyVol}
              />
              <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
                <ExchangeTVChart
                  chainId={chainId}
                  pageName="Powers"
                  activeSymbol={activeSymbol}
                  setCurPrice={setCurPrice}
                  setPriceDeltaPercent={setPriceDeltaPercent}
                  setDailyHigh={setDailyHigh}
                  setDailyLow={setDailyLow}
                  setDailyVol={setDailyVol}
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
            </div>
          }
        </>

        {/* RIGHT INTERACTIVE COMPONENT */}
        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <DerivativeComponent
              mode={mode}
              setMode={setMode}
              chainId={chainId}
              symbol={symbol}
              pageName="Powers"
            />
          </AcyCard>
        </div>
      </div>
    </div>
  );
}

export default Powers
