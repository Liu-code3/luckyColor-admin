import service from "../utils/request";

// 登录示例
export const loginApi = <T extends object>(data: T) => service({
    url: "/admin/login",
    method: "POST",
    data,
})



