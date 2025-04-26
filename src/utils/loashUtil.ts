/**
 * @file
 * 魔改 loash
 */

/**
 * 防抖配置
 */
export interface DebounceOptions {
  /**
   * 指定是否在超时的前沿调用
   */
  leading?: boolean | undefined;
  /**
   * 调用 func 之前允许延迟的最长时间
   */
  maxWait?: number | undefined;
  /**
   * 指定是否在超时后沿调用
   */
  trailing?: boolean | undefined;
}
export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;

  /**
   * 丢弃任何挂起的 debounced 函数调用
   */
  cancel(): void;

  /**
   * 如果有一个挂起的 debounced 函数调用，立即调用它并返回其返回值
   * 否则，返回上一次调用的值，或者如果函数从未被调用过，则返回 undefined
   */
  flush(): ReturnType<T> | undefined;
}

/**
 * 节流配置
 */
export interface ThrottleOptions {
  /**
   * 指定在超时的前沿调用
   */
  leading?: boolean | undefined;
  /**
   * 指定在超时后沿调用
   */
  trailing?: boolean | undefined;
}

const objectProto = Object.prototype;

const hasOwnProperty = objectProto.hasOwnProperty;

const nativeObjectToString = objectProto.toString;

const undefinedTag = '[object Undefined]';

const nullTag = '[object Null]';

const symbolTag = '[object Symbol]';

const symToStringTag = Symbol.toStringTag;

const NAN = 0 / 0;

const reWhitespace = /\s/;

const reTrimStart = /^\s+/;

const reIsBinary = /^0b[01]+$/i;

const reIsOctal = /^0o[0-7]+$/i;

const reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

const freeParseInt = parseInt;

/**
 * baseGetTag 的一个专门版本，它忽略了 Symbol.toStringTag 值
 * @param value
 * @returns
 */
function getRawTag(value: any) {
  const isOwn = hasOwnProperty.call(value, symToStringTag),
    tag = value[symToStringTag];
  let unmasked = false;
  try {
    value[symToStringTag] = undefined;
    unmasked = true;
  } catch (e) {}

  const result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Object.prototype.toString
 * @param value
 * @returns
 */
function objectToString(value: any) {
  return nativeObjectToString.call(value);
}

/**
 * 针对有缺陷的环境下，getTag 基本实现
 * @param value
 * @returns
 */
function baseGetTag(value: any) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

/**
 * 检查 value 是否类似对象
 * @param value
 * @returns
 */
function isObjectLike(value: any) {
  return value != null && typeof value == 'object';
}

/**
 * 检查 value 是否对象
 * @param value
 * @returns
 */
function isObject(value?: any): value is Object {
  const type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * 检查 value 是否 Symbol
 * @param value
 * @returns
 */
function isSymbol(value: any) {
  return typeof value == 'symbol' || (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/**
 * 获取 string 的最后一个非空字符索引
 * @param string
 * @returns
 */
function trimmedEndIndex(string: string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

/**
 * trim 的基础实现
 * @param string
 * @returns
 */
function baseTrim(string: string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '') : string;
}

/**
 * 将 value 转换为 number
 * @param value
 * @returns
 */
export function toNumber(value: any): number {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    const other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? other + '' : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  const isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value)
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : reIsBadHex.test(value)
    ? NAN
    : +value;
}

/**
 * 创建一个防抖函数
 *  - 该函数会延迟调用 func，直到自上次调用后经过 wait ms
 *  - cancel => 取消调用
 *  - flush  => 立即调用
 *
 * 注意：
 *  - 如果 lead 和 tracing 选项为 true，则只有在 wait 超时期间多次调用防抖函数时，才会在超时的后缘调用 func
 *  - 如果 wait 为 0， leading 为 false ，则 func 调用将推迟到下一个刻度，类似于 setTimeout(?, 0)
 *
 * @param {Function} func 将要防抖的源函数
 * @param {number} [wait=0] 延迟的毫秒数
 * @param {Object} [options={}] 配置对象
 * @param {boolean} [options.leading=false] 指定在超时的前沿调用
 * @param {number} [options.maxWait] 调用 func 之前允许延迟的最长时间
 * @param {boolean} [options.trailing=true] 指定在超时后沿调用
 * @returns {Function} 返回防抖函数
 * @example
 *  - 适用于如窗口变换(resize)事件的回调
 */
export function debounce<T extends (...args: any) => any>(
  func: T,
  wait?: number,
  options?: DebounceOptions
): DebouncedFunc<T> {
  let lastArgs: any,
    lastThis: any,
    maxWait: number = 0,
    result: DebouncedFunc<T>,
    timerId: number | undefined,
    lastCallTime: number | undefined,
    lastInvokeTime = 0,
    leading = false,
    maxing = false,
    trailing = true;

  if (typeof func != 'function') {
    throw new TypeError('Expected a function');
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? Math.max(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  /**
   * 调用 func
   * @param time
   * @returns
   */
  function invokeFunc(time: number) {
    const args = lastArgs,
      thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time: number) {
    // 重置 maxWait 计时器.
    lastInvokeTime = time;
    // 启动后缘计时器
    timerId = setTimeout(timerExpired, wait);
    // 调用前缘
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - (lastCallTime as number),
      timeSinceLastInvoke = time - lastInvokeTime,
      timeWaiting = (wait as number) - timeSinceLastCall;

    return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - (lastCallTime as number),
      timeSinceLastInvoke = time - lastInvokeTime;

    // 要么这是第一次调用
    // 要么执行已经停止，我们处于后缘
    // 要么系统时间已经倒退了，我们将其视为后缘
    // 要么我们已经达到了 maxWait 限制
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= (wait as number) ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // 重置计时器
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timerId = undefined;

    // 只有当我们有 lastArgs 时才调用，这意味着 func 至少被取消了一次
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(this: any) {
    const time = Date.now(),
      isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // 在频繁循环中处理调用
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced as DebouncedFunc<T>;
}

/**
 * 创建一个节流函数
 *  - 该函数每 wait 毫秒最多只调用一次 func
 *  - cancel => 取消调用
 *  - flush  => 立即调用
 *
 * @param {Function} func 将要节流的原函数
 * @param {number} [wait=0] 节流毫秒数
 * @param {Object} [options={}] 配置对象
 * @param {boolean} [options.leading=true] 指定在超时的前沿调用
 * @param {boolean} [options.trailing=true] 指定在超时后沿调用
 * @returns {Function} 返回一个节流函数
 * @example
 *  - 适用于如滚动(scroll)事件的回调
 */
export function throttle<T extends (...args: any) => any>(func: T, wait?: number, options?: ThrottleOptions) {
  let leading = true,
    trailing = true;

  if (typeof func != 'function') {
    throw new TypeError('Expected a function');
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    leading: leading,
    maxWait: wait,
    trailing: trailing
  });
}
