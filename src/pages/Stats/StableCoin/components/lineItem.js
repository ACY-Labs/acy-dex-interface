
import styles from './lineItem.less';


export const LineItem = props => {
    //read props
    const { tokenName, value } = props
    return (
        <div className={styles.lineItem}>
            {tokenName}
            <span className={styles.value}>{value}</span>
        </div>
    );
};