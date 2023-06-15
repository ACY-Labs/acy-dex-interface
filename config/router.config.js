/*
 * @Author: Doctor
 * @Date: 2021-09-29 22:07:58
 * @LastEditTime: 2021-10-18 18:30:54
 * @LastEditors: Doctor
 * @Description:
 * @FilePath: \acy-dex-interface\config\router.config.js
 * jianqiang
 */
export default [
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/', redirect: '/future' },
      {
        path: '/market',
        name: 'Market',
        hideChildrenInMenu: true,
        defaultHide: true,
        routes: [
          {
            path: '/market',
            component: './Market/Index',
          },
          {
            path: '/market/list/token',
            component: './Market/TokenList',
          },
          {
            path: '/market/list/pool',
            component: './Market/PoolList',
          },
          {
            path: '/market/info/token/:address',
            component: './Market/TokenInfo',
          },
          {
            path: '/market/info/pool/:address',
            component: './Market/PoolInfo',
          },
          {
            path: '/market/accounts',
            component: './Market/AccountOverview',
          },
          {
            path: '/market/accounts/:address',
            component: './Market/AccountInfo',
          },
        ],
      },
      {
        path: '/trade',
        name: 'Trade',
        component: './Swap/Index',
        defaultHide: true,
      },
      {
        path: '/future',
        name: 'Future',
        component: './Future/Index',
      },
      {
        path: '/options',
        name: 'Options',
        component: './Option/Index',
      },
      {
        path: '/powers',
        name: 'Powers',
        component: './Powers/Index',
      },
      // {
      //   path: '/stablecoin',
      //   name: 'StableCoin',
      //   component: './StableCoin/Index',
      // },
      {
        path: '/launchpad',
        name: 'Launchpad',
        hideChildrenInMenu: true,
        defaultHide: true,
        routes: [
          {
            path: '/launchpad',
            component: './LaunchPad/Index',
          },
          {
            path: '/launchpad/project/:projectId',
            component: './LaunchPad/LaunchpadProject',
          },
        ],
      },
      {
        path: '/liquidity',
        name: 'Liquidity',
        component: './Liquidity/Index',
        defaultHide: true,
      },
      {
        path: '/farms',
        name: 'Farm',
        component: './Farms/',
        defaultHide: true,
      },
      {
        path: './statistics/market',
        name:'Statistics',
        component: './Stats/Market/Index',
        hideInMenu: true,
      },
      {
        path: '/statistics/future',
        name: 'Statistics',
        component: './Stats/Perpetual/Index',
        defaultHide: true,
        // routes:[
        //   {
        //     path:'/stats/perpetual',
        //     name:'Perpetual',
        //     component:'./Stats/Perpetual/Index'
        //   },
        //   {
        //     path:'/stats/stablecoin',
        //     name:'StableCoin',
        //     component:'./Stats/StableCoin/stats'
        //   }
        // ]
      },
      {
        path: './statistics/stablecoin',
        name:'Statistics',
        component: './Stats/StableCoin/stats',
        hideInMenu: true,
      },
      {
        path: '/transaction/:id?',
        name: 'Transaction',
        hideInMenu: true,
        component: './Transaction/Index',
      },
      {
        path: '/overview',
        name: 'Overview',
        hideInMenu: true,
        component: './Overview/Index',
      },
      {
        path: '/login',
        name: 'Login',
        hideInMenu: true,
        component: './WalletLogin/ConnectWallet/Index',
      },
      // {
      //   path: '/login/email',
      //   name: 'Login',
      //   hideInMenu: true,
      //   component: './WalletLogin/Email/Index',
      // },
      // {
      //   path: '/login/phonenumber',
      //   name: 'Login',
      //   hideInMenu: true,
      //   component: './WalletLogin/PhoneNumber/Index',
      // },
    ],
  },
];
