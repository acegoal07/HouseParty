const path = require('node:path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const fileExtensions = ['.html', '.shtml', '-min.js', '-min.css', '.php', '.ico', '.ttf'];

module.exports = {
   mode: 'none',
   plugins: [
      new CopyWebpackPlugin({
         patterns: [
            {
               from: `**/*{${fileExtensions.join(',')}}`,
               to: '[path][name][ext]',
               context: path.resolve(__dirname, 'src'),
               globOptions: {
                  ignore: [
                     '**/*.example.php',
                     '**/api/v1/**'
                  ]
               }
            }
         ]
      })
   ]
};
