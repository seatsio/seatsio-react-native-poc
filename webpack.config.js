var path = require('path');
var nodeExternals = require('webpack-node-externals')

module.exports = {
    entry: './src/main/index.js',
    mode: "production",
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    externals: [nodeExternals()]
};
