const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const stylelint = require('stylelint');
const postCssReporter = require('postcss-reporter');
const webpackConfig = require('./webpack.base.conf');
const commonExcludes = require('../lib/common-excludes');
const userWebpackConfig = require('../lib/get-user-webpack-config')('dev');
const config = require('./index');

const isDevServer = process.argv.find(command => command.includes('start'));

// so that everything is absolute
webpackConfig.output.publicPath = `${config.domain}:${config.port}/`;

console.log('test');

// add hot-reload related code to entry chunks
Object.keys(webpackConfig.entry).forEach(name => {
  webpackConfig.entry[name] = [
    path.join(__dirname, '../lib/hot-client.js'),
  ].concat(webpackConfig.entry[name]);
});

function stylelintLoader() {
  if (!fs.existsSync(config.paths.stylelint.rc)) {
    return [];
  }

  const ignorePath = fs.existsSync(config.paths.stylelint.ignore)
    ? config.paths.stylelint.ignore
    : null;

  return [
    stylelint({
      configFile: config.paths.stylelint.rc,
      emitErrors: !isDevServer,
      ignorePath,
    }),
  ];
}

module.exports = merge(
  webpackConfig,
  {
    devtool: '#eval-source-map',

    module: {
      rules: [
        {
          test: /\.s[ac]ss$/,
          exclude: commonExcludes(),
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {importLoaders: 2, sourceMap: true},
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                ident: 'postcss',
                plugins: loader => [
                  require('postcss-import')({root: loader.resourcePath}),
                  ...stylelintLoader(),
                  autoprefixer(),
                  postCssReporter({clearReportedMessages: true}),
                ],
              },
            },
            {loader: 'sass-loader', options: {sourceMap: true}},
          ],
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env': {NODE_ENV: '"development"'},
      }),

      new webpack.HotModuleReplacementPlugin(),

      new webpack.NoEmitOnErrorsPlugin(),

      new HtmlWebpackPlugin({
        excludeChunks: ['static'],
        filename: '../layout/theme.liquid',
        template: './layout/theme.liquid',
        inject: true,
      }),
    ],
  },
  userWebpackConfig
);
