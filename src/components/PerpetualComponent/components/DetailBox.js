import React, { useState, useEffect } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import { DownOutlined, SwapRightOutlined } from '@ant-design/icons';
import {
    AcyCard,
    AcyModal,
    AcyCoinItem,
} from '@/components/Acy';
import styles from './styles.less';
import classname from 'classnames';
import Pattern from '@/utils/pattern';


import { MARKET, LIMIT, LONG, SHORT, SWAP, FEE } from '../constant'
import {
    getLiquidationPrice, bigNumberify, formatAmount, expandDecimals, parseValue, getTokenInfo, getPositionKey,
    getWhitelistedTokens,
    usePrevious,
    USD_DECIMALS,
    MARGIN_FEE_BASIS_POINTS,
    BASIS_POINTS_DIVISOR
} from '@/acy-dex-futures/utils'
import { BigNumber } from '@ethersproject/bignumber';


export const DetailBox = (props) => {

    const [shortModeProfitsModelVisible, setShortModeProfitsModelVisible] = useState(false);
    const [profitsIn, setProfitsIn] = useState("USDT");
    const {
        leverage,
        shortOrLong,
        marketOrLimit,
        entryPriceLimit,
        liqPrice,
        entryPriceMarket,
        exitPrice,
        borrowFee,
        token1Symbol,
        fromUsdMin,
        toUsdMax,
        toTokenInfo,
        triggerPriceValue,
        shortCollateralToken,
        toTokenAddress,
        shortCollateralAddress,
        positionsMap,
        positionKey,
        positions,
    } = props;

    const shortModeProfitsTokenList = [
        {
            name: 'USD Tether',
            symbol: 'USDT',
            address: '0x55d398326f99059ff775485246999027b3197955',
            decimals: 18,
            logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg',
            idOnCoingecko: "tether",
        },
        {
            name: 'ACY',
            symbol: 'ACY',
            address: '0xc94595b56e301f3ffedb8ccc2d672882d623e53a',
            decimals: 18,
            logoURI: 'https://acy.finance/static/media/logo.78c0179c.svg',
            idOnCoingecko: "acy-finance",
        },
    ]


    const profitsInOnClickHandle = () => {
        setShortModeProfitsModelVisible(true);
    }
    const onCancel = () => {
        setShortModeProfitsModelVisible(false);
    }

    const ShortModeProfitsModel = () => {
        return (
            <AcyModal onCancel={onCancel} width={400} visible={shortModeProfitsModelVisible}>
                <div>
                    <div className={styles.modelTitle}>
                        Profits In
                    </div>
                    {shortModeProfitsTokenList.map((token, index) => {
                        return (
                            // 感觉得重新写 先放着
                            <AcyCoinItem
                                data={token}
                                key={index}
                                customIcon={false}
                                //clickCallback={() => {console.log('ymj clickCallback wait for function');}}
                                selectToken={() => {
                                    onCancel();
                                    setProfitsIn(token.symbol);
                                }}
                            //constBal={token.symbol in tokenBalanceDict ? tokenBalanceDict[token.symbol] : null}
                            />
                        );
                    })}
                </div>
            </AcyModal>
        )
    }
    // position part
    const existingPosition = positionKey ? positionsMap[positionKey] : undefined;
    const hasExistingPosition =
        existingPosition && existingPosition.size && existingPosition.size.gt(0);
    // liquidation part start
    let entryMarkPrice;
    let exitMarkPrice;
    if (toTokenInfo) {
        entryMarkPrice =
            shortOrLong === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice;
        exitMarkPrice =
            shortOrLong === LONG ? toTokenInfo.minPrice : toTokenInfo.maxPrice;
    }
    const triggerPriceUsd = marketOrLimit === MARKET ? 0 : parseValue(triggerPriceValue, USD_DECIMALS)
    let nextAveragePrice = marketOrLimit === MARKET ? entryMarkPrice : triggerPriceUsd;
    //const liquidationPrice = getLiquidationPrice({amount:expandDecimals(123, USD_DECIMALS), leverage:leverage})
    const liquidationPrice = getLiquidationPrice({
        isLong: shortOrLong === LONG ? true : false,
        size: hasExistingPosition ? existingPosition.size : bigNumberify(0),
        collateral: hasExistingPosition ? existingPosition.collateral : bigNumberify(0),
        averagePrice: nextAveragePrice,
        //averagePrice: BigNumber.from('2895270000000000000000000000000000'), // entryPrice
        entryFundingRate: hasExistingPosition ? existingPosition.entryFundingRate : bigNumberify(0),
        cumulativeFundingRate: hasExistingPosition ? existingPosition.cumulativeFundingRate : bigNumberify(0),
        sizeDelta: toUsdMax, // max price * to token amount
        collateralDelta: fromUsdMin, // min price * from token amount
        increaseCollateral: true,
        increaseSize: true
    })
    const existingLiquidationPrice = existingPosition ? getLiquidationPrice(existingPosition) : undefined;
    let displayLiquidationPrice = liquidationPrice ? liquidationPrice : existingLiquidationPrice;
    console.log('ymj liq price: ', displayLiquidationPrice);
    // fee
    let feesUsd;
    let positionFee;
    if (marketOrLimit === MARKET || marketOrLimit === LIMIT) {
        if (toUsdMax) {
            positionFee = toUsdMax
                .mul(MARGIN_FEE_BASIS_POINTS)
                .div(BASIS_POINTS_DIVISOR);
            feesUsd = positionFee;
        }
    }
    let hasZeroBorrowFee = false;
    let borrowFeeText;
    if (shortOrLong === LONG && toTokenInfo && toTokenInfo.fundingRate) {
        borrowFeeText = formatAmount(toTokenInfo.fundingRate, 4, 4) + "% / 1h";
        if (toTokenInfo.fundingRate.eq(0)) {
            // hasZeroBorrowFee = true
        }
    }
    if (shortOrLong === SHORT && shortCollateralToken && shortCollateralToken.fundingRate) {
        borrowFeeText =
            formatAmount(shortCollateralToken.fundingRate, 4, 4) + "% / 1h";
        if (shortCollateralToken.fundingRate.eq(0)) {
            // hasZeroBorrowFee = true
        }
    }

    // liquidation part end

    useEffect(() => {
        console.log('ymj detal box online', liquidationPrice, formatAmount(displayLiquidationPrice, USD_DECIMALS, 2, true))
    }, [])

    return (
        <div>
            <AcyCard className={styles.describeMain}>
                <div>
                    {shortOrLong === LONG &&
                        <p className={styles.describeTitle}>Profits In: <span className={styles.describeInfo}>{token1Symbol ? token1Symbol : '-'}</span></p>
                    }
                    {shortOrLong === SHORT &&
                        <p className={styles.describeTitle}>Profits In: <span className={styles.describeInfoClickable}
                            onClick={profitsInOnClickHandle}>
                            {profitsIn ? profitsIn : '-'} <DownOutlined />
                        </span></p>
                    }
                    <p className={styles.describeTitle}>Leverage:
                        <span className={styles.describeInfo}>
                            {hasExistingPosition && (
                                <span>
                                    {/*formatAmount(existingPosition.leverage, 4, 2)*/}
                                    {Number(leverage).toFixed(2)}
                                    x
                                    <SwapRightOutlined />
                                </span>
                            )}
                            {Number(leverage).toFixed(2)}x</span></p>
                    <p className={styles.describeTitle}>Entry Price:
                        <span className={styles.describeInfo}>
                            {hasExistingPosition && nextAveragePrice && (
                                <span>$
                                    {/* {formatAmount(
                                        existingPosition.averagePrice,
                                        USD_DECIMALS,
                                        2,
                                        true
                                    )} */}
                                    {Number(leverage).toFixed(2)}
                                    <SwapRightOutlined />
                                </span>
                            )}
                            {nextAveragePrice &&
                                `$${formatAmount(nextAveragePrice, USD_DECIMALS, 2, true)}`}
                            {!nextAveragePrice && `-`} USD</span></p>

                    <p className={styles.describeTitle}>Liq. Price:  <span className={styles.describeInfo}>
                        {hasExistingPosition && displayLiquidationPrice && (
                            <span>$
                                {/* {formatAmount(
                              existingLiquidationPrice,
                              USD_DECIMALS,
                              2,
                              true
                            )} */}
                                {Number(leverage).toFixed(2)}
                                <SwapRightOutlined />
                            </span>
                        )}
                        {displayLiquidationPrice ? formatAmount(displayLiquidationPrice, USD_DECIMALS, 2, true) : '-'}USD</span></p>
                    <p className={styles.describeTitle}>Fees:  <span className={styles.describeInfo}>
                        {!feesUsd && '-'}
                        {feesUsd && `$${formatAmount(feesUsd, USD_DECIMALS, 2, true)}`}
                    </span></p>
                    {shortOrLong === SWAP &&
                        <div>
                        </div>
                    }
                    {/* hj TODO : swap part not showing borrowFee */}

                </div>
                <div className={styles.describeMainTitle}>{shortOrLong} {token1Symbol}</div>
                <div>
                    <p className={styles.describeTitle}>Entry Price: <span className={styles.describeInfo}>
                        {!entryMarkPrice && '-'}
                        {entryMarkPrice && `$${formatAmount(entryMarkPrice, USD_DECIMALS, 2, true)}`} USD</span></p>
                    <p className={styles.describeTitle}>Exit Price:  <span className={styles.describeInfo}>
                        {!exitMarkPrice && '-'}
                        {exitMarkPrice && `$${formatAmount(exitMarkPrice, USD_DECIMALS, 2, true)}`} USD</span></p>
                    <p className={styles.describeTitle}>Borrow Fee:  <span className={styles.describeInfo}>
                        {!borrowFeeText && '-'}
                        {borrowFeeText && `${borrowFeeText}`}</span></p>
                </div>
            </AcyCard>
            <ShortModeProfitsModel />
        </div>

    )
}

