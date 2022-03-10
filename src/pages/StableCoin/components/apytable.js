
import styles from './apytable.less';
export const APYtable = props => {
    //read props

    return (
        <div className={styles.APYtable}>
            <div className={styles.tableHead}>
                <div className={styles.tableHeadBlock}>
                    <div className={styles.data}>APY 8.88%</div>
                    <div className={styles.expContent}>30 day trailing average</div>
                </div>
                <div className={styles.tableHeadBlock}>
                    <div className={styles.data}>564.18 OUSD</div>
                    <div className={styles.expContent}>Next rebase</div>
                </div>
            </div>
            <div>
                <div color="#fff">Daily APY for the last thirty days:</div>
            </div>
            <div className={styles.tableData}>
                <table className={styles.APYtableData}>
                    <tr>
                        <td className={styles.tableTh}>Block</td>
                        <td className={styles.tableTh}>APY</td>
                        <td className={styles.tableTh}>Multiplier</td>
                        <td className={styles.tableTh}>Unboosted</td>
                        <td className={styles.tableTh}>Aprx.Yield</td>
                        <td className={styles.tableTh}>OUSD Supply</td>
                        <td className={styles.tableTh}>Backing Supply</td>
                        <td className={styles.tableTh}>Rebasing Supply</td>
                        <td className={styles.tableTh}>Non- Rebasing Supply</td>
                        <td className={styles.tableTh}>%</td>
                        <td className={styles.tableTh}>Ration</td>
                    </tr>
                    <tr>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                    </tr>
                    <tr>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                    </tr>
                </table>
            </div>
        </div>
    );
};
