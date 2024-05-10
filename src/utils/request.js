// 统一的请求发送
import axios from "axios";
// import sysConfig from '@/config/index'


//创建axios实例
const request = axios.create({
    baseURL: "/api", // 公共地址
	timeout: 5000,//超时时间
	headers: {//编译语言
		"Content-type": "application/json;charset=utf-8"
	}
})

//请求拦截
request.interceptors.request.use((config) => {
	config.headers = config.headers || {}  
	if (localStorage.getItem("token")) {
		config.headers.token = localStorage.getItem("token") || ""
	}
	return config
}, error => {
	//处理错误请求
	return Promise.reject(error)
})

//响应拦截
request.interceptors.response.use((res) => {
	const code = res.data.code
	if (code !== 200) {
		//请求失败（包括token失效，302，404...根据和后端约定好的状态码做出不同的处理）
		return Promise.reject(res)
	} else {
		//请求成功
		console.log(res, '成功----')
		return Promise.resolve(res.data)
	}
}, (err) => {
	console.log(err, '错误信息的处理')
	//处理错误响应
	return Promise.reject(err)
})

export default request