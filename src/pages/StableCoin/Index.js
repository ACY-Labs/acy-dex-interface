import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import styles from './styles.less';
import { connect } from "umi";
import Media from 'react-media';
import { Banner } from "./components/banner";
import { ExchangeTable } from "./components/exchangeTable"
import { AcyCard } from '@/components/Acy';
import SwapComponent from '@/components/SwapComponent';
import { APYtable } from "./components/apytable"

const icon = require('./aperture.svg');

const StableCoin = (props) => {

    return (
        <PageHeaderWrapper>
        <Banner></Banner>
        
        <div className={styles.exchangeBlock}>
            <ExchangeTable></ExchangeTable>
            <div className={styles.swapCard}>
                <div className={`${styles.colItem} ${styles.swapComponent}`} >
                    <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
                        <div className={styles.trade}>
                            <SwapComponent></SwapComponent>
                        </div>
                    </AcyCard>
                </div>
            </div>
         </div>

        </PageHeaderWrapper>
    )
}

export default connect(({ profile, loading }) => ({
    profile,
    loading: loading.effects['profile/fetchBasic'],
}))(StableCoin);