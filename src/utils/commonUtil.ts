/**
 * 格式化日期
 * @param date {Date} 日期
 * @param format {string} 格式化字符串
 *   - y:年，M:月，d:日
 *   - h:时(12)，H:时(24)，m:分，s:秒
 *   - q:季度，a:上午|下午，A:AM|PM
 *   - w:星期(EN)，W:星期(CN)
 *   - 例：'yyyy-MM-dd W' = '1970-01-01 星期四'
 */
export const formatDate = function (date: Date, format: string = 'HH:mm') {
  const re = /(y+)/;
  if (re.test(format)) {
    const t = re.exec(format)![1];
    format = format.replace(t, (date.getFullYear() + '').substring(4 - t.length));
  }
  const CW = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const EW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const o: Record<string, number | string> = {
    'M+': date.getMonth() + 1, // 月
    'd+': date.getDate(), // 日
    'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时[12]
    'H+': date.getHours(), // 小时[24]
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S+': date.getMilliseconds(), // 毫秒
    a: date.getHours() < 12 ? '上午' : '下午', // 上午/下午
    A: date.getHours() < 12 ? 'AM' : 'PM', // AM/PM
    w: EW[date.getDay()],
    W: CW[date.getDay()]
  };
  for (let k in o) {
    const regx = new RegExp('(' + k + ')');
    if (regx.test(format)) {
      const t = regx.exec(format)![1];
      format = format.replace(t, t.length === 1 ? `${o[k]}` : `00${o[k]}`.slice(t.length * -1));
    }
  }
  return format;
};
