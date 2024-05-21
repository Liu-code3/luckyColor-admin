type TriggerType = 'blur' | 'change';
type RequiredFn = (message: string, trigger?: TriggerType) => { required: boolean; message: string; triggerRef?: string[] };

export const required: RequiredFn = (message: string, trigger = 'blur') => ({
  required: true,
  message,
  trigger
});

// 常用正则规则大全：https://any86.github.io/any-rule/
export const rules = {
  phone: {
    pattern: /^(13\d|14[579]|15[0-3,5-9]|166|17[0135-8]|18\d|19[89])\d{8}$/,
    message: '请填写符合要求的11位手机号',
    trigger: 'blur'
  },
  email: {
    pattern: /^[\w-]+@[\w-]+(\.[\w-]+)+$/,
    message: '请填写正确的邮箱号',
    trigger: 'blur'
  },
  idCard: {
    pattern: /(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0[1-9]|10|11|12)([0-2]\d|30|31)\d{3}([\dX])$)/i,
    message: '请填写符合要求的身份证号',
    trigger: 'blur'
  },
  lettersNum: {
    pattern: /^[A-Z0-9]+$/i,
    message: '填写内容须是字母或数字组成',
    trigger: 'blur'
  },
  number: {
    pattern: /^\d+$/,
    message: '填写内容必须是纯数字',
    trigger: 'blur'
  },
  price: {
    pattern: /^[1-9](\d+)?(?:\.\d{1,2})?$|^0$|^\d\.\d{1,2}$/,
    message: '只支持正数金额',
    trigger: 'blur'
  }
};
