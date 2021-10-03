export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
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
        path: '/liquidity',
        name: 'Liquidity',
        component: './Liquidity/Index',
      },
      {
        path: '/farms',
        name: 'Farms',
        component: './Farms/',
      },
      {
        path: '/conflux',
        name: 'Conflux',
        component: './Conflux/',
      },
      // {
      //   component: '404',
      // },
    ],
  },
];
