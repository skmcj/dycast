import { Emitter, type EventMap } from './emitter';

interface RelayCastEvent extends EventMap {
  open: (ev: Event) => void;
  close: (code?: number, msg?: string) => void;
  error: (ev: Error) => void;
  message: (data: any) => void;
}

/**
 * 弹幕转发器
 *  - 简单封装一下，有问题再优化
 */
export class RelayCast {
  private url: string;

  private ws: WebSocket | undefined;

  private emitter: Emitter<RelayCastEvent>;

  constructor(url: string) {
    this.url = url;
    this.emitter = new Emitter();
  }

  /**
   * 监听
   * @param event
   * @param listener
   */
  public on<K extends keyof RelayCastEvent>(event: K, listener: RelayCastEvent[K]) {
    this.emitter.on(event, listener);
  }

  /**
   * 取消监听
   * @param event
   * @param listener
   */
  public off<K extends keyof RelayCastEvent>(event: K, listener: RelayCastEvent[K]) {
    this.emitter.off(event, listener);
  }

  /**
   * 一次性监听
   *  - 如监听打开关闭
   * @param event
   * @param listener
   */
  public once<K extends keyof RelayCastEvent>(event: K, listener: RelayCastEvent[K]) {
    this.emitter.once(event, listener);
  }

  /**
   * 连接
   */
  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.addEventListener('open', ev => {
        this.emitter.emit('open', ev);
      });
      this.ws.addEventListener('close', ev => {
        this.emitter.emit('close', ev.code, ev.type);
      });
      this.ws.addEventListener('error', ev => {
        this.emitter.emit('error', Error(ev.type));
      });
      this.ws.addEventListener('message', ev => {
        this.emitter.emit('message', ev.data);
      });
    } catch (err) {
      this.emitter.emit('error', Error('转发服务器连接出错'));
      this.emitter.emit('close', 4002);
    }
  }

  /**
   * 是否连接
   */
  isConnected() {
    if (this.ws) return this.ws.readyState === WebSocket.OPEN;
    else return false;
  }

  /**
   * 发送消息
   * @param data
   */
  send(data: string | ArrayBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(data);
  }

  /**
   * 关闭转发
   * @param code
   * @param msg
   */
  close(code: number = 1000, msg: string = 'close replay') {
    if (this.ws) {
      this.ws.close(code, msg);
      this.ws = void 0;
    }
  }
}
