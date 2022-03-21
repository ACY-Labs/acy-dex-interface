
import styles from './accountBox.less';
export const AccountBox = props => {
  //read props

  return (
    <div className={styles.bannerBox}>
      <div className={styles.APYCard}>
        <div className={styles.const}>0.0</div>
        <div className={styles.state}>
          <ins>Balance</ins>
        </div>
      </div>
      <div className={styles.accountCard}>
        <div className={styles.const}>Detail</div>
        <div className={styles.state}>
          <ins>MyAccount</ins>
        </div>
      </div>
    </div>
  );
};
