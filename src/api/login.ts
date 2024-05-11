import request from "../utils/request";

// 登录示例
export const loginApi = <T>(data: T) => request({
    url: "/admin/login",
    method: "POST",
    data,
})



