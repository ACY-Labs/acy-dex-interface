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
      { path: '/', redirect: '/exchange' },
      {
        path: '/market',
        name: 'Market',
        hideChildrenInMenu: true,
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
        path: '/exchange',
        name: 'Exchange',
        component: './Swap/Index',
      },
      {
        path: '/future',
        name: 'Future',
        component: './Perpetual/Index',
      },
      {
        path: '/',
        name: 'Option',
      },
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
      },
      {
        path: '/stablecoin',
        name: 'StableCoin',
        component: './StableCoin/Index',
      },
      {
        path: '/liquidity',
        name: 'Liquidity',
        component: './Liquidity/Index',
      },
      {
        path: '/farms',
        name: 'Farm',
        component: './Farms/',
      },
      {
        path: '/stats/future',
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
      },
      {
        path: './stats/stablecoin',
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
    ],
  },
];
