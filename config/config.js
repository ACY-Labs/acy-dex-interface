// https://umijs.org/config/
import os from 'os';
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import defaultSettings from '../src/defaultSettings';
import slash from 'slash2';
import { defineConfig } from 'umi';
const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        enable: true, // default false
        default: 'zh-CN', // default zh-CN
        baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
        webpackChunkName: true,
      },
      pwa: {
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
          importWorkboxFrom: 'local',
        },
      },
      ...(!process.env.TEST && os.platform() === 'darwin'
        ? {
            dll: {
              include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
              exclude: ['@babel/runtime'],
            },
            hardSource: false,
          }
        : {}),
    },
  ],
];

// 针对 preview.pro.ant.design 的 GA 统计代码
// 业务上不需要这个
if (process.env.APP_TYPE === 'site') {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
}

export default defineConfig({
  // // add for transfer to umi
  // plugins,

  // treeShaking: true,
  // targets: {
  //   ie: 11,
  // },
  // // 路由配置
  // routes: pageRoutes,
  // // Theme for antd
  // // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'layout-header-height': '64px',
    'layout-header-background':'transparent',// 'rgba(27,27,28,0.75)',
    'card-background': '#2a292e',
    'card-radius': '15px',
    'text-color': '#b5b5b6',
    'tabs-title-font-size': '18px',
    'input-bg': '#191B20',
    'input-border-color': 'transparent',
    'border-radius-base': '10px',
    'checkbox-check-bg': '#707070',
    'table-bg': '#2A2A2D',
    'table-header-bg': '#2F3135',
    'table-header-color': '#B5B6B6',
    'table-row-hover-bg': '#373739',
    'table-border-color': 'transparent',
    'table-border-radius-base': '10px',
  },
  // externals: {
  //   '@antv/data-set': 'DataSet',
  // },
  // // proxy: {
  // //   '/server/api/': {
  // //     target: 'https://preview.pro.ant.design/',
  // //     changeOrigin: true,
  // //     pathRewrite: { '^/server': '' },
  // //   },
  // // },
  // ignoreMomentLocale: true,
  // lessLoaderOptions: {
  //   javascriptEnabled: true,
  // },
  // disableRedirectHoist: true,
  // cssLoaderOptions: {
  //   modules: true,
  //   getLocalIdent: (context, localIdentName, localName) => {
  //     if (
  //       context.resourcePath.includes('node_modules') ||
  //       context.resourcePath.includes('ant.design.pro.less') ||
  //       context.resourcePath.includes('global.less')
  //     ) {
  //       return localName;
  //     }
  //     const match = context.resourcePath.match(/src(.*)/);
  //     if (match && match[1]) {
  //       const antdProPath = match[1].replace('.less', '');
  //       const arr = slash(antdProPath)
  //         .split('/')
  //         .map(a => a.replace(/([A-Z])/g, '-$1'))
  //         .map(a => a.toLowerCase());
  //       return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
  //     }
  //     return localName;
  //   },
  // },
  // manifest: {
  //   basePath: '/',
  // },

  chainWebpack: webpackPlugin,
  antd: {},
  dva: {
    hmr: true,
  },
  define: {
    APP_TYPE: process.env.APP_TYPE || '',
  },
  // 路由配置
  routes: pageRoutes,
  locale: {
    default: 'zh-CN',
    baseNavigator: true,
  },
  dynamicImport: {
    // 无需 level, webpackChunkName 配置
    // loadingComponent: './components/PageLoading/index'
    loading: '@/components/PageLoading/index',
  },
  // 暂时关闭
  pwa: false,
  history: { type: 'hash' },
  lessLoader: { javascriptEnabled: true },
  chainWebpack(config) {
    config.optimization.splitChunks({
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.(css|less)$/,
          chunks: 'async',
          minChunks: 1,
          minSize: 0,
        },
      },
    });
  },
});
