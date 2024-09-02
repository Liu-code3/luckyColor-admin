const userList = {
  total: 1,
  page: 1,
  strip: 1,
  list: [
    {
      id: 1,
      name: '超管',
      role: [ '管理员', '质检员' ],
      accountNumber: 'admin',
      sex: 0,
      phone: '',
      creationTime: '',
      state: true,
      portrait: 'https://ww1.sinaimg.cn/mw690/9516662fgy1hct88xfrd9j20k00k0dho.jpg'
    }
  ]
};

export default {
  url: '/api/mock/userList',
  method: 'post',
  response: (req: Mockm.Root) => {
    const successInfo = {
      code: 200,
      data: userList,
      msg: '获取用户列表成功~'
    };
    const errInfo = { code: 0, msg: '获取用户列表失败' };
    return req.body.token === '111111111111111' ? successInfo : errInfo;
  }
};
