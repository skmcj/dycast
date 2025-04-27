/**
 * 日志等级
 */
enum LogLevel {
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4
}

const levelNames: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Info]: 'INFO',
  [LogLevel.Warn]: 'WARN',
  [LogLevel.Error]: 'ERROR'
};

const consoleMethod: Record<LogLevel, (...data: any[]) => void> = {
  // debug 会被浏览器默认隐藏
  // [LogLevel.Debug]: console.debug,
  [LogLevel.Debug]: console.log,
  [LogLevel.Info]: console.info,
  [LogLevel.Warn]: console.warn,
  [LogLevel.Error]: console.error
};

interface Trace {
  // 调用函数
  caller: string;
  // 文件路径
  location: string;
}

interface LogData {
  // 日志头
  header: string;
  // 样式
  style: string;
  // 输出数据
  args: any[];
}

const styles = {
  [LogLevel.Debug]: 'color: #6b798e',
  [LogLevel.Info]: 'color: #4994c4',
  [LogLevel.Warn]: 'color: #e9c46a',
  [LogLevel.Error]: 'color: #e94829'
};

interface LoggerConfig {
  prefix?: string;
  level?: LogLevel;
  // 是否输出栈
  trace?: boolean;
  // 是否可用
  enabled?: boolean;
}

/**
 * 自封装日志工具
 */
class Logger {
  /** 配置 */
  private prefix: string;
  private enabled: boolean;
  private level: LogLevel;
  private trace: boolean;

  /**
   * 日志工具
   */
  constructor(config: LoggerConfig = {}) {
    this.prefix = config.prefix || '';
    this.enabled = config.enabled ?? true;
    this.level = config.level ?? LogLevel.Debug;
    this.trace = config.trace ?? true;
  }

  /**
   * 设置日志等级
   * @param level
   */
  public setLevel(level: LogLevel) {
    this.level = level;
  }

  /**
   * 设置是否输出调用栈
   * @param flag
   */
  public setTrace(flag: boolean) {
    this.trace = flag;
  }

  /**
   * 获取调用栈
   * @returns
   */
  private getTrace(origin?: string) {
    if (!origin) return null;
    const lines = origin.split('\n').map(l => l.trim());
    // 0: Error
    // 1: at Logger.getCallTrace ···
    // 2: at Logger.getLogPrefix ···
    // 3: at Logger._log ···
    // 4: at Logger.debug ···
    // 5: user code ···
    const stacks: Trace[] = [];
    lines.forEach(s => {
      let matchArray = s.match(/at (.+?) \((.+?)\)/);
      if (!matchArray) return;
      let name = matchArray[1];
      let location = matchArray[2];
      stacks.push({ caller: name, location });
    });
    if (stacks.length > 3) return stacks.slice(3);
    else return null;
  }

  /** 获取调用栈 */
  private getCallTrace() {
    const origin = new Error().stack;
    const stacks = this.getTrace(origin);
    if (!stacks) return 'unknown';
    const stack = stacks[1] || stacks[0];
    return stack.caller;
  }

  /** 是否需要输出 */
  private isLog(level: LogLevel) {
    return this.enabled && level >= this.level;
  }

  /** 获取输出前缀 */
  private getLogPrefix(level: LogLevel) {
    const time = this.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
    const prefixText = this.prefix ? `[${this.prefix}] ` : '';
    const LEVEL = `   ${levelNames[level]}`.slice(-7);
    const stack = this.trace ? ` --- [${this.getCallTrace()}]` : '';
    // 日志头
    const header = `%c${prefixText}${time} ${LEVEL}${stack}:`;
    // 样式
    const style = styles[level];
    return [header, style];
  }

  /**
   * 输出日志
   * @param level
   * @param message
   */
  private _log(level: LogLevel, args: any[]) {
    if (!this.isLog(level)) return;
    const [header, style] = this.getLogPrefix(level);
    // 输出控制台
    this._console(level, {
      header,
      style,
      args
    });
    // 可扩展保存文件
    // ··· ···
  }

  /**
   * 输出到控制台
   */
  private _console(level: LogLevel, data: LogData) {
    const { header, style, args } = data;
    const _printMethod = consoleMethod?.[level] || console.log;
    _printMethod(header, style, ...args);
  }

  /**
   * 记录到文件
   * @param level
   * @param data
   */
  private _printFile(level: LogLevel, data: LogData) {
    // 记录到日志文件
  }

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
  private formatDate(date: Date, format: string = 'HH:mm') {
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
  }

  /**
   * 开发日志
   * @param message
   */
  public debug(...message: any[]) {
    this._log(LogLevel.Debug, message);
  }

  /**
   * 消息日志
   * @param params
   */
  public info(...message: any[]) {
    this._log(LogLevel.Info, message);
  }

  /**
   * 警告日志
   * @param params
   */
  public warn(...message: any[]) {
    this._log(LogLevel.Warn, message);
  }

  /**
   * 错误日志
   * @param params
   */
  public error(...message: any[]) {
    this._log(LogLevel.Error, message);
  }
}

function test() {
  const MLog = new Logger({ prefix: 'dycast' });
  MLog.debug('debug message');
  MLog.info('info message');
  MLog.warn('warning message');
  MLog.error('error message');
}

/**
 * 输出标签
 * @param tip
 * @param link
 * @param color
 */
export const printInfo = function (
  tip: string = '抖音弹幕姬',
  link: string = 'https://github.com/skmcj/dycast',
  color: string = '#fe2c55'
) {
  console.log(
    `%c ${tip} %c ${link}`,
    `color:white;background:${color};padding:5px 0;border-radius: 5px 0 0 5px;`,
    `padding:4px;border:1px solid ${color};border-radius: 0 5px 5px 0;`
  );
};

export const printSKMCJ = function () {
  const info = `
 ________  ___  __    _____ ______   ________        ___     
|\\   ____\\|\\  \\|\\  \\ |\\   _ \\  _   \\|\\   ____\\      |\\  \\    
\\ \\  \\___|\\ \\  \\/  /|\\ \\  \\\\\\__\\ \\  \\ \\  \\___|      \\ \\  \\   
 \\ \\_____  \\ \\   ___  \\ \\  \\\\|__| \\  \\ \\  \\       __ \\ \\  \\  
  \\|____|\\  \\ \\  \\\\ \\  \\ \\  \\    \\ \\  \\ \\  \\____ |\\  \\\\_\\  \\ 
    ____\\_\\  \\ \\__\\\\ \\__\\ \\__\\    \\ \\__\\ \\_______\\ \\________\\
   |\\_________\\|__| \\|__|\\|__|     \\|__|\\|_______|\\|________|
   \\|_________|
  `;
  console.log(`%c${info}`, `color: #00faf0`);
};

export const CLog = new Logger({ prefix: 'dycast' });
// RLog.setLevel(LogLevel.error);
