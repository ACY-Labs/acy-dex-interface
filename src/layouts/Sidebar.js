import React, { useState, useEffect } from 'react';
import { Layout, Menu, Tabs, Icon, Button} from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { history } from 'umi';

const { Sider } = Layout;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

const Sidebar = (props) => {
  // state = {
  //   visible: true,
  // };
  const [selectedTab, setSelectedTab] = useState(1);

  // static getDerivedStateFromProps(props, state) {
  //   if (!props.autoHideHeader && !state.visible) {
  //     return {
  //       visible: true,
  //     };
  //   }
  //   return null;
  // }

  // getHeadWidth = () => {
  //   const { isMobile, collapsed, setting } = this.props;
  //   const { fixedHeader, layout } = setting;
  //   if (isMobile || !fixedHeader || layout === 'topmenu') {
  //     return '100%';
  //   }
  //   return collapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)';
  // };

  // handleNoticeClear = type => {
  //   message.success(
  //     `${formatMessage({ id: 'component.noticeIcon.cleared' })} ${formatMessage({
  //       id: `component.globalHeader.${type}`,
  //     })}`
  //   );
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'global/clearNotices',
  //     payload: type,
  //   });
  // };

  const handleMenuClick = (e) => {
    console.log(e.key);
    // const { dispatch } = props;
    if (e.key === 'launch') {
      history.push('/launchpad');
    }
    if (e.key === 'exchange') {
      history.push('/exchange')
    }
    // if (key === 'triggerError') {
    //   history.push('/exception/trigger');
    //   return;
    // }
    // if (key === 'userinfo') {
    //   history.push('/account/settings/base');
    //   // return;
    // }
    // // if (key === 'logout') {
    // //   dispatch({
    // //     type: 'login/logout',
    // //   });
    // // }
  };

  // handScroll = () => {
  //   const { autoHideHeader } = this.props;
  //   const { visible } = this.state;
  //   if (!autoHideHeader) {
  //     return;
  //   }
  //   const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
  //   if (!this.ticking) {
  //     this.ticking = true;
  //     requestAnimationFrame(() => {
  //       if (this.oldScrollTop > scrollTop) {
  //         this.setState({
  //           visible: true,
  //         });
  //       } else if (scrollTop > 300 && visible) {
  //         this.setState({
  //           visible: false,
  //         });
  //       } else if (scrollTop < 300 && !visible) {
  //         this.setState({
  //           visible: true,
  //         });
  //       }
  //       this.oldScrollTop = scrollTop;
  //       this.ticking = false;
  //     });
  //   }
  // };

    // const { isMobile, handleMenuCollapse, setting } = this.props;
    // const { navTheme, layout, fixedHeader } = setting;
    // const { visible } = this.state;
    // const isTop = layout === 'topmenu';
    // const width = this.getHeadWidth();
    // const HeaderDom = visible ? (
    //   <Header style={{ padding: 0, width }} className={fixedHeader ? styles.fixedHeader : ''}>
    //     <TopNavHeader
    //       theme={navTheme}
    //       mode="horizontal"
    //       onCollapse={handleMenuCollapse}
    //       onNoticeClear={this.handleNoticeClear}
    //       onMenuClick={this.handleMenuClick}
    //       onNoticeVisibleChange={this.handleNoticeVisibleChange}
    //       {...this.props}
    //     />
    //   </Header>
    // ) : null;
    const tabMenu = selectedTab === 1 ?
      (
        <Menu
          onClick={handleMenuClick}
          mode="inline"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          style={{ height: '100%' }}
        >
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type='mail' />
                <span> subnav1</span>
              </span>}
          >
            <Menu.Item key="1">Market</Menu.Item>
            <Menu.Item key="2">Perpetual</Menu.Item>
            <Menu.Item key="3">Stats</Menu.Item>
            <Menu.Item key="exchange">
              <Icon type='money-collect' />
              Exchange
            </Menu.Item>
          </SubMenu>

          <SubMenu key="sub2" icon={<LaptopOutlined />} title="subnav 2">
            <Icon type="LaptopOutlined" />
            <Menu.Item key="5">
              <Icon type="mail" />
              Liquidity
            </Menu.Item>
            <Menu.Item key="6">Farm</Menu.Item>
            <Menu.Item key="launch">
              <Icon type="rocket" />
              Launch
            </Menu.Item>
          </SubMenu>

          <Menu.Item key="mail">
            <Icon type="mail" />
            navButton
          </Menu.Item>
        </Menu>
      ) :
      (
        <Menu
          onClick={handleMenuClick}
          mode="inline"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          style={{ height: '100%' }}
        >
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type='mail' />
                <span> subnav1</span>
              </span>}
          >
            <Menu.Item key="1">Market</Menu.Item>
            <Menu.Item key="exchange">
              <Icon type='money-collect' />
              Exchange
            </Menu.Item>
          </SubMenu>
        </Menu>
      );
    return (
      <Sider
        style={{
          overflow: 'auto',
          height: '100%',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="ant-btn-group" style={{marginLeft: "10px", marginTop: "60px", marginBottom: "10px"}}>
          <Button type="primary" icon="download" onClick={() => setSelectedTab(1)} ghost={selectedTab === 2}> Tab1 </Button>
          <Button type="primary" icon="mail" onClick={() => setSelectedTab(2)} ghost={selectedTab === 1}> Tab2 </Button>
        </div>
        {tabMenu}
      </Sider>
    );
}

export default Sidebar;
