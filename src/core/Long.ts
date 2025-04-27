/**
 * @file
 * 魔改缩小的 long.js
 */

/** WebAssembly 优化，以进行原生 i64 乘法和除法 */
let wasm: any = null;
try {
  wasm = new WebAssembly.Instance(
    new WebAssembly.Module(
      new Uint8Array([
        // \0asm
        0, 97, 115, 109,
        // version 1
        1, 0, 0, 0,

        // section "type"
        1, 13, 2,
        // 0, () => i32
        96, 0, 1, 127,
        // 1, (i32, i32, i32, i32) => i32
        96, 4, 127, 127, 127, 127, 1, 127,

        // section "function"
        3, 7, 6,
        // 0, type 0
        0,
        // 1, type 1
        1,
        // 2, type 1
        1,
        // 3, type 1
        1,
        // 4, type 1
        1,
        // 5, type 1
        1,

        // section "global"
        6, 6, 1,
        // 0, "high", mutable i32
        127, 1, 65, 0, 11,

        // section "export"
        7, 50, 6,
        // 0, "mul"
        3, 109, 117, 108, 0, 1,
        // 1, "div_s"
        5, 100, 105, 118, 95, 115, 0, 2,
        // 2, "div_u"
        5, 100, 105, 118, 95, 117, 0, 3,
        // 3, "rem_s"
        5, 114, 101, 109, 95, 115, 0, 4,
        // 4, "rem_u"
        5, 114, 101, 109, 95, 117, 0, 5,
        // 5, "get_high"
        8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0,

        // section "code"
        10, 191, 1, 6,
        // 0, "get_high"
        4, 0, 35, 0, 11,
        // 1, "mul"
        36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4,
        66, 32, 135, 167, 36, 0, 32, 4, 167, 11,
        // 2, "div_s"
        36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4,
        66, 32, 135, 167, 36, 0, 32, 4, 167, 11,
        // 3, "div_u"
        36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4,
        66, 32, 135, 167, 36, 0, 32, 4, 167, 11,
        // 4, "rem_s"
        36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4,
        66, 32, 135, 167, 36, 0, 32, 4, 167, 11,
        // 5, "rem_u"
        36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4,
        66, 32, 135, 167, 36, 0, 32, 4, 167, 11
      ])
    ),
    {}
  ).exports;
} catch {
  // 不支持 wasm
}

/**
 * integer 缓存
 * @type {!Object}
 * @inner
 */
const INT_CACHE: any = {};

/**
 * unsigned integer 缓存
 * @type {!Object}
 * @inner
 */
const UINT_CACHE: any = {};

/**
 * Long
 */
export class Long {
  low: number;
  high: number;
  unsigned: boolean;
  private __isLong__: boolean;

  constructor(low: number, high: number, unsigned?: boolean) {
    this.low = low | 0;
    this.high = high | 0;
    this.unsigned = !!unsigned;
    this.__isLong__ = true;
  }

  /**
   * 是否零
   * @returns
   */
  isZero() {
    return this.high === 0 && this.low === 0;
  }

  /**
   * 是否奇数
   * @returns
   */
  isOdd() {
    return (this.low & 1) === 1;
  }

  /**
   * 是否负数
   * @returns
   */
  isNegative() {
    return !this.unsigned && this.high < 0;
  }

  /**
   * 非运算
   * @returns
   */
  neg() {
    if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
    return this.not().add(ONE);
  }

