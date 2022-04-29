/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */

import React from 'react'
import DepthVisualizer from "./DepthVisualizer"
import Spread from './Spread'
import styles from './styles.less'

const book = {
  asks: [
    [11661.89, 7.38470214],
    [11661.90, 1.50651300],
    [11661.96, 0.01000000],
    [11664.73, 0.01831024],
    [11665.54, 1.10470714],
    [11665.62, 0.61473402],
    [11666.45, 0.00694470],
    [11666.56, 2.56600000],
    [11666.58, 0.01350000],
    [11666.61, 1.25050743],
    [11666.64, 0.42440000],
    [11666.87, 2.45020000],
    [11666.93, 0.04000000],
    [11667.41, 0.02600000],
    [11667.63, 0.85090000]
  ],
  bids: [
    [11661.88, 7.69965034],
    [11661.87, 0.13211587],
    [11661.79, 0.10000000],
    [11661.51, 0.42690000],
    [11661.26, 0.01027252],
    [11660.92, 0.13526598],
    [11660.57, 0.85520000],
    [11660.01, 0.90000000],
    [11660.00, 0.85336610],
    [11659.94, 2.82305163],
    [11659.66, 0.46619275],
    [11659.65, 0.25729000],
    [11659.09, 3.90000000],
    [11658.80, 0.02150000],
    [11658.28, 0.25732000]
  ]
};

const formatNumber = (arg: number): string => new Intl.NumberFormat('en-US').format(arg);

const formatPrice = (arg: number): string => arg.toLocaleString("en", { useGrouping: true, minimumFractionDigits: 2 });

export default function Orderbook() {

  const buildPriceLevels = (levels: number[][], orderType: string = "bids"): React.ReactNode => {
    const sortedLevelsByPrice: number[][] = [...levels].sort(
      (currentLevel: number[], nextLevel: number[]): number => {
        let result: number = 0;
        result = nextLevel[0] - currentLevel[0];
        return result;
      }
    );

    return (
      sortedLevelsByPrice.map((level, idx) => {
        const calculatedTotal: number = level[2];
        const total: string = formatNumber(calculatedTotal);
        const depth = level[3];
        const size: string = formatNumber(level[1]);
        const price: string = formatPrice(level[0]);

        return (
          <div className={styles.priceLevelRow}>
            <DepthVisualizer depth={depth} orderType={orderType} />
            <div className={styles.priceLevelContainer}>
              <>
                <span className={styles.label}>{size}</span>
                <span className={styles.label}>{price}</span>
              </>
            </div>
          </div>
        )
      })
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <div>{buildPriceLevels(book.bids, "bids")}</div>
      </div>
      <Spread bids={book.bids} asks={book.asks} />
      <div className={styles.tableContainer}>
        <div className={styles.titleRow}>
          <>
            <span className={styles.title}>SIZE</span>
            <span className={styles.title}>PRICE</span>
          </>
        </div>
        <div>{buildPriceLevels(book.asks, "asks")}</div>
      </div>
    </div>
  );
  // return (
  //   <>
  //     <style
  //       dangerouslySetInnerHTML={{
  //         __html: `
  //           .MakeItNiceAgain {
  //             color: rgba(255, 255, 255, 0.6);
  //             display: inline-block;
  //             font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  //             font-size: 13px;
  //             font-variant-numeric: tabular-nums;
  //             padding: 50px 0;
  //           }

  //           .MakeItNiceAgain__side-header {
  //             font-weight: 700;
  //             margin: 0 0 5px 0;
  //             text-align: right;
  //           }

  //           .MakeItNiceAgain__list {
  //             list-style-type: none;
  //             margin: 0;
  //             padding: 0;
  //           }

  //           .MakeItNiceAgain__list-item {
  //             border-top: 1px solid rgba(255, 255, 255, 0.1);
  //             cursor: pointer;
  //             display: flex;
  //             justify-content: flex-end;
  //           }

  //           .MakeItNiceAgain__list-item:before {
  //             content: '';
  //             flex: 1 1;
  //             padding: 3px 5px;
  //           }

  //           .MakeItNiceAgain__side--bids .MakeItNiceAgain__list-item {
  //             flex-direction: row-reverse;
  //           }

  //           .MakeItNiceAgain__side--bids .MakeItNiceAgain__list-item:last-child {
  //             border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  //           }

  //           .MakeItNiceAgain__side--bids .MakeItNiceAgain__size {
  //             text-align: right;
  //           }

  //           .MakeItNiceAgain__list-item:hover {
  //             background: #262935;
  //           }

  //           .MakeItNiceAgain__price {
  //             border-left: 1px solid rgba(255, 255, 255, 0.1);
  //             border-right: 1px solid rgba(255, 255, 255, 0.1);
  //             color: #b7bdc1;
  //             display: inline-block;
  //             flex: 0 0 70px;
  //             margin: 0;
  //             padding: 3px 5px;
  //             text-align: center;
  //           }

  //           .MakeItNiceAgain__size {
  //             flex: 0 0 70px;
  //             margin: 0;
  //             padding: 3px 5px;
  //             position: relative;
  //           }

  //           .MakeItNiceAgain__size:before {
  //             background-color: var(--row-color);
  //             content: '';
  //             height: 100%;
  //             left: 0;
  //             opacity: 0.08;
  //             position: absolute;
  //             top: 0;
  //             width: 100%;
  //           }
  //         `,
  //       }}
  //     />

  //     <OrderBook
  //       book={{ bids: book.bids, asks: book.asks }}
  //       fullOpacity
  //       interpolateColor={(color) => color}
  //       listLength={10}
  //       stylePrefix="MakeItNiceAgain"
  //     />

  //   </>
  // );
}