import React, { useState, useEffect } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import {
    AcyCard,
    AcyModal,
    AcyCoinItem,
} from '@/components/Acy';
import styles from './styles.less';
import classname from 'classnames';
import Pattern from '@/utils/pattern';


import { MARKET, LIMIT, LONG, SHORT, FEE } from '../constant'


export const DetalBox = (props) => {

    const [shortModeProfitsModelVisible, setShortModeProfitsModelVisible] = useState(false);
    const [profitsIn, setProfitsIn] = useState("ETH");

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
    } = props;

    useEffect(() => {
        console.log('ymj detal box online')
    }, [])
    
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
                        {profitsIn ? profitsIn : '-'}
                    </span></p>
                    }
                    <p className={styles.describeTitle}>Leverage:  <span className={styles.describeInfo}>{Number(leverage).toFixed(2)}x</span></p>
                    {marketOrLimit === LIMIT && 
                    <p className={styles.describeTitle}>Entry Price:  <span className={styles.describeInfo}>{entryPriceLimit?entryPriceLimit:'-'} USD</span></p>
                    }
                    {marketOrLimit === MARKET && 
                    <p className={styles.describeTitle}>Entry Price:  <span className={styles.describeInfo}>{entryPriceMarket?entryPriceMarket:'-'} USD</span></p>
                    }
                    <p className={styles.describeTitle}>Liq. Price:  <span className={styles.describeInfo}>{liqPrice ? liqPrice : '-'}USD</span></p>
                    <p className={styles.describeTitle}>Fees:  <span className={styles.describeInfo}>{FEE.toFixed(2)}%({123} USD)</span></p>
                </div>
                <div className={styles.describeMainTitle}>{shortOrLong} {token1Symbol}</div>
                <div>
                    <p className={styles.describeTitle}>Entry Price: <span className={styles.describeInfo}>{entryPriceMarket ? entryPriceMarket : '-'} USD</span></p>
                    <p className={styles.describeTitle}>Exit Price:  <span className={styles.describeInfo}>{exitPrice ? exitPrice : '-'} USD</span></p>
                    <p className={styles.describeTitle}>Borrow Fee:  <span className={styles.describeInfo}>{borrowFee ? borrowFee : '-'}%/1h</span></p>
                </div>
            </AcyCard>
            <ShortModeProfitsModel />
        </div>

    )
}

