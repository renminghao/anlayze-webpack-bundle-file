##	简述webpack的bundle文件

###	[GITHUB](https://github.com/renminghao/anlayze-webpack-bundle-file)

目前社区react非常流行，与react流行并驾齐驱的莫过于webpack了，和gulp,grunt等传统的构建流不一样，webpack给了我们更多的可能，一直以来在使用webpack，偶尔闲下来觉得是时候看看bundle后的文件的内容了

###	项目目录
```bash
├── lib
│   ├── a.js
│   ├── b.js
│   └── index.js
```
a.js

```bash
function a (){
		console.log('sss')
}
function b(){
	console.log('ssssv')
}
export { b,a }

```

b.js

```bash
import { a } from './a'
function b(){
		a();
		console.log('b')
}
export default b;
```

index.js

```bash
import b from './b'

function index (){
		b();
		console.log('index')
}

export default index

```

很简单的代码内容，可以看出代码中的引用，index.js引用了b.js，b.js间接引用了a.js，并没有其他的黑科技输入

###	webpack.config.js内容

```bash
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
```

###	输出目录
```bash
├── dist
│   └── index.js
```

index.js

```bash
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["anaylaze"] = factory();
	else
		root["anaylaze"] = factory();
})(this, function() {
return  (function(modules) { 
		...Launch
	})
 	([
		...Modules
	]);
});
```
Launch

```bash
	 	var installedModules = {};
	 	function __webpack_require__(moduleId) {
	 		if(installedModules[moduleId])
	 			return installedModules[moduleId].exports;
	 		var module = installedModules[moduleId] = {
	 			i: moduleId,
	 			l: false,
	 			exports: {}
	 		};
	 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	 		module.l = true;
	 		return module.exports;
	 	}(__webpack_modules__)
	 	__webpack_require__.m = modules;
	 	__webpack_require__.c = installedModules;
	 	__webpack_require__.i = function(value) { return value; };
	 	__webpack_require__.d = function(exports, name, getter) {
	 		if(!__webpack_require__.o(exports, name)) {
	 			Object.defineProperty(exports, name, {
	 				configurable: false,
	 				enumerable: true,
	 				get: getter
	 			});
	 		}
	 	};
	 	__webpack_require__.n = function(module) {
	 		var getter = module && module.__esModule ?
	 			function getDefault() { return module['default']; } :
	 			function getModuleExports() { return module; };
	 		__webpack_require__.d(getter, 'a', getter);
	 		return getter;
	 	};
	
	 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
	 	__webpack_require__.p = "";
	 	return __webpack_require__(__webpack_require__.s = 2);
```

Modules

```bash
[
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__a__ = __webpack_require__(1);


function b(){
		__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__a__["a"])();
		console.log('b')
}

/* harmony default export */ __webpack_exports__["a"] = (b);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export b */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return a; });
function a (){
		console.log('sss')
}

function b(){
	console.log('ssssv')
}


// export default a

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(0);


function index (){
		__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__b__["a" /* default */])();
		console.log('index')
}

/* harmony default export */ __webpack_exports__["default"] = (index);


/***/ })
	 ]
```

###	webpackUniversalModuleDefinition

首先看webpackUniversalModuleDefinition这个function，因为我的打包方式是umd，所以这部分内容可能会输出的比较多，其实也就是兼容commonj的exports和AMD的defined，以及如果两种情况都不存在的时候的window的情况，没什么内容，这部分使用了自执行(IIFE)函数来初始化整个项目，这里需要注意，webpack打包后的文件是不存在'use strict'这个内容的，也是__千万不能有__,因为对于严格模式下面来说，自执行函数的`this === undefined`,否则才是`this === window`

###	Launch

####	installedModules
webpack很巧妙的用了缓存，使得我们如果多次加载同一个模块的时候，能够直接使用内存内部的内容，而不至于再重新去require一次，这个installedModules就是缓存池

###	 \_\_webpack_require\_\_

\_\_webpack_require\_\_相当于webpack自制的一个加载器，通过这个加载器，webpack可以按照自定义的前后顺序来决定依赖关系来实现加载，其中最主要的内容是这句

```bash
modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
```
通过call获取对应moduleId的exports内容

剩下的`__webpack_require__.*`就是只是给加载器富裕特定的属性，最后的

```javascript
__webpack_require__(__webpack_require__.s = 2);
```

告诉我们初始化的模块是moduleId=2的模块，通过分析Modules（下文会提出）我们不难发现，webpack把所有的依赖前置，将最后的引用放在了最后一个module,所以最后一个永远是启动函数，及module[module.length - 1]是启动函数

###	Module

```bash
(function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(0);


function index (){
		__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__b__["a" /* default */])();
		console.log('index')
}

/* harmony default export */ __webpack_exports__["default"] = (index);


/***/ })
```

启动函数在这里，通过moduleId找到对应的额引用的模块，并且加入上下文进行使用,(\_\_webpack_require\_\_(0)),被依赖的元素，在前置，是一个正常的babel编译后的内容

```bash
"use strict";
/* unused harmony export b */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return a; });
function a (){
		console.log('sss')
}

function b(){
	console.log('ssssv')
}
```

这里需要注意的是，我在本地使用的是webpack2,webpack2在这里做了一个小手脚，也就是，我在a.js文件中`export {a,b}`,但是因为我之引用了a所以在这里，webpack进行export的手也只将a进行了export

###	总结

从上面的文件可以看出，webpack的操作就是，在进行umd打包的时候，检测了当前的加载方式，暴露对应的入口，紧接着自制了一个require模块，通过把所有依赖和最后的启动函数放在一个数组内部并进行标号，使得能够随时随地的通过编号来进行依赖引用，自执行(IIFE)函数使得这一切都能够在初始化的时候完成.