import React, { Suspense,useEffect,useState  } from 'react';
import { Layout } from 'antd';
import DocumentTitle from 'react-document-title';
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import { connect } from 'umi';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import Media from 'react-media';
import { formatMessage } from 'umi';
import Authorized from '@/utils/Authorized';
import logo from '../assets/logo.png';
import Footer from './Footer';
import Header from './Header';
import Context from './MenuContext';
import PageLoading from '@/components/PageLoading';
import SiderMenu from '@/components/SiderMenu';
import { title } from '../defaultSettings';
import styles from './BasicLayout.less';

// lazy load SettingDrawer
// const SettingDrawer = React.lazy(() => import('@/components/SettingDrawer'));

const { Content } = Layout;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1300,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

const  BasicLayout =props=> {
  // constructor(props) {
  //   super(props);
  //   getPageTitle = memoizeOne(getPageTitle);
  //   matchParamsPath = memoizeOne(matchParamsPath, isEqual);
  // }

  // componentDidMount() {
  //   const {
  //     dispatch,
  //     route: { routes, authority },
  //   } = props;
  //   // dispatch({
  //   //   type: 'user/fetchCurrent',
  //   // });
  //   dispatch({
  //     type: 'setting/getSetting',
  //   });
  //   dispatch({
  //     type: 'menu/getMenuData',
  //     payload: { routes, authority },
  //   });
  // }
  useEffect(() => {
    const {
      dispatch,
      route: { routes, authority },
    } = props;
    // dispatch({
    //   type: 'user/fetchCurrent',
    // });
    dispatch({
      type: 'setting/getSetting',
    });
    dispatch({
      type: 'menu/getMenuData',
      payload: { routes, authority },
    });
  },[])
  // 根据不同页面切换背景色
  const [bgColor,setBgColor]=useState('radialBg');
  useEffect(() => {
    const {
      location: { pathname },
    } = props;
    if(pathname.indexOf('/market')>-1){
      setBgColor('marketRadialBg');
    }
    if(pathname.indexOf('/exchange')>-1){
      setBgColor('radialBg');
    }
    if(pathname.indexOf('/liquidity')>-1){
      setBgColor('liquidityRadialBg');
    }
    if(pathname.indexOf('/farms')>-1){
      setBgColor('farmsRadialBg');
    }
    if(pathname.indexOf('/dao')>-1){
      setBgColor('daoRadialBg');
    }
    if(pathname.indexOf('/launchpad')>-1){
      setBgColor('launchpadRadialBg');
    }
  })
  // componentDidUpdate(preProps) {
  //   // After changing to phone mode,
  //   // if collapsed is true, you need to click twice to display
  //   const { collapsed, isMobile } = props;
  //   if (isMobile && !preProps.isMobile && !collapsed) {
  //     handleMenuCollapse(false);
  //   }
  // }

 const  getContext=()=> {
    const { location, breadcrumbNameMap } = props;
    return {
      location,
      breadcrumbNameMap,
    };
  }

  const matchParamsPath = (pathname, breadcrumbNameMap) => {
    const pathKey = Object.keys(breadcrumbNameMap).find(key => pathToRegexp(key).test(pathname));
    return breadcrumbNameMap[pathKey];
  };

  const getRouterAuthority = (pathname, routeData) => {
    let routeAuthority = ['noAuthority'];
    const getAuthority = (key, routes) => {
      routes.forEach(route => {
        if (route.path && pathToRegexp(route.path).test(key)) {
          routeAuthority = route.authority;
        } else if (route.routes) {
          routeAuthority = getAuthority(key, route.routes);
        }
        return route;
      });
      return routeAuthority;
    };
    return getAuthority(pathname, routeData);
  };

  const getPageTitle = (pathname, breadcrumbNameMap) => {
    const currRouterData = matchParamsPath(pathname, breadcrumbNameMap);

    if (!currRouterData) {
      return title;
    }
    const pageName = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });

    return `${pageName} - ${title}`;
  };

  const getLayoutStyle = () => {
    const { fixSiderbar, isMobile, collapsed, layout } = props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  const handleMenuCollapse = collapsed => {
    const { dispatch } = props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  const renderSettingDrawer = () => {
    // Do not render SettingDrawer in production
    // unless it is deployed in preview.pro.ant.design as demo
    if (process.env.NODE_ENV === 'production' && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer />;
  };

  const getLibrary=(provider, connector)=> {
    return new Web3Provider(provider); // this will vary according to whether you use e.g. ethers or web3.js
  }
  
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      isMobile,
      menuData,
      breadcrumbNameMap,
      route: { routes },
      fixedHeader,
    } = props;
    const isTop = PropsLayout === 'topmenu';
    const routerConfig = getRouterAuthority(pathname, routes);
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};
    const layout = (
      <Layout
      >
        <Layout
          style={{
            ...getLayoutStyle(),
            minHeight: '100vh'
            // background: styles.radialBg
          }}

          className={styles[bgColor]}
        >
          <Header
            menuData={menuData}
            handleMenuCollapse={handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            {...props}
          />
          <Content className={styles.content} style={contentStyle}>
              {children}
          </Content>
          {/* <Footer /> */}
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={getContext()}>
                <Web3ReactProvider getLibrary={getLibrary}>
                  <div className={classNames(params)}>{layout}</div>
                </Web3ReactProvider>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
        {/* <Suspense fallback={<PageLoading />}>{renderSettingDrawer()}</Suspense> */}
      </React.Fragment>
    );
}

export default connect(({ global, setting, menu }) => ({
  collapsed: global.collapsed,
  account:global.account,
  layout: setting.layout,
  menuData: menu.menuData,
  breadcrumbNameMap: menu.breadcrumbNameMap,
  ...setting,
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <BasicLayout {...props} isMobile={isMobile} />}
  </Media>
));
