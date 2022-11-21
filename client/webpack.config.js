const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const production = process.env.NODE_ENV === 'prod';

module.exports = {
	entry: './index.ts',
	context: path.resolve(__dirname, 'src'),
	devtool: 'source-map',
	mode: production ? 'production' : 'development',
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
		modules: [path.resolve(__dirname, 'src'), 'node_modules'],
	},
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
		sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
		chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js'
	},
	optimization: {
		concatenateModules: false,
		runtimeChunk: true,
		moduleIds: 'hashed',
		splitChunks: {
			chunks: "initial",
			hidePathInfo: true,
			cacheGroups: {
				default: false, 
				defaultVendors: false,
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					priority: 19,
					enforce: true
				}
			}
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../dist/index.html'),
			minify: production ? {
				removeComments: true,
				collapseWhitespace: true
			} : undefined
		}),
	]
};