  /**
   * 按位非
   * @returns
   */
  not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
  }

  /**
   * 比较
   * @param other 0|相等;1|大于;-1|小于
   * @returns
   */
  comp(other: Long | number | string) {
    if (!isLong(other)) other = fromValue(other);
    if (this.eq(other)) return 0;
    const thisNeg = this.isNegative(),
      otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1;

    if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;

    return other.high >>> 0 > this.high >>> 0 || (other.high === this.high && other.low >>> 0 > this.low >>> 0)
      ? -1
      : 1;
  }

  /**
   * 是否相等
   * @param other
   * @returns
   */
  eq(other: Long | number | string) {
    if (!isLong(other)) other = fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  }

  /**
   * 小于
   * @param other
   * @returns
   */
  lt(other: Long | number | string) {
    return this.comp(other) < 0;
  }

  /**
   * 大于
   * @param other
   * @returns
   */
  gt(other: Long | number | string) {
    return this.comp(other) > 0;
  }

  /**
   * 大于等于
   * @param other
   * @returns
   */
  gte(other: Long | number | string) {
    return this.comp(other) >= 0;
  }

  /**
   * 左移 <<
   * @param numBits
   * @returns
   */
  shl(numBits: Long | number) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    else if (numBits < 32)
      return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
    else return fromBits(0, this.low << (numBits - 32), this.unsigned);
  }

  /**
   * 右移 >>
   * @param numBits
   * @returns
   */
  shr(numBits: Long | number): Long {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    else if (numBits < 32)
      return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
    else return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
  }

  /**
   * 无符号右移
   * @param numBits
   * @returns
   */
  shru(numBits: Long | number) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits < 32)
      return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >>> numBits, this.unsigned);
    if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
    return fromBits(this.high >>> (numBits - 32), 0, this.unsigned);
  }

  /**
   * 加
   * @param addend
   * @returns
   */
  add(addend: Long | string | number) {
    if (!isLong(addend)) addend = fromValue(addend);

    const a48 = this.high >>> 16;
    const a32 = this.high & 0xffff;
    const a16 = this.low >>> 16;
    const a00 = this.low & 0xffff;

    const b48 = addend.high >>> 16;
    const b32 = addend.high & 0xffff;
    const b16 = addend.low >>> 16;
    const b00 = addend.low & 0xffff;

    let c48 = 0,
      c32 = 0,
      c16 = 0,
      c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xffff;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xffff;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c48 += a48 + b48;
    c48 &= 0xffff;
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
  }

  /**
   * 减
   * @param subtrahend
   * @returns
   */
  sub(subtrahend: Long | string | number) {
    if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
  }

  /**
   * 乘
   * @param multiplier
   * @returns
   */
  mul(multiplier: Long | number | string): Long {
    if (this.isZero()) return this;
    if (!isLong(multiplier)) multiplier = fromValue(multiplier);
    // 支持 wasm
    if (wasm) {
      const low = wasm['mul'](this.low, this.high, multiplier.low, multiplier.high);
      return fromBits(low, wasm['get_high'](), this.unsigned);
    }

    if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
    if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;

    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
      else return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg();

    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
      return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

    const a48 = this.high >>> 16;
    const a32 = this.high & 0xffff;
    const a16 = this.low >>> 16;
    const a00 = this.low & 0xffff;

    const b48 = multiplier.high >>> 16;
    const b32 = multiplier.high & 0xffff;
    const b16 = multiplier.low >>> 16;
    const b00 = multiplier.low & 0xffff;

    let c48 = 0,
      c32 = 0,
      c16 = 0,
      c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xffff;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xffff;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xffff;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xffff;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xffff;
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
  }

  /**
   * 除
   * @param divisor
   * @returns
   */
  div(divisor: Long | number | string): Long {
    if (!isLong(divisor)) divisor = fromValue(divisor);
    if (divisor.isZero()) throw Error('division by zero');

    if (wasm) {
      if (!this.unsigned && this.high === -0x80000000 && divisor.low === -1 && divisor.high === -1) {
        return this;
      }
      const low = (this.unsigned ? wasm['div_u'] : wasm['div_s'])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm['get_high'](), this.unsigned);
    }

    if (this.isZero()) return this.unsigned ? UZERO : ZERO;
    let approx, rem, res;
    if (!this.unsigned) {
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE; // -MIN_VALUE == MIN_VALUE
        else if (divisor.eq(MIN_VALUE)) return ONE;
        else {
          // 由于 |other| >= 2, 故 |this/other| < |MIN_VALUE|
          const halfThis = this.shr(1);
          approx = halfThis.div(divisor).shl(1);
          if (approx.eq(ZERO)) {
            return divisor.isNegative() ? ONE : NEG_ONE;
          } else {
            rem = this.sub(divisor.mul(approx));
            res = approx.add(rem.div(divisor));
            return res;
          }
        }
      } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
      if (this.isNegative()) {
        if (divisor.isNegative()) return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
      } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
      res = ZERO;
    } else {
      if (!divisor.unsigned) divisor = divisor.toUnsigned();
      if (divisor.gt(this)) return UZERO;
      if (divisor.gt(this.shru(1))) return UONE;
      res = UZERO;
    }

    // 重复以下步骤，直到余数小于other：从下面的*中找到一个近似余数/other*的浮点，将其添加到结果中，然后从余数中减去它。近似值小于或等于实际值至关重要，这样余数就永远不会变为负值。
    rem = this;
    while (rem.gte(divisor)) {
      // 近似划分的结果，这可能比实际值稍大或稍小
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

      // 调整近似结果，将其更改为第48位数字或最小的非小数位数，以较大者为准
      let log2 = Math.ceil(Math.log(approx) / Math.LN2),
        delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
        // 通过在第48位数字中更改近似结果来调整近似结果，或者减小近似值，直到它小于余数
        // 请注意，如果太大，会溢出并为负值，最小的非小数位数，以较大者为准
        approxRes = fromNumber(approx),
        approxRem = approxRes.mul(divisor);
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta;
        approxRes = fromNumber(approx, this.unsigned);
        approxRem = approxRes.mul(divisor);
      }

      // 答案不可能是零，零会导致无限递归
      if (approxRes.isZero()) approxRes = ONE;

      res = res.add(approxRes);
      rem = rem.sub(approxRem);
    }
    return res;
  }
  /**
   * 将 Long 转换为指定进制的字符串
   * @param radix
   * @returns
   */
  toString(radix?: number): string {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    if (this.isZero()) return '0';
    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.eq(MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        const radixLong = fromNumber(radix),
          div = this.div(radixLong),
          rem1 = div.mul(radixLong).sub(this);
        return div.toString(radix) + rem1.toInt().toString(radix);
      } else return '-' + this.neg().toString(radix);
    }

    // 每次在循环中执行 6 数字，减少算力消耗
    const radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned);
    let rem: Long;
    rem = this;
    let result = '';
    while (true) {
      const remDiv = rem.div(radixToPower);
      let intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
        digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;
      else {
        while (digits.length < 6) digits = '0' + digits;
        result = '' + digits + result;
      }
    }
  }

  /**
   * 将 Long 转换为 number
   * @returns
   */
  toNumber() {
    if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  }

  /**
   * 将 Long 转换为 整数
   * @returns
   */
  toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  }

  /**
   * 将 Long 转换为 无符号 Long
   * @returns
   */
  toUnsigned() {
    if (this.unsigned) return this;
    return fromBits(this.low, this.high, true);
  }

  static fromString = fromString;

  static fromValue = fromValue;

  static fromNumber = fromNumber;

  static fromInt = fromInt;
}

