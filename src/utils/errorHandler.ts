import { notification } from '@/utils/message';

interface ExtendedError extends Error {
  code?: number; // 可选属性，用于HTTP错误代码
}

const errorMap: Record<string, string> = {
  InternalError: 'Javascript引擎内部错误',
  ReferenceError: '未找到对象',
  TypeError: '使用了错误的类型或对象',
  RangeError: '使用内置对象时，参数超范围',
  SyntaxError: '语法错误',
  EvalError: '错误的使用了Eval',
  URIError: 'URI错误'
};

export default (error: Error | ExtendedError) => {
  // 过滤HTTP请求错误
  // 首先检查是否是 HTTP 错误
  if ('code' in error && error.code) return;

  const errorType = errorMap[error.name] || '未知错误';

  nextTick(() => {
    notification.error({
      title: '应用错误',
      content: errorType,
      duration: 3000
    });
  });
};
