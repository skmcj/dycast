/**
 * 雪花算法
 */
export class SnowflakeID {
  private static readonly EPOCH = 1000000000000; // 自定义起始时间：2001-09-09 01:46:40 GMT
  private static readonly MACHINE_ID_BITS = 10; // 机器ID占用的位数
  private static readonly SEQUENCE_BITS = 12; // 序列号占用的位数

  private static readonly TIMESTAMP_SHIFT = BigInt(SnowflakeID.MACHINE_ID_BITS + SnowflakeID.SEQUENCE_BITS);
  private static readonly MACHINE_ID_SHIFT = BigInt(SnowflakeID.SEQUENCE_BITS);

  private static readonly MAX_MACHINE_ID = (1 << SnowflakeID.MACHINE_ID_BITS) - 1; // 最大机器ID
  private static readonly MAX_SEQUENCE = (1 << SnowflakeID.SEQUENCE_BITS) - 1; // 最大序列号

  private machineId: number; // 机器ID
  private sequence = 0; // 序列号
  private lastTimestamp = -1; // 上次生成ID的时间戳

  constructor(machineId: number) {
    if (machineId < 0 || machineId > SnowflakeID.MAX_MACHINE_ID) {
      throw new Error(`Machine ID must be between 0 and ${SnowflakeID.MAX_MACHINE_ID}`);
    }
    this.machineId = machineId;
  }

  /**
   * 获取一个ID
   * @returns
   */
  public nextId(): string {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate ID.');
    }

    // 缓存时间戳差值
    const timestampDiff = timestamp - SnowflakeID.EPOCH;

    if (timestamp === this.lastTimestamp) {
      // 同一毫秒内生成多个ID
      this.sequence = (this.sequence + 1) & SnowflakeID.MAX_SEQUENCE;
      if (this.sequence === 0) {
        // 序列号用尽，等待下一毫秒
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      // 新的一毫秒，重置序列号
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // 生成ID
    const id =
      (BigInt(timestampDiff) << SnowflakeID.TIMESTAMP_SHIFT) |
      (BigInt(this.machineId) << SnowflakeID.MACHINE_ID_SHIFT) |
      BigInt(this.sequence);

    return id.toString();
  }

  /**
   * 批量生成ID
   * @param count 生成数量
   */
  public nextIds(count: number): string[] {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(this.nextId());
    }
    return ids;
  }

  /**
   * 获取当前时间戳
   * @returns
   */
  private currentTimestamp(): number {
    return Date.now();
  }

  /**
   * 等待获取下一个毫秒
   * @param lastTimestamp
   * @returns
   */
  private waitNextMillis(lastTimestamp: number): number {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }
}

const ID_GENERATE = new SnowflakeID(37);

/**
 * 获取一个ID
 * @returns
 */
export const getId = function () {
  return ID_GENERATE.nextId();
};

/**
 * 获取 count 个 ID
 * @param count
 */
export const getIds = function (count: number) {
  return ID_GENERATE.nextIds(count);
};

/**
 * 测试性能
 */
// (function test() {
//   const snowflake = new SnowflakeID(1); // 机器ID为1

//   const ids: string[] = [];

//   // 测试生成10万个ID的性能
//   const testPerformance = (count: number) => {
//     const startTime = Date.now();

//     for (let i = 0; i < count; i++) {
//       snowflake.nextId();
//     }

//     const endTime = Date.now();
//     const totalTime = endTime - startTime;
//     const idsPerSecond = (count / totalTime) * 1000;

//     console.log(`生成 ${count} 个 ID 用了 ${totalTime} ms`);
//     console.log(`性能: 每秒约可生成 ${idsPerSecond.toFixed(2)} 个 ID`);
//   };

//   // 测试生成10万个ID的性能
//   testPerformance(100000);
//   // console.log(ids[0], ids[ids.length - 1]);
// })();
