import React, { useState, useEffect } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './styles.less';
import classname from 'classnames';
import Pattern from '@/utils/pattern';

export const PriceBox = (props) => {
    const {
        inputTest,
        onChange,
    } = props;
    useEffect(() => {
        console.log('ymj inputTest', inputTest)
    })

    return (
        <div className={styles.acycuarrencycard}>
            <div className={styles.cua_body}>
                <div className={styles.cua_group}>
                    <div className={styles.inputTitle}>Price:</div>
                    <input
                        className={styles.input}
                        placeholder="0.0"
                        bordered={false}
                        onChange={onChange}
                    />
                </div>
                <div className={styles.cua_bottomContainer}>
          <div className={styles.cua_blanace}>{'Mark'}</div>
          <div>{'USD $'}</div>
        </div>
            </div>
        </div>
    )
}

