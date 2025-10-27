const path = require('node:path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
   mode: 'none',
   entry: {
      dashboard: './src/assets/js/dashboard.js',
      index: './src/assets/js/index.js',
      join: './src/assets/js/join.js',
      loginerror: './src/assets/js/loginerror.js',
      party: './src/assets/js/party.js'
   },
   output: {
      filename: '[name]-min.js',
      path: path.resolve(__dirname, 'src/assets/js'),
      clean: false
   },
   optimization: {
      minimize: true,
      minimizer: [
         new TerserPlugin({
            extractComments: false,
            terserOptions: {
               format: {
                  comments: false
               }
            }
         })
      ]
   },
   resolve: {
      extensions: ['.js'],
      alias: {
         '@': path.resolve(__dirname, 'src')
      },
      modules: ['node_modules']
   }
};