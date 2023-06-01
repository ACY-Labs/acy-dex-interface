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
      // {
      //   path: '/market',
      //   name: 'Market',
      //   hideChildrenInMenu: true,
      //   routes: [
      //     {
      //       path: '/market',
      //       component: './Market/Index',
      //     },
      //     {
      //       path: '/market/list/token',
      //       component: './Market/TokenList',
      //     },
      //     {
      //       path: '/market/list/pool',
      //       component: './Market/PoolList',
      //     },
      //     {
      //       path: '/market/info/token/:address',
      //       component: './Market/TokenInfo',
      //     },
      //     {
      //       path: '/market/info/pool/:address',
      //       component: './Market/PoolInfo',
      //     },
      //     {
      //       path: '/market/accounts',
      //       component: './Market/AccountOverview',
      //     },
      //     {
      //       path: '/market/accounts/:address',
      //       component: './Market/AccountInfo',
      //     },
      //   ],
      // },
      // {
      //   path: '/trade',
      //   name: 'Trade',
      //   component: './Swap/Index',
      // },
      {
        path: '/future',
        name: 'Future',
        component: './Future/Index',
        version: 2,
      },
      {
        path: '/options',
        name: 'Options',
        component: './Option/Index',
        version: 2,
      },
      // {
      //   path: '/powers',
      //   name: 'Powers',
      //   component: './Powers/Index',
      // },
      // {
      //   path: '/stablecoin',
      //   name: 'StableCoin',
      //   component: './StableCoin/Index',
      // },
      {
        path: '/launchpad',
        name: 'Launchpad',
        hideChildrenInMenu: true,
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
        version: 1,
      },
      {
        path: '/liquidity',
        name: 'Liquidity',
        component: './Liquidity/Index',
        version: 1,
      },
      {
        path: '/farms',
        name: 'Farm',
        component: './Farms/',
        version: 1,
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
        version: 1,
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
