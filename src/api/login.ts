import service from "../utils/request";

interface A {
    username: string,
    password: string,
}

// 登录示例
export const loginApi = (data: A) => service({
    url: "/admin/login",
    method: "POST",
    data,
})



