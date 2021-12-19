import CompressionPlugin from 'compression-webpack-plugin';
import path from 'path';
const ComporessionPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

export default config => {
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

  config.plugin('CompressionPlugin').use(new CompressionPlugin({
    filename: "[path].gz[query]",
    algorithm: "gzip",
    test: productionGzipExtensions,
    threshold: 10240,
    minRatio: 0.8,
    deleteOriginalAssets: false
  }))

};
