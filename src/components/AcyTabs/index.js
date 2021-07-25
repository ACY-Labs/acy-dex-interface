import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import styles from './style.less';
const { TabPane } = Tabs;

export default class AcyTabs extends PureComponent {

  render() {
    const { children, ...restProps} = this.props;
    return (
      <div className="acytabs"  ref={node => {
        this.container = node;
      }}>
        <Tabs  {...restProps}>
          {children}
        </Tabs>
      </div>
      
    );
  }
}
AcyTabs.AcyTabPane= TabPane;
