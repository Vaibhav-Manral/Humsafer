const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = config.resolve.fallback || {};
  config.resolve.fallback.path = require.resolve('path-browserify');
  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ];

  return config;
};
