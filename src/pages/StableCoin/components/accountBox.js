import styles from './accountBox.less';
export const AccountBox = props => {
  //read props

  return (
    <div className={styles.bannerBox}>
      <div className={styles.APYCard}>
        <div className={styles.const}>0.0</div>
        <div className={styles.state}>
          <ins>365-day trailing APY</ins>
        </div>
      </div>
      <div className={styles.accountCard}>
        <div className={styles.detailStyle}>Detail</div>
        <div className={styles.state}>
          <ins>MyAccount</ins>
        </div>
      </div>
    </div>
  );
};
