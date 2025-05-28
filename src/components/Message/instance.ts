import { shallowReactive } from 'vue';
import type { ComponentInternalInstance, VNode } from 'vue';
// 组件返回处理器
export interface SkMessageHandler {
  /**
   * 关闭通知
   */
  close: () => void;
}

export const skMessagePos = ['center', 'left', 'right'] as const;
export type SkMessagePos = (typeof skMessagePos)[number];
// 消息类型集
export const skMessageTypes = ['success', 'warning', 'info', 'error', 'help', 'default'] as const;
// 消息类型
export type SKMessageTypes = (typeof skMessageTypes)[number];
// 组件属性
export interface SkMessageProps {
  id: string;
  // 类型
  type?: SKMessageTypes;
  // 信息体
  message?: string | VNode | (() => VNode);
  // 关闭延时
  duration?: number;
  // Message 距离窗口顶部的偏移量
  offset?: number;
  // 自定义图标
  icon?: string;
  zIndex?: number;
  // 自定义类
  customClass?: string;
  // 是否可手动关闭
  closeable?: boolean;
  // 位置
  pos?: SkMessagePos;
  // 监听关闭
  onClose?: () => void;
}

export type SkMessageOptions = Partial<
  Omit<SkMessageProps, 'id'> & {
    appendTo: HTMLElement;
  }
>;

export interface SkMessageContext {
  id: string;
  vnode: VNode;
  handler: SkMessageHandler;
  vm: ComponentInternalInstance;
  props: SkMessageProps;
}

export const instances: SkMessageContext[] = shallowReactive([]);
// 根据ID获取组件
export const getInstance = (id: string) => {
  const idx = instances.findIndex(instance => instance.id === id);
  const current = instances[idx];
  let prev: SkMessageContext | undefined;
  if (idx > 0) {
    prev = instances[idx - 1];
  }
  // 返回当前组件与前一个组件
  return { current, prev };
};
// 获取ID的上一个组件底部纵坐标
export const getLastOffset = (id: string): number => {
  const { prev } = getInstance(id);
  if (!prev) return 0;
  return prev.vm.exposed!.bottom.value;
};
// 获取组件偏移量
export const getOffsetOrSpace = (id: string, offset: number) => {
  const idx = instances.findIndex(instance => instance.id === id);
  return idx > 0 ? 16 : offset;
};