const UZERO = fromInt(0, true);

const ZERO = fromInt(0);

const ONE = fromInt(1);

const UONE = fromInt(1, true);

const NEG_ONE = fromInt(-1);

const TWO_PWR_16_DBL = 1 << 16;

const TWO_PWR_24_DBL = 1 << 24;

const TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);

const TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

const TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

const TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

const MAX_UNSIGNED_VALUE = fromBits(0xffffffff | 0, 0xffffffff | 0, true);

const MAX_VALUE = fromBits(0xffffffff | 0, 0x7fffffff | 0, false);

const MIN_VALUE = fromBits(0, 0x80000000 | 0, false);

const pow_dbl = Math.pow;

/**
 * 通过每一位值定义 Long
 * @param lowBits
 * @param highBits
 * @param unsigned
 * @returns
 */
function fromBits(lowBits: number, highBits: number, unsigned?: boolean): Long {
  return new Long(lowBits, highBits, unsigned);
}

/**
 * 由 number 值转换为 Long
 * @param value
 * @param unsigned
 * @returns
 */
function fromInt(value: number, unsigned?: boolean): Long {
  let obj, cachedObj, cache;
  if (unsigned) {
    value >>>= 0;
    if ((cache = 0 <= value && value < 256)) {
      cachedObj = UINT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = fromBits(value, 0, true);
    if (cache) UINT_CACHE[value] = obj;
    return obj;
  } else {
    value |= 0;
    if ((cache = -128 <= value && value < 128)) {
      cachedObj = INT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = fromBits(value, value < 0 ? -1 : 0, false);
    if (cache) INT_CACHE[value] = obj;
    return obj;
  }
}

/**
 * @param str
 * @param unsigned
 * @param radix
 * @returns
 */
function fromString(str: string, unsigned?: boolean | number, radix?: number): Long {
  if (str.length === 0) throw Error('empty string');
  if (typeof unsigned === 'number') {
    // For goog.math.long compatibility
    radix = unsigned;
    unsigned = false;
  } else {
    unsigned = !!unsigned;
  }
  if (str === 'NaN' || str === 'Infinity' || str === '+Infinity' || str === '-Infinity') return unsigned ? UZERO : ZERO;
  radix = radix || 10;
  if (radix < 2 || 36 < radix) throw RangeError('radix');

  let p;
  if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen');
  else if (p === 0) {
    return fromString(str.substring(1), unsigned, radix).neg();
  }

  // Do several (8) digits each time through the loop, so as to
  // minimize the calls to the very expensive emulated div.
  const radixToPower = fromNumber(pow_dbl(radix, 8));

  let result = ZERO;
  for (let i = 0; i < str.length; i += 8) {
    const size = Math.min(8, str.length - i),
      value = parseInt(str.substring(i, i + size), radix);
    if (size < 8) {
      const power = fromNumber(pow_dbl(radix, size));
      result = result.mul(power).add(fromNumber(value));
    } else {
      result = result.mul(radixToPower);
      result = result.add(fromNumber(value));
    }
  }
  result.unsigned = unsigned;
  return result;
}

/**
 * @param value
 * @param unsigned
 * @returns
 */
function fromNumber(value: number, unsigned?: boolean): Long {
  if (isNaN(value)) return unsigned ? UZERO : ZERO;
  if (unsigned) {
    if (value < 0) return UZERO;
    if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
  } else {
    if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
    if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
  }
  if (value < 0) return fromNumber(-value, unsigned).neg();
  return fromBits(value % TWO_PWR_32_DBL | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
}

/**
 * 通过各种值定义
 * @param val
 * @param unsigned
 * @returns
 */
function fromValue(val: Long | number | string, unsigned?: boolean) {
  if (typeof val === 'number') return fromNumber(val, unsigned);
  if (typeof val === 'string') return fromString(val, unsigned);
  // Throws for non-objects, converts non-instanceof Long:
  return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
}

/**
 * @param obj Object
 * @returns
 * @inner
 */
function isLong(obj: any): obj is Long {
  return (obj && obj['__isLong__']) === true;
}
