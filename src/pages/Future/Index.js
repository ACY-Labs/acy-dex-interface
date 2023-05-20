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
import { fetcher } from '@/acy-dex-futures/utils';
import Reader from '@/abis/future-option-power/Reader.json'
import styles from './styles.less'


const Future = props => {
  const { account, library, active } = useWeb3React();
  let { chainId } = useChainId();
  const tokens = getTokens(chainId);

  const [mode, setMode] = useState('Buy')
  const [symbol, setSymbol] = useState('BTCUSD')
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

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updateSymbolsInfo(undefined, true)
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId,
    updateSymbolsInfo]
  )

  const future_tokens_symbol = useMemo(() => {
    const future_tokens = symbolsInfo?.filter(ele=>ele[0] == "futures")
    return future_tokens?.map((ele) => ({
        symbol: ele[1],
        name: ele[1].replace('USD', ''),
      })
    )
  }, [symbolsInfo])

  const future_token = useMemo(() => {
    const res = []
    future_tokens_symbol?.forEach((ele) => {
      if (!res.includes(ele.name)){
        res.push(ele.name)
      }
    })
    return res
  }, [future_tokens_symbol])

  const [activeSymbol, setActiveSymbol] = useState("BTCUSD")
  const [latestPrice, setLatestPrice] = useState(0);
  const [priceChangePercentDelta, setPpriceChangePercentDelta] = useState(0);

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        {mode == 'Pool' ?
          <AcyPool />
          : <div className={`${styles.colItem} ${styles.priceChart}`}>
            <AcySymbolNav data={future_token} />
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
          </div>
        }

        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <DerivativeComponent
              mode={mode}
              setMode={setMode}
              chainId={chainId}
              symbol={symbol}
              pageName="Future"
            />
          </AcyCard>
        </div>
      </div>
    </div>
  );
}

export default Future
