export type EventMap = Record<string, (...args: any[]) => void>;

export class Emitter<T extends EventMap> {
  // 处理函数
  private listeners: {
    [K in keyof T]?: Set<T[K]>;
  } = {};

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  on<K extends keyof T>(event: K, handler: T[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(handler);
  }

  /**
   * 取消订阅
   * @param event 事件名称
   * @param handler 要移除的事件处理函数
   */
  off<K extends keyof T>(event: K, handler: T[K]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        delete this.listeners[event];
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给处理函数的参数
   */
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    const handlers = this.listeners[event];
    if (handlers) {
      // 创建副本防止在回调中添加/删除处理器影响当前循环
      const handlersCopy = new Set(handlers);
      handlersCopy.forEach(handler => {
        handler(...args);
      });
    }
  }

  /**
   * 一次性订阅
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  once<K extends keyof T>(event: K, handler: T[K]): void {
    const onceHandler = (...args: Parameters<T[K]>) => {
      this.off(event, onceHandler as T[K]);
      handler(...args);
    };
    this.on(event, onceHandler as T[K]);
  }

  /**
   * 获取指定事件的订阅数量
   * @param event 事件名称
   */
  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners[event]?.size || 0;
  }

  /**
   * 清除所有事件监听器或指定事件的所有监听器
   * @param event 可选，要清除的事件名称
   */
  clear<K extends keyof T>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}
