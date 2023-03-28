import React, { useState, useEffect, useMemo } from 'react';
import AcyCard from '@/components/AcyCard';
import DerivativeComponent from '@/components/DerivativeComponent'
import ComponentTabs from '@/components/ComponentTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import { PositionTable } from '@/components/OptionComponent/TableComponent';
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/future_option_power.js';
import { fetcher } from '@/acy-dex-futures/utils';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers'
import useSWR from 'swr'
import Reader from '@/abis/future-option-power/Reader.json'
import styles from './styles.less'


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

const Powers = props => {
  const { account, library, active } = useWeb3React();

  let { chainId } = useChainId();
  const tokens = getTokens(chainId);
  chainId = 80001

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")
  const { data: symbolsInfo, mutate: updateSymbolsInfo } = useSWR([chainId, readerAddress, "getSymbolsInfo", poolAddress, []], {
    fetcher: fetcher(library, Reader)
  });
  const { data: rawPositionData, mutate: updatePosition } = useSWR([chainId, readerAddress, 'getTdInfo', poolAddress, account], {
    fetcher: fetcher(library, Reader)
  })

  const positionData = getPosition(rawPositionData,)

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updatePosition()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId, updatePosition]
  )

  let power_tokens_symbol = []
  let power_token = []
  let power_tokens = {}

  useMemo(() => {
    // todo: change to symbolsInfo from reader contract
    const symbolsInfo_test = [['power', 'mBTC^2'], ['power', 'mETH^2']]
    power_tokens = symbolsInfo_test?.filter(ele => ele[0] == "power")
    power_tokens?.forEach((ele) => {
      power_tokens_symbol.push({
        symbol: ele[1],
        name: ele[1]?.substring(1, 4),
      })
    })
    power_tokens_symbol?.forEach((ele) => {
      if (!power_token.includes(ele.name)) {
        power_token.push(ele.name)
      }
    })
    }, [symbolsInfo, power_token, activeSymbol])

  const [mode, setMode] = useState('Buy')
  const [symbol, setSymbol] = useState('mBTC^2')
  const [tableContent, setTableContent] = useState("Positions");
  const [activeToken, setActiveToken] = useState((tokens.filter(ele => ele.symbol == "BTC"))[0]);
  const [activeSymbol, setActiveSymbol] = useState('mBTC^2')

  const selectTab = item => {
    setActiveToken((tokens.filter(ele => ele.symbol == item)[0]))
  }
  const selectSymbol = item => {
    // setActiveSymbol
  }

  useEffect(() => {
    setActiveToken((tokens.filter(ele => ele.symbol == "BTC"))[0])
  }, [tokens])

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
              <AcySymbolNav data={power_token} onChange={selectTab} />
              <AcySymbol
                activeSymbol={activeSymbol}
                selectSymbol={selectSymbol}
                setActiveSymbol={setActiveSymbol}
                coinList={power_tokens_symbol}
                latestPriceColor={priceChangePercentDelta * 1 >= 0 && '#0ecc83' || '#fa3c58'}
                latestPrice={latestPrice}
                latestPricePercentage={priceChangePercentDelta}
              />
              <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
                <ExchangeTVChart
                  chartTokenSymbol={activeSymbol}
                  pageName="Powers"
                  fromToken={activeToken.symbol}
                  toToken="USDT"
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


        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <DerivativeComponent
              mode={mode}
              setMode={setMode}
              chainId={chainId}
              tokens={tokens}
              selectedToken={activeToken}
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
