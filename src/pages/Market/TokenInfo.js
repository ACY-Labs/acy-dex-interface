import React, { useState } from 'react';
import styles from './styles.less';

function MarketTokenInfo(){
    return (
        <div className={styles.marketRoot}>
            <div>
                <div className={styles.rightButton}></div>
            </div>
            <div style={{display:"flex", justifyContent: "space-between"}}>
                <div className={styles.tokenInfo} style={{background: "red"}}> hello</div>
                <div className={styles.tokenCta} style={{background: "blue"}}> hello</div>
            </div>
            <div style={{display:"flex", justifyContent: "space-between"}}>
                <div className={styles.tokenStats} style={{background:"green"}}> hello</div>
                <div className={styles.tokenCharts} style={{background: "purple"}}> hello</div>
            </div>
        </div>
    )
}

export default MarketTokenInfo;