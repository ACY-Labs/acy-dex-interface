import React, { PureComponent } from 'react';
import { Icon } from 'antd';
import { Link } from 'umi';
import {AcyIcon} from '@/components/Acy';
import Debounce from 'lodash-decorators/debounce';
import styles from './index.less';
import RightContent from './RightContent';

export default class GlobalHeader extends PureComponent {
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };
  render() {
    const { collapsed, isMobile, logo } = this.props;
    return (
      <div className={styles.header}>
          <Link to="/" className={styles.logo} key="logo">
            <AcyIcon width={24} name="acy" />
          </Link>
        
        <RightContent {...this.props} />
      </div>
    );
  }
}
