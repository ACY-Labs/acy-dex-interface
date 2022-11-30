// https://umijs.org/config/
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import constantConfig from './constant.config';
import defaultSettings from '../src/defaultSettings';
import { defineConfig, IConfig } from 'umi';

const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
const IS_DEV = ["development", "dev"].includes(process.env.NODE_ENV);

const config: IConfig = {
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'layout-header-height': '64px',
    'layout-header-background':'transparent',// 'rgba(27,27,28,0.75)',
    'card-background': '#2f313583',
    'card-radius': '15px',
    'text-color': '#b5b5b6',
    'tabs-title-font-size': '18px',
    'input-bg': '#191B20',
    'input-border-color': 'transparent',
    'input-border-radius': '20px',
    'checkbox-check-bg': '#707070',
    'table-bg': '#2f313583',
    'table-header-bg': '#2f313583',
    'table-header-color': '#B5B6B6',
    'table-row-hover-bg': '#373739',
    'table-border-color': 'transparent',
    'table-border-radius-base': '10px',
  },
  antd: {},
  dva: {
    hmr: true,
  },
  define: constantConfig,
  // 路由配置
  routes: pageRoutes,
  locale: {
    default: 'zh-CN',
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  pwa: false,
  history: { type: 'hash' },
  lessLoader: { javascriptEnabled: true },
  chainWebpack: webpackPlugin,
  extraBabelPlugins: [
    IS_PROD ? 'transform-remove-console': ""
  ],
  fastRefresh: {}
}

export default defineConfig(config);
