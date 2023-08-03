import React, { PureComponent, useState } from 'react';
import { Link } from 'umi';
import RightContent from '../GlobalHeader/RightContent';
import BaseMenu from '../SiderMenu/BaseMenu';
import { AcyIcon } from '@/components/Acy';
import { getFlatMenuKeys } from '../SiderMenu/SiderMenuUtils';
import { MarketSearchBar } from '@/pages/Market/UtilComponent';
import { SearchBar } from './searchBar';
import { useConstantLoader } from '@/constants';
import styles from './index.less';

export default class TopNavHeader extends PureComponent {
  state = {
    maxWidth: undefined,
  };

  static getDerivedStateFromProps(props) {
    return {
      // maxWidth: (props.contentWidth === 'Fixed' ? 1200 : window.innerWidth) - 280 - 165 - 40 - 50,
      maxWidth: 665,
    };
  };

  render() {
    const { theme, contentWidth, menuData, logo } = this.props;
    const { maxWidth } = this.state;
    const flatMenuKeys = getFlatMenuKeys(menuData);

    return (
      <div className={`${styles.head} ${theme === 'light' ? styles.light : ''}`}>
        <div
          ref={ref => {
            this.maim = ref;
          }}
          className={`${styles.mainbar} ${contentWidth === 'Fixed' ? styles.wide : ''}`}
        >
          {/* <div className={styles.left}>
            <div className={styles.logo} key="logo" id="logo">
              <Link to="/">
                <AcyIcon name="acy" width={32}/>
              </Link>
            </div>
            <div
              style={{
                maxWidth
              }}
            >
              <BaseMenu {...this.props} flatMenuKeys={flatMenuKeys} className={styles.menu} />
            </div>
          </div> */}
          <div className={styles.left}>
            {/* <SearchBar className={styles.searchBar} /> */}
          </div>
          <RightContent {...this.props} />
        </div>
      </div>
    );
  }
}
