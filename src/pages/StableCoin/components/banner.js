
const logo = require('./USDA-01.svg');
import styles from './banner.less';
export const Banner = props => {
  //read props

  return (
    <div className={styles.banner}>
      <div className={styles.hummingbird}>
        <div class="body">
          <div class="back" />
          <div class="wings" />
          <div class="head">
            <div class="nape" />
            <div class="beak" />
          </div>
        </div>
      </div>
      <embed class="logo" src={logo} type="image/svg+xml" width="25%" />
      <div class="banner-content">
        The world`s first automatic interest-earning algorithmic stablecon
      </div>
      <div class="banner-box">
        <div class="acycard">
          <div class="const">0.0</div>
          <div class="state">
            <ins>Balance</ins>
          </div>
        </div>
        <div class="acycard">
          <div class="const">0.0</div>
          <div class="state">
            <ins>Pending yield</ins>
          </div>
        </div>
        <div class="acycard">
          <div class="const">0.0</div>
          <div class="state">
            <ins>Lifetime earning</ins>
          </div>
        </div>
        <div class="acycard">
          <div class="const">0.0</div>
          <div class="state">
            <ins>30-day trailing APY</ins>
          </div>
        </div>
      </div>
    </div>
  );
};
