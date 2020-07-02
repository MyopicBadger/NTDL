const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
	mode: 'production',
	watch: true,
	watchOptions: {
		ignored: /node_modules/
	},
	entry: './src/model.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				],
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader',
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					'file-loader',
				],
			},
		],
	},
	plugins: [
		new CopyPlugin([
			{ from: 'src/vue.html', to: 'vue.html' },
			{ from: 'src/favicon.ico', to: 'favicon.ico' },
		]),
		function () {
			this.plugin('done', function (stats) {
				setTimeout(
					() => {
						console.log(('\n[' + new Date().toLocaleString() + ']') + ' --- DONE.\n');
					},
					100
				)
			})
		}
	],
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js'
		}
	}
};