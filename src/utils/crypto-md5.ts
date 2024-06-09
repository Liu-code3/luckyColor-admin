import CryptoJS from 'crypto-js';

export function Encrypt(str: string) {
  // CryptoJS.MD5(str) 会返回一个表示哈希值的对象。
  // CryptoJS.enc.Hex 表示将哈希值转换为十六进制字符串格式。 默认也是十六进制 可不写
  return CryptoJS.MD5(str).toString(CryptoJS.enc.Hex);
}
