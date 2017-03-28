var path = require('path');

module.exports = {
	entry : {
			index : './lib/index.js'
	},
	output : {
			filename : '[name].js',
			path  : path.join(__dirname,'/dist'),
			libraryTarget : 'umd',
			library : 'anaylaze'
	},
	module : {
			loaders : [{
			    test : '/\.jsx?$/',
			    loader : 'babel-loader',
			    query : {
					    presets : ['es2015','stage-0']
			    }
			}]
	}
}
