const path = require('path');

module.exports = {
  target: 'web',
  entry: './src/webview/main.ts',
  output: {
    path: path.resolve(__dirname, 'out', 'webview'),
    filename: 'game.js',
    library: {
      type: 'umd'
    }
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "path": false,
      "fs": false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.webview.json'),
              transpileOnly: true
            }
          }
        ]
      },
    ],
  },
  mode: 'development',
  devtool: 'source-map',
  performance: {
    hints: false
  }
};
