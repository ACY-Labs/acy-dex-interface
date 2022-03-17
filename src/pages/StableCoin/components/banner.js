
const logo = require('./USDA-01.svg');
import styles from './banner.less';
export const Banner = props => {
  //read props

  return (
    <div className={styles.banner}>
      <div className={styles.hummingbird}>
        <div className={styles.body}>
          <div className={styles.back} />
          <div className={styles.wings} />
          <div className={styles.head}>
            <div className={styles.nape} />
            <div className={styles.beak} />
          </div>
        </div>
      </div>
      <embed className={styles.logo} src={logo} type="image/svg+xml" width="15%" />
      <div className={styles.bannerContent}>
        The world`s first automatic interest-earning algorithmic stablecon
      </div>
      <div className={styles.bannerBox}>
        <div className={styles.bannerCard}>
          <div className={styles.const}>0.0</div>
          <div className={styles.state}>
            <ins>Balance</ins>
          </div>
        </div>
        <div className={styles.bannerCard}>
          <div className={styles.const}>0.0</div>
          <div className={styles.state}>
            <ins>Pending yield</ins>
          </div>
        </div>
        <div className={styles.bannerCard}>
          <div className={styles.const}>0.0</div>
          <div className={styles.state}>
            <ins>Lifetime earning</ins>
          </div>
        </div>
        <div className={styles.bannerCard}>
          <div className={styles.const}>0.0</div>
          <div className={styles.state}>
            <ins>30-day trailing APY</ins>
          </div>
        </div>
      </div>
    </div>
  );
};
