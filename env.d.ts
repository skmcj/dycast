/// <reference types="vite/client" />

/** 消息配置 */
interface MessageOptions {
  /** 消息类型 */
  type?: 'info' | 'success' | 'warning' | 'error' | 'help' | 'none';
  /** 消息内容 */
  content: string;
  /** 关闭延时，0为不自动关闭 */
  duration?: number;
  /** 是否可关闭 */
  closeable?: boolean;
  pos?: 'left' | 'center' | 'right';
  /** 自定义图标 */
  icon?: string;
  /** 自定义类 */
  class?: string;
  /** 关闭回调 */
  onClose?: () => void;
}
/** 项目使用的全局消息组件 */
interface SkMessageObject {
  success: (options: MessageOptions | string) => void;
  error: (options: MessageOptions | string) => void;
  warning: (options: MessageOptions | string) => void;
  info: (options: MessageOptions | string) => void;
  default: (options: MessageOptions | string) => void;
  help: (options: MessageOptions | string) => void;
  destroy: () => void;
}

declare const SkMessage: SkMessageObject;
