import path from 'path';
import HtmlWebpackPlugin from'html-webpack-plugin';
import {WebpackConfiguration} from 'webpack-cli';

const config: WebpackConfiguration = {
	entry: './index.ts',
	context: path.resolve(__dirname, 'src'),
	devtool: 'source-map',
	mode: 'production',
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
		filename: '[name].[chunkhash].bundle.js',
		sourceMapFilename: '[name].[chunkhash].bundle.map',
		chunkFilename: '[name].[chunkhash].chunk.js'
	},
	optimization: {
		concatenateModules: false,
		runtimeChunk: true,
		moduleIds: 'deterministic',
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
			minify: false
		})
	]
};

export default config;
