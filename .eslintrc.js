export default {
	root: true, // 停止在父级目录中寻找
	env: {
		// 指定环境
		browser: true, // 添加所有的浏览器变量F
		node: true, // Node.js 全局变量和 Node.js 作用域
		es6: true, // 启用 ES6 语法支持以及新的 ES6 全局变量或类型
		'vue/setup-compiler-macros': true // 解决使用＜script setup＞报错
	},
	parser: 'vue-eslint-parser', // 默认ESlint使用Espree作为解析器,解析. vue 文件的
	extends: [
		'eslint:recommended', // ESLint的推荐规则
		'plugin:vue/vue3-recommended',
		'plugin:@typescript-eslint/recommended', // @typescript-eslint 推荐规则
		'plugin:prettier/recommended',
	], // 指定扩展的配置
	parserOptions: {
		// 解析器
		ecmaVersion: 2020, // es11
		sourceType: 'module', // ECMAScript 模块
		parser: '@typescript-eslint/parser', // 解析器
		jsxPragma: 'React',
		ecmaFeatures: {
			jsx: true
		}
	},
	// add your custom rules here
	// 下面这些rules是用来设置从插件来的规范代码的规则，使用必须去掉前缀eslint-plugin-
	// 主要有如下的设置规则，可以设置字符串也可以设置数字，两者效果一致
	// "off" -> 0 关闭规则
	// "warn" -> 1 开启警告规则
	// "error" -> 2 开启错误规则
	// 了解了上面这些，下面这些代码相信也看的明白了
	rules: {
		'quote-props': ['error', 'as-needed'], // 对象属性 "必要时加引号"
		'parser': '@typescript-eslint/parser', //禁止 v-for 指令或作用域属性的未使用变量定义c
		'no-undef': 'off', //不能有未定义的变量
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], //启用已使用的变量标记为未使用
		'@typescript-eslint/no-explicit-any': 'off',  // 根据您项目的情况启用或禁用
		'vue/custom-event-name-casing': 'off', //禁用对自定义事件名称强制使用特定大小写
		'no-use-before-define': 'off', //禁用当遇到对尚未声明的标识符的引用时的警告
		'space-before-function-paren': 'off', //禁用函数参数前的意外空格
		'vue/attributes-order': 'off', //禁用强制属性顺序
		'vue/one-component-per-file': 'off', //禁用强制每个组件都应位于其自己的文件中
		'vue/html-closing-bracket-newline': [
			'off',
			{
				singleline: 'never',
				multiline: 'never'
			}
		],
		'vue/max-attributes-per-line': 'off', //禁用强制规定每行的最大属性数
		'vue/multiline-html-element-content-newline': 'off', //禁用在多行元素的内容之前和之后使用换行符
		'vue/singleline-html-element-content-newline': 'off', //禁用在单行元素的内容前后使用换行符
		'vue/attribute-hyphenation': 'off', //禁用对模板中的自定义组件强制实施属性命名样式
		'vue/require-default-prop': 'off', //禁用需要道具的默认值
		'vue/html-self-closing': 'off', //禁用强制实施自动关闭样式
		'vue/v-on-event-hyphenation': 'off', //禁用在模板中的自定义组件上强制实施 V-on 事件命名样式
		'vue/multi-word-component-names': 'off', //禁用组件名称始终为多字
		'prettier/prettier': ['error', { endOfLine: 'auto' }],
		'vue/no-useless-template-attributes': 'off',
		'vue/no-parsing-error': 'off',
		'vue/valid-v-for': 'off',
		'vue/require-v-for-key': 'off',
		'vue/no-setup-props-destructure': 'off',
		'vue/valid-v-slot': 'off',
		'vue/require-prop-types': 'off',
		'no-unreachable': 'off',
		'vue/valid-template-root': 'off',
		'vue/no-deprecated-v-on-native-modifier': 'off',
		'vue/no-mutating-props': 'off',
		'no-empty': 'off',
		'vue/require-valid-default-prop': 'off',
		'vue/no-template-shadow': 'off',
		'vue/require-explicit-emits': 'off',
		camelcase: [
			0,
			{
				properties: 'always'
			}
		],
		// 修改标签属性的 eslint 规则 允许标签属性换行
		'eslint-disable-next-line': 0,
		'eslint-disable': 0,
		// 修改 右标签 > 的 eslint 规则  无需单独一行
		'no-alert': 0, //禁止使用alert confirm prompt
		'no-array-constructor': 2, //禁止使用数组构造器
		'no-bitwise': 0, //禁止使用按位运算符
		'no-caller': 1, //禁止使用arguments.caller或arguments.callee
		'no-catch-shadow': 2, //禁止catch子句参数与外部作用域变量同名
		'no-class-assign': 2, //禁止给类赋值
		'no-cond-assign': 2, //禁止在条件表达式中使用赋值语句
		'no-console': 0, //禁止使用console
		'no-const-assign': 2, //禁止修改const声明的变量
		'no-constant-condition': 2, //禁止在条件中使用常量表达式 if(true) if(1)
		'no-continue': 0, //禁止使用continue
		'no-control-regex': 2, //禁止在正则表达式中使用控制字符
		'no-debugger': 2, //禁止使用debugger
		'no-delete-var': 2, //不能对var声明的变量使用delete操作符
		'no-div-regex': 1, //不能使用看起来像除法的正则表达式/=foo/
		'no-dupe-keys': 2, //在创建对象字面量时不允许键重复 {a:1,a:1}
		'no-dupe-args': 2, //函数参数不能重复
		'no-duplicate-case': 2, //switch中的case标签不能重复
		'no-else-return': 0, //如果if语句里面有return,后面不能跟else语句
		'no-empty-character-class': 2, //正则表达式中的[]内容不能为空
		'no-eq-null': 0, //禁止对null使用==或!=运算符
		'no-eval': 1, //禁止使用eval
		'no-ex-assign': 2 //禁止给catch语句中的异常参数赋值
	}
}
