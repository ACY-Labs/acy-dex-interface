import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './styles.less';
import classname from 'classnames';
import Pattern from '@/utils/pattern';
import { LONG, SHORT } from '../constant'
import { BigNumber } from '@ethersproject/bignumber';
import { formatAmount, USD_DECIMALS } from '@/acy-dex-futures/utils'


export const PriceBox = (props) => {
    const {
        onChange,
        markOnClick,
        priceValue,
        mark,
        // toTokenInfo,
        // mode,
    } = props;

    // let entryMarkPrice;
    // let exitMarkPrice;
    // if (toTokenInfo) {
    //     entryMarkPrice =
    //         mode === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice;
    //     exitMarkPrice =
    //         mode === LONG ? toTokenInfo.minPrice : toTokenInfo.maxPrice;
    // }
    // const mark = entryMarkPrice

    // const onClick = () => {
    //     markOnClick(formatAmount(mark, USD_DECIMALS, 2, true))
    // }

    return (
        <div className={styles.acycuarrencycard}>
            <div className={styles.cua_body}>
                <div className={styles.cua_group}>
                    <div className={styles.inputTitle}>Price:</div>
                    <input
                        className={styles.input}
                        placeholder="0.0"
                        value={priceValue}
                        bordered={false}
                        onChange={onChange}
                        oninput="value=value.replace(/[^\d]/g,'')"
                    />
                </div>
                <div className={styles.cua_bottomContainer}>
                    <div className={styles.cua_blanace} onClick={markOnClick}>
                        Mark: {mark}
                    </div>
                    <div>USD</div>
                </div>
            </div>
        </div>
    )
}

