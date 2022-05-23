
import styles from './vaultCard.less';
import { LineItem } from './lineItem';

export const VaultCard = props => {
    //read props
    const { tittle, list } = props
    return (
        <div className={styles.module}>
            <div className={styles.label}>
                {tittle}
            </div>
            {list.map(data => {
                return <LineItem {...data}></LineItem>
            })}
        </div>
    );
};