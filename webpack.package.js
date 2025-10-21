
const path = require('node:path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
   mode: 'none',
   entry: {},
   plugins: [
      new CopyWebpackPlugin({
         patterns: [
            // Copy all HTML files recursively
            {
               from: '**/*.{html,shtml,-min.js,-min.css,php}',
               to: '[path][name][ext]',
               context: path.resolve(__dirname, 'src'),
               globOptions: {
                  ignore: ['**/*.example.php']
               }
            },
            // Copy all -min.js files recursively
            {
               from: '**/*-min.js',
               to: '[path][name][ext]',
               context: path.resolve(__dirname, 'src')
            },
            // Copy all -min.css files recursively
            {
               from: '**/*-min.css',
               to: '[path][name][ext]',
               context: path.resolve(__dirname, 'src')
            },
            // Copy all .php file recursively
            {
               from: '**/*.php',
               to: '[path][name][ext]',
               context: path.resolve(__dirname, 'src'),
               globOptions: {
                  ignore: ['**/*.example.php']
               }
            },
            // Copy all other needed static assets (e.g., images, fonts, webp, woff, woff2, ico)
            {
               from: '**/*.{webp,woff,woff2,ico,png,jpg,jpeg,gif,svg,json,ttf}',
               to: '[path][name][ext]',
               context: path.resolve(__dirname, 'src')
            }
         ]
      })
   ]
};
