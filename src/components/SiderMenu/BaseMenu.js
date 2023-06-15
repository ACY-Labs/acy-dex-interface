import React, { PureComponent, useState } from 'react';
import classNames from 'classnames';
import { Menu, Icon, Drawer, Button } from 'antd';
import { Link } from 'umi';
import { urlToList } from '../_utils/pathTools';
import { getMenuMatches } from './SiderMenuUtils';
import { isUrl } from '@/utils/utils';
import { connect } from 'umi';
import styles from './index.less';
import { AcyIcon } from '@/components/Acy';

const { SubMenu } = Menu;

var currentSelected = 'Market'

export const getMenuIcon = (name, isSelected) => {
  const color = isSelected ? '#b5b6b6' : '#eb5c20'
  if (name == 'Market') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M15 39V34.75H11V13.25H15V9H16.55V13.25H20.55V34.75H16.55V39ZM12.55 33.25H19V14.75H12.55ZM31.45 39V28.75H27.45V17.25H31.45V9H33V17.25H37V28.75H33V39ZM29 27.25H35.45V18.75H29ZM15.75 24ZM32.25 23Z" />
      </svg>
    )
  } else if (name == 'Trade') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M28.45 26.45 35 19.95 28.45 13.4 27.35 14.5 32 19.15H22V20.7H32L27.35 25.35ZM19.55 34.8 20.7 33.65 16 29H26V27.45H16L20.7 22.8L19.55 21.7L13 28.25ZM24 42Q20.3 42 17.025 40.575Q13.75 39.15 11.3 36.7Q8.85 34.25 7.425 31Q6 27.75 6 24Q6 20.3 7.425 17.025Q8.85 13.75 11.3 11.3Q13.75 8.85 17 7.425Q20.25 6 24 6Q27.7 6 30.975 7.425Q34.25 8.85 36.7 11.3Q39.15 13.75 40.575 17Q42 20.25 42 24Q42 27.7 40.575 30.975Q39.15 34.25 36.7 36.7Q34.25 39.15 31 40.575Q27.75 42 24 42ZM24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24ZM24 40.45Q30.8 40.45 35.625 35.625Q40.45 30.8 40.45 24Q40.45 17.2 35.625 12.375Q30.8 7.55 24 7.55Q17.2 7.55 12.375 12.375Q7.55 17.2 7.55 24Q7.55 30.8 12.375 35.625Q17.2 40.45 24 40.45Z" />
      </svg>
    )
  } else if (name == 'Future') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M6 19.7V12.75Q6 11.6 6.8 10.8Q7.6 10 8.75 10H39.25Q40.4 10 41.2 10.8Q42 11.6 42 12.75V19.7H40.45V12.75Q40.45 12.3 40.075 11.925Q39.7 11.55 39.25 11.55H8.75Q8.3 11.55 7.925 11.925Q7.55 12.3 7.55 12.75V19.7ZM8.75 38Q7.6 38 6.8 37.2Q6 36.4 6 35.25V28.3H7.55V35.25Q7.55 35.7 7.925 36.075Q8.3 36.45 8.75 36.45H39.25Q39.7 36.45 40.075 36.075Q40.45 35.7 40.45 35.25V28.3H42V35.25Q42 36.4 41.2 37.2Q40.4 38 39.25 38ZM20 32.75Q20.2 32.75 20.4 32.65Q20.6 32.55 20.7 32.35L28 17.75L31.3 24.35Q31.4 24.55 31.6 24.65Q31.8 24.75 32 24.75H42V23.25H32.5L28.7 15.65Q28.5 15.35 27.975 15.35Q27.45 15.35 27.3 15.65L20 30.25L16.7 23.65Q16.6 23.45 16.4 23.35Q16.2 23.25 16 23.25H6V24.75H15.5L19.3 32.35Q19.4 32.55 19.6 32.65Q19.8 32.75 20 32.75ZM24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Z" />
      </svg>
    )
  } else if (name == 'Options') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px', transform: 'rotate(180deg)' }} viewBox="0 0 50 50">
        <path d="M15 33.05H16.55V14.95H15ZM23.25 23.05H24.75V14.95H23.25ZM31.45 29.05H33V14.95H31.45ZM10.75 40Q9.6 40 8.8 39.2Q8 38.4 8 37.25V10.75Q8 9.6 8.8 8.8Q9.6 8 10.75 8H37.25Q38.4 8 39.2 8.8Q40 9.6 40 10.75V37.25Q40 38.4 39.2 39.2Q38.4 40 37.25 40ZM10.75 38.45H37.25Q37.7 38.45 38.075 38.075Q38.45 37.7 38.45 37.25V10.75Q38.45 10.3 38.075 9.925Q37.7 9.55 37.25 9.55H10.75Q10.3 9.55 9.925 9.925Q9.55 10.3 9.55 10.75V37.25Q9.55 37.7 9.925 38.075Q10.3 38.45 10.75 38.45ZM9.55 38.45Q9.55 38.45 9.55 38.075Q9.55 37.7 9.55 37.25V10.75Q9.55 10.3 9.55 9.925Q9.55 9.55 9.55 9.55Q9.55 9.55 9.55 9.925Q9.55 10.3 9.55 10.75V37.25Q9.55 37.7 9.55 38.075Q9.55 38.45 9.55 38.45Z" />
      </svg>
    )
  } else if (name == 'Powers') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M10.75 40q-1.1 0-1.925-.825T8 37.25v-26.5q0-1.1.825-1.925T10.75 8h26.5q1.1 0 1.925.825T40 10.75v26.5q0 1.1-.825 1.925T37.25 40Zm22.5-1.55h4q.5 0 .85-.35t.35-.85v-4Zm-22.6 0h5.3l6-6h2.2l-6 6h5.4l6-6h2.15l-6 6h5.4l6-6h1.35v-21.7q0-.5-.35-.85t-.85-.35h-26.5q-.5 0-.85.35t-.35.85V37.4l4.95-4.95h2.15Zm4.1-11.75-1.05-1.05 7.55-7.55 4.25 4.2 7.8-7.8 1 1.05-8.8 8.95-4.25-4.25Zm-5.2 10.55V9.55v28.9-1.2Z" />
      </svg>
    )
  } else if (name == 'Launchpad') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M9.45 22.6 15.05 24.95Q16.05 22.95 17.275 20.975Q18.5 19 19.95 17.2L16.35 16.55Q16.05 16.45 15.75 16.55Q15.45 16.65 15.2 16.9ZM16.25 25.9 22.35 32.05Q25.05 30.75 27.5 29.1Q29.95 27.45 31.9 25.45Q35.4 22 37.075 18.35Q38.75 14.7 39.15 9.1Q33.5 9.5 29.9 11.15Q26.3 12.8 22.8 16.3Q20.85 18.25 19.2 20.725Q17.55 23.2 16.25 25.9ZM27.75 20.45Q26.95 19.65 26.95 18.5Q26.95 17.35 27.75 16.55Q28.6 15.75 29.75 15.75Q30.9 15.75 31.7 16.55Q32.55 17.35 32.55 18.5Q32.55 19.65 31.7 20.45Q30.9 21.25 29.75 21.25Q28.6 21.25 27.75 20.45ZM25.6 38.75 31.35 33.05Q31.6 32.8 31.675 32.5Q31.75 32.2 31.7 31.95L31 28.35Q29.2 29.75 27.25 30.975Q25.3 32.2 23.25 33.25ZM40.7 7.55Q40.8 13.4 38.9 17.975Q37 22.55 33.1 26.45Q32.9 26.65 32.7 26.85Q32.5 27.05 32.3 27.2L33.2 31.6Q33.3 32.3 33.1 32.95Q32.9 33.6 32.4 34.1L25.05 41.45L21.75 33.6L14.6 26.5L6.8 23.1L14.1 15.8Q14.65 15.3 15.275 15.075Q15.9 14.85 16.65 15L21.05 15.9Q21.25 15.7 21.425 15.5Q21.6 15.3 21.8 15.15Q25.7 11.25 30.275 9.35Q34.85 7.45 40.7 7.55ZM10.05 32.25Q11.25 31.05 12.9 31.075Q14.55 31.1 15.75 32.3Q16.95 33.45 16.95 35.1Q16.95 36.75 15.75 38Q14.7 39 12.55 39.725Q10.4 40.45 7.3 40.75Q7.6 37.65 8.3 35.475Q9 33.3 10.05 32.25ZM11.15 33.4Q10.45 34.1 9.925 35.525Q9.4 36.95 9.15 38.9Q11.1 38.6 12.525 38.075Q13.95 37.55 14.65 36.85Q15.4 36.15 15.4 35.125Q15.4 34.1 14.65 33.35Q13.9 32.6 12.875 32.625Q11.85 32.65 11.15 33.4Z" />
      </svg>
    )
  } else if (name == 'StableCoin') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M12.4 27.8V20.2H35.6V27.8ZM23.3 9.45V4.9H24.85V9.45ZM36.65 14.55 35.6 13.5 38.45 10.6 39.55 11.7ZM23.3 42.9V38.4H24.85V42.9ZM38.45 37.3 35.6 34.4 36.65 33.3 39.55 36.2ZM11.35 14.55 8.45 11.7 9.55 10.6 12.45 13.5ZM9.55 37.3 8.45 36.2 11.35 33.3 12.45 34.4ZM13.9 26.25H34.1V21.7H13.9ZM13.9 26.25V21.7V26.25Z" />
      </svg>
    )
  } else if (name == 'Liquidity') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M19 34.55H29V33H19ZM23.25 29H24.75V24.75H29V23.25H24.75V19H23.25V23.25H19V24.75H23.25ZM24 42Q18.45 42 14.225 38.125Q10 34.25 10 27.6Q10 23.25 13.5 18.05Q17 12.85 24 6.6Q31 12.85 34.5 18.05Q38 23.25 38 27.6Q38 34.25 33.775 38.125Q29.55 42 24 42ZM24 40.45Q29.25 40.45 32.85 36.85Q36.45 33.25 36.45 27.6Q36.45 23.9 33.35 19.1Q30.25 14.3 24 8.7Q17.75 14.3 14.65 19.1Q11.55 23.9 11.55 27.6Q11.55 33.25 15.125 36.85Q18.7 40.45 24 40.45ZM24 28.45Q24 28.45 24 28.45Q24 28.45 24 28.45Q24 28.45 24 28.45Q24 28.45 24 28.45Q24 28.45 24 28.45Q24 28.45 24 28.45Q24 28.45 24 28.45Q24 28.45 24 28.45Z" />
      </svg>
    )
  } else if (name == 'Farm') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M6 20.05V18.85Q6 14.25 10.1 11.5Q14.2 8.75 24 8.75Q33.8 8.75 37.9 11.5Q42 14.25 42 18.85V20.05ZM7.5 18.5H40.5Q40.65 14.85 36.5 12.575Q32.35 10.3 24 10.3Q15.65 10.3 11.45 12.575Q7.25 14.85 7.5 18.5ZM6 27.95V26.4Q7.7 26.4 8.725 25.35Q9.75 24.3 12.05 24.3Q14.35 24.3 15.25 25.35Q16.15 26.4 18 26.4Q19.85 26.4 20.775 25.35Q21.7 24.3 24 24.3Q26.3 24.3 27.225 25.35Q28.15 26.4 30 26.4Q31.85 26.4 32.725 25.35Q33.6 24.3 35.85 24.3Q38.15 24.3 39.225 25.35Q40.3 26.4 42 26.4V27.95Q39.7 27.95 38.775 26.9Q37.85 25.85 35.95 25.85Q34.1 25.85 33.2 26.9Q32.3 27.95 30 27.95Q27.75 27.95 26.8 26.9Q25.85 25.85 24 25.85Q22.15 25.85 21.2 26.9Q20.25 27.95 18 27.95Q15.7 27.95 14.825 26.9Q13.95 25.85 12.05 25.85Q10.2 25.85 9.25 26.9Q8.3 27.95 6 27.95ZM8.75 40Q7.6 40 6.8 39.2Q6 38.4 6 37.25V32.3H42V37.25Q42 38.4 41.2 39.2Q40.4 40 39.25 40ZM8.75 38.45H39.25Q39.7 38.45 40.075 38.075Q40.45 37.7 40.45 37.25V33.85H7.55V37.25Q7.55 37.7 7.925 38.075Q8.3 38.45 8.75 38.45ZM8.75 33.85Q8.25 33.85 7.9 33.85Q7.55 33.85 7.55 33.85H40.45Q40.45 33.85 40.1 33.85Q39.75 33.85 39.25 33.85ZM7.5 18.5Q7.25 18.5 11.45 18.5Q15.65 18.5 24 18.5Q32.35 18.5 36.5 18.5Q40.65 18.5 40.5 18.5Z" />
      </svg>
    )
  } else if (name == 'Statistics') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} style={{ height: '32px' }} viewBox="0 0 50 50">
        <path d="M24.75 23.25H40.45Q40.15 16.85 35.65 12.275Q31.15 7.7 24.75 7.55ZM23.25 40.45V7.55Q16.7 7.8 12.125 12.575Q7.55 17.35 7.55 24Q7.55 30.65 12.125 35.425Q16.7 40.2 23.25 40.45ZM24.75 40.45Q31.15 40.3 35.65 35.725Q40.15 31.15 40.45 24.75H24.75ZM24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24ZM24 42Q20.25 42 16.975 40.575Q13.7 39.15 11.275 36.725Q8.85 34.3 7.425 31.025Q6 27.75 6 24Q6 20.25 7.425 16.975Q8.85 13.7 11.275 11.275Q13.7 8.85 16.975 7.425Q20.25 6 24 6Q27.75 6 31.025 7.425Q34.3 8.85 36.725 11.275Q39.15 13.7 40.575 16.975Q42 20.25 42 24Q42 27.75 40.575 31.025Q39.15 34.3 36.725 36.725Q34.3 39.15 31.025 40.575Q27.75 42 24 42Z" />
      </svg>
    )
  }
}
// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = icon => {
  if (typeof icon === 'string' && isUrl(icon)) {
    return <img src={icon} alt="icon" className={styles.icon} />;
  }
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
};
@connect(({ global }) => ({
  global,
}))
export default class BaseMenu extends PureComponent {
  state = {
    visible: true,
  }
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = (menusData, parent, defaultHide) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu && (!defaultHide || !item.defaultHide))
      .map(item => this.getSubMenuOrItem(item, parent))
      .filter(item => item);
  };

  getNavMenuItems_default = (menusData, parent, defaultHide) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu && (!defaultHide || !item.defaultHide))
      .map(item => this.getSubMenuOrItem_default(item, parent))
      .filter(item => item);
  };

  // Get the currently selected menu
  getSelectedMenuKeys = pathname => {
    const { flatMenuKeys } = this.props;
    return urlToList(pathname).map(itemPath => getMenuMatches(flatMenuKeys, itemPath).pop());
  };

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = (item, parent) => {
    // doc: add hideChildrenInMenu
    if (item.children && !item.hideChildrenInMenu && item.children.some(child => child.name)) {
      const { name } = item;
      return (
        <SubMenu
          title={
            item.icon ? (
              <span>
                {getIcon(item.icon)}
                <span>{name}</span>
              </span>
            ) : (
              name
            )
          }
          key={item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    }
    return <Menu.Item key={item.path} style={{ marginTop: '-20px' }}>{this.getMenuItemPath(item)}</Menu.Item>
  };

  getSubMenuOrItem_default = (item, parent) => {
    // doc: add hideChildrenInMenu
    if (item.children && !item.hideChildrenInMenu && item.children.some(child => child.name)) {
      const { name } = item;
      return (
        <SubMenu
          title={
            item.icon ? (
              <span>
                {getIcon(item.icon)}
                <span>{name}</span>
              </span>
            ) : (
              name
            )
          }
          key={item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    }
    return <Menu.Item key={item.path} style={{ marginTop: '-20px' }}>{this.getMenuItemPath_default(item)}</Menu.Item>
  };

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = (item) => {
    const { name } = item;
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    const { location, isMobile, onCollapse } = this.props;
    let isSelected = this.selectedKeys && this.selectedKeys[0] ? this.selectedKeys[0].indexOf(name.toLowerCase()) == -1 : true
    if (this.selectedKeys[1]) isSelected = this.selectedKeys[1].split('/')[1].indexOf(name.toLowerCase()) == -1
    return (
      <Link
        className={styles.itemHover}
        to={itemPath}
        target={target}
        replace={itemPath === location.pathname}
        onClick={
          isMobile
            ? () => {
              onCollapse(true);
            }
            : undefined
        }
      >
        {/* {icon} */}
        <div className={styles.menuItem}>
          <div style={{ marginTop: '4px' }}>{getMenuIcon(name, isSelected)}</div>
          <span style={{ color: isSelected ? '#b5b6b6' : '#eb5c20', fontSize: '13px', marginLeft: '3px' }}>{name}</span>
        </div>
      </Link>
    );
  };

  getMenuItemPath_default = (item) => {
    const { name } = item;
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    const { location, isMobile, onCollapse } = this.props;
    let isSelected = this.selectedKeys && this.selectedKeys[0] ? this.selectedKeys[0].indexOf(name.toLowerCase()) == -1 : true
    if (this.selectedKeys[1]) isSelected = this.selectedKeys[1].split('/')[1].indexOf(name.toLowerCase()) == -1
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === location.pathname}
        onClick={
          isMobile
            ? () => {
              onCollapse(true);
            }
            : undefined
        }
      >
        {/* {icon} */}
        <div className={styles.menuItemDefault}>
          <div style={{ height: '22px' }}>{getMenuIcon(name, isSelected)}</div>
          {/* <span style={{ color: isSelected ? '#b5b6b6' : '#eb5c20' }}>{name}</span> */}
        </div>
      </Link>
    );
  };

  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };
  handleMouseEnter = () => {
    const { dispatch, global: { collapsed, defaultHide }, } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: !collapsed,
    });
  }
  render() {
    const {
      openKeys,
      theme,
      mode,
      location: { pathname },
      global: { collapsed, defaultHide },
      dispatch,
      className,
    } = this.props;
    // if pathname can't match, use the nearest parent's key
    this.selectedKeys = this.getSelectedMenuKeys(pathname);
    if (!this.selectedKeys.length && openKeys) {
      this.selectedKeys = [openKeys[openKeys.length - 1]];
    }
    let props = {};
    if (openKeys && !collapsed) {
      props = {
        openKeys: openKeys.length === 0 ? [...this.selectedKeys] : openKeys,
      };
    }
    const { handleOpenChange, style, menuData } = this.props;
    const cls = classNames(className, {
      'top-nav-menu': mode === 'horizontal',
    });

    return (
      <div>
        {collapsed &&
          <Menu
            key="Menu"
            mode={mode}
            theme={theme}
            onOpenChange={handleOpenChange}
            selectedKeys={this.selectedKeys}
            style={style}
            className={cls}
            {...props}
          >
            {this.getNavMenuItems_default(menuData, true, defaultHide)}
          </Menu>
          ||
          <Menu
            key="Menu"
            mode={mode}
            theme={theme}
            onOpenChange={handleOpenChange}
            selectedKeys={this.selectedKeys}
            style={style}
            className={cls}
            {...props}
          >
            {this.getNavMenuItems(menuData, false, defaultHide)}
          </Menu>
        }
        <div onClick={this.handleMouseEnter} className={styles.menu_switch}>
          <Icon type={collapsed && "right" || "left"} />
        </div>
        <div 
          className={styles.linkButton}
          style={{marginTop: defaultHide ? '5rem' : '25rem'}}
          onClick={() => {
            dispatch({
              type: 'global/changeDefaultHide',
              payload: !defaultHide,
            });
          }}
        >
          {defaultHide ? 'More' : 'Hide'}
        </div>
      </div>
    );
  }
}
