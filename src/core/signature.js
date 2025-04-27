/**
 * 获取一个 msToken
 *  - 这里只是模拟，不一定准确，实际是通过请求响应的 cookie 获取
 * @param {number} length
 * @returns
 */
export const getMsToken = function (length = 182) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
