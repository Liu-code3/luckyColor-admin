import { notification } from '@/utils/message';

const errorMap: Record<string, string> = {
  InternalError: 'Javascript引擎内部错误',
  ReferenceError: '未找到对象',
  TypeError: '使用了错误的类型或对象',
  RangeError: '使用内置对象时，参数超范围',
  SyntaxError: '语法错误',
  EvalError: '错误的使用了Eval',
  URIError: 'URI错误',
  AggregateError: '表示同时发生的多个错误',
  PromiseRejectionEvent: '未处理的 Promise 拒绝事件'
};

export default (error: unknown, _: ComponentPublicInstance | null, info: string) => {
  let errorName = '错误';
  let errorContent = info || '';

  if (error instanceof Error) {
    errorName = errorMap[error.name] || '错误';
    errorContent = error.message || '未知错误';
  }

  notification.error({
    title: errorName,
    content: errorContent,
    duration: 5000
  });
};
