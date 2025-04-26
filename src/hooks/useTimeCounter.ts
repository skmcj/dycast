import { ref } from 'vue';

interface TimeCounterOptions {
  /**
   * 初始时间(s)
   */
  initValue?: number;
  /**
   * 计时模式
   *  - 0 => 正计时
   *  - 1 => 倒计时
   */
  mode?: 0 | 1;
  /**
   * 时间格式字符串
   *  - h => 时 | m => 分 | s => 秒
   *  - 默认：hh:mm:ss
   */
  fmt?: string;
}

const S_UNIT = 1000;

/**
 * 将秒数转换为格式字符串
 * @param seconds
 * @param fmt
 * @returns
 */
function convertTime(seconds: number, fmt: string = 'hh:mm:ss') {
  const map: Record<string, number> = {
    'h+': Math.floor(seconds / 3600),
    'm+': Math.floor((seconds % 3600) / 60),
    's+': seconds % 60
  };
  for (const item in map) {
    const reg = new RegExp(`(${item})`);
    if (reg.test(fmt)) {
      const t = reg.exec(fmt)?.[1];
      t && (fmt = fmt.replace(t, t.length === 1 ? `${map[item]}` : `00${map[item]}`.slice(t.length * -1)));
    }
  }
  return fmt;
}

const useTimeCounter = function (opt: TimeCounterOptions = {}) {
  const { initValue = 0, mode = 0, fmt = 'hh:mm:ss' } = opt;

  let seconds = initValue;
  let timer: number | null = null;
  const text = ref(convertTime(initValue, fmt));

  // 计时
  const turn = (mode: 0 | 1 = 0) => {
    if (mode === 1) {
      // 倒计时
      seconds > 0 && (seconds = seconds - 1);
    } else {
      // 正计时
      seconds = seconds + 1;
    }
  };

  // 刷新文本
  const refreshText = () => {
    text.value = convertTime(seconds, fmt);
  };
  /**
   * 开始计时
   */
  const start = () => {
    timer = setInterval(() => {
      // 每秒计时一次
      turn(mode);
      refreshText();
    }, S_UNIT);
  };

  /**
   * 停止计时
   */
  const stop = () => {
    if (timer) clearInterval(timer);
  };

  /**
   * 重置计时
   */
  const reset = () => {
    if (timer) clearInterval(timer);
    seconds = initValue;
    refreshText();
  };

  return {
    text,
    start,
    stop,
    reset
  };
};

export default useTimeCounter;
