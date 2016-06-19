var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

config.devtool = 'eval';
config.entry.splice(config.entry.indexOf('./index.prod'), 1, './index.dev');
config.entry.unshift(
    'webpack-dev-server/client?http://localhost:6755',
    'webpack/hot/only-dev-server',
    'react-hot-loader/patch'
);
config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
);

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    stats: {
        colors: true
    }
}).listen(6755, 'localhost', function (err) {
    if(err) console.log(err);
    
    console.log('Listening at localhost:6755');
});
