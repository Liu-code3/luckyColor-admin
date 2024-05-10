import request from "../utils/request";

// 登录示例
export const loginApi = (data) => request({
    url: "/admin/login",
    method: "POST",
    data,
})



