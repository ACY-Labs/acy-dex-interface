import React, { useState, useEffect, useMemo } from 'react';
import AcyCard from '@/components/AcyCard';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import AcyPool from '@/components/AcyPool';
import ComponentTabs from '@/components/ComponentTabs';
import DerivativeComponent from '@/components/DerivativeComponent'
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import { PositionTable } from '@/components/OptionComponent/TableComponent';
import * as Api from '@/acy-dex-futures/Api';
import useSWR from 'swr'
import { fetcher, getProvider, bigNumberify } from '@/acy-dex-futures/utils';
import { BigNumber, ethers } from 'ethers'
import { useChainId } from '@/utils/helpers';
import { useWeb3React } from '@web3-react/core';
import Pool from '@/acy-dex-futures/abis/Pool.json'
import Reader from '@/abis/future-option-power/Reader.json'
import { getTokens, getContract } from '@/constants/future_option_power.js';

// import { getGlobalTokenList } from '@/constants';
import styles from './styles.less'


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

function safeDiv(a, b) {
  return b.isZero() ? BigNumber.from(0) : a.div(b);
}
function safeDiv2(a, b) {
  return b == 0 ? 0 : a / b;
}

const Powers = props => {
  const { account, library, active } = useWeb3React();

  let { chainId } = useChainId(); //TO be changed as const
  const tokens = getTokens(chainId); 
  chainId = 80001

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


  //power_tokens_symbol stores token symbol and option symbol
  let power_tokens_symbol = []
  //power_token stores token symbols without duplicates for tab display
  let power_token = []
  //power_tokens store every symbols in option and its data 
  let power_tokens = {}

  useMemo(() => {
    //power_tokens store every symbols in option and its data 
    power_tokens = symbolsInfo?.filter(ele => ele[0] == "power")
    //power_tokens_symbol stores token symbol and power symbol
    //eg. [{symbol: "BTC", name:"BTC-60000-C"}, {symbol: "BTC", name:"BTC-10000-C"}]
    power_tokens?.forEach((ele) => {
      power_tokens_symbol.push({
        //symbol is displayed
        symbol: ele[1]?.substring(0, 3),
        name: ele[1],
      })
    })
    //power_token stores token symbols without duplicates for tab display
    // let power_token = []
    power_tokens_symbol?.forEach((ele) => {
      if (!power_token.includes(ele.name)) {
        power_token.push(ele.name)
      }
    })
  }, [symbolsInfo, power_token, activeSymbol])

  const [mode, setMode] = useState('Buy')
  const [tableContent, setTableContent] = useState("Positions");

  const [activeSymbol, setActiveSymbol] = useState('BTC^2')
  const [activeToken, setActiveToken] = useState(power_tokens_symbol?.find(ele => ele.name == "BTC")?.name)
  const [latestPrice, setLatestPrice] = useState(0);
  const [priceChangePercentDelta, setPriceChangePercentDelta] = useState(0);
  const onChangePrice = (curPrice, change) => {
    setLatestPrice(curPrice);
    setPriceChangePercentDelta(change);
  }

  const selectChartToken = item => {
    // onClickSetActiveToken(item)
  }
  const selectTab = item => {
    setActiveToken(power_tokens_symbol.find(ele => ele.name == item))
    setActiveSymbol(power_tokens_symbol.find(ele => ele.name == item).name)
    // let newDict = visibleToken
    // Object.entries(visibleToken).forEach((token) => {
    //   token[0] === item
    //     ? newDict[token[0]] = true
    //     : newDict[token[0]] = false
    // })
    // setVisibleToken(newDict)
  }
  const selectSymbol = item => {
    // setActiveSymbol
  }


  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        {/* LEFT CHARTS */}
        <>
          {mode == 'Pool' ?
            <AcyPool />
            : <div className={`${styles.colItem} ${styles.priceChart}`}>
              <AcySymbolNav data={power_token} onChange={selectTab} />
              <AcySymbol
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
              tokens={tokens}
              selectedToken={activeToken}
              symbol={activeSymbol}
              // symbol={symbol}
              pageName="Powers"
            />
          </AcyCard>
        </div>
      </div>
    </div>
  );
}

export default Powers
