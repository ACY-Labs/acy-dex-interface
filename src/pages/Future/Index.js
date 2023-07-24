import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import AcyCard from '@/components/AcyCard';
import DerivativeComponent from '@/components/DerivativeComponent'
import ComponentTabs from '@/components/ComponentTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/future_option_power.js';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import { fetcher, getSymbol, getPosition, getLimitOrder, formatAmount } from '@/acy-dex-futures/utils';
import Reader from '@/abis/future-option-power/Reader.json'
import styles from './styles.less'
import { PositionTable, OrderTable } from '@/components/OptionComponent/TableComponent';


const Future = props => {
  const { account, library, active } = useWeb3React();
  let { chainId } = useChainId(421613);
  const tokens = getTokens(chainId);

  const [mode, setMode] = useState('Buy')
  //for chart 24h data tab
  const [curPrice, setCurPrice] = useState(0);
  const [priceDeltaPercent, setPriceDeltaPercent] = useState(0);
  const [deltaIsMinus, setDeltaIsMinus] = useState(false);
  const [dailyHigh, setDailyHigh] = useState(0)
  const [dailyLow, setDailyLow] = useState(0)
  const [dailyVol, setDailyVol] = useState(0)

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const { data: symbolsInfo, mutate: updateSymbolsInfo } = useSWR([chainId, readerAddress, "getSymbolsInfo", poolAddress, []], {
    fetcher: fetcher(library, Reader)
  });
  
  const { data: rawPositionData, mutate: updatePosition, isValidating: isFetchingPositionData } = useSWR([chainId, readerAddress, 'getTdInfo', poolAddress, account], {
    fetcher: fetcher(library, Reader)
  })
  const symbolData = useMemo(() => getSymbol(symbolsInfo), [symbolsInfo])
  const positionData = useMemo(() => getPosition(rawPositionData, symbolData, 'Futures'), [symbolData, rawPositionData])
  const limitOrderData = getLimitOrder(account,'Futures')
  const [tableContent, setTableContent] = useState("Positions");
  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updateSymbolsInfo()
        updatePosition()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId,
    updateSymbolsInfo,updatePosition]
  )

  const future_tokens_symbol = useMemo(() => {
    if (!symbolsInfo) return []
    const future_tokens = symbolsInfo?.filter(ele=>ele["category"] == "futures")
    return future_tokens?.map((ele) => {
      const symbol = ele["symbol"]
      const markPrice = ele["markPrice"]
      return {
        symbol: symbol,
        name: symbol,
        markPrice: parseFloat(formatAmount(markPrice, 18)) == 0 ? parseFloat(formatAmount(markPrice, 18, 8)).toPrecision(2) : formatAmount(markPrice, 18),
      }
    })
  }, [symbolsInfo])

  // const future_token = useMemo(() => {
  //   const res = []
  //   future_tokens_symbol?.forEach((ele) => {
  //     if (!res.includes(ele.name)){
  //       res.push(ele.name)
  //     }
  //   })
  //   return res
  // }, [future_tokens_symbol])

  const [activeSymbol, setActiveSymbol] = useState("BTCUSD")
  const [latestPrice, setLatestPrice] = useState(0);
  const [priceChangePercentDelta, setPpriceChangePercentDelta] = useState(0);

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        {mode == 'Pool' ?
          <AcyPool />
          : <div className={`${styles.colItem} ${styles.priceChart}`}>
            {/* <AcySymbolNav data={future_token} /> */}
            <AcySymbol
              pageName="Futures"
              activeSymbol={activeSymbol}
              setActiveSymbol={setActiveSymbol}
              coinList={future_tokens_symbol}
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
                pageName="Futures"
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
                      <OrderTable dataSource={limitOrderData} chainId={chainId} />
                    )}
                  </div>
                </div>
              </AcyCard>
          </div>
        }

        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <DerivativeComponent
              mode={mode}
              setMode={setMode}
              chainId={chainId}
              symbol={activeSymbol}
              pageName="Future"
            />
          </AcyCard>
        </div>
      </div>
    </div>
  );
}

export default Future
