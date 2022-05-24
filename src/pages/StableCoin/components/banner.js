
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

      {/* <embed className={styles.logo} src={logo} type="image/svg+xml" width="15%" /> */}
      <div className={styles.bannerTittle}>USDA</div>
      <div className={styles.bannerContent}></div>
    </div>
  );
};
