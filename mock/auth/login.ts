export default {
    url: '/api/mock/login',
    method: 'post',
    response: (req: Mockm.RequestHeaders) => {
      const successInfo = { 
          code: 200, 
          data: "111111111111111", 
          msg: '登录成功~'
       };
      const errInfo = { code: 0, msg: '登录失败' };
      return req.body.adminName === 'admin' ? successInfo : errInfo;
    }
  };
  