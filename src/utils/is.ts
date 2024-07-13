function isString<T>(str: T): string {
  return typeof str === 'string' ? str : '';
}

export {
  isString
};
