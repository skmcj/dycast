import { createVNode, isVNode, render } from 'vue';
import { instances, skMessageTypes } from './instance';
import MessageConstructor from './message.vue';
import type { AppContext } from 'vue';
import type { SkMessageContext, SkMessageHandler, SkMessageOptions, SkMessageProps, SKMessageTypes } from './instance';
import { isFunction, isString } from '@/utils/typeUtil';

export type SkMessageParams = SkMessageOptions | SkMessageOptions['message'];

export type SkMessageFn = {
  (options?: SkMessageParams, appContext?: null | AppContext): SkMessageHandler;
  closeAll(type?: SKMessageTypes): void;
};

export type SkMessageParamWithType = Omit<SkMessageOptions, 'type'> | SkMessageOptions['message'];

export type MessageTypedFn = (options?: SkMessageParamWithType, appContext?: null | AppContext) => SkMessageHandler;

export type SkMessage = SkMessageFn & {
  info: MessageTypedFn;
  success: MessageTypedFn;
  warning: MessageTypedFn;
  error: MessageTypedFn;
  help: MessageTypedFn;
  default: MessageTypedFn;
};

export type SkMessageNormalOptions = Omit<SkMessageProps, 'id'> & {
  appendTo: HTMLElement;
};

// 计数
let seed = 1;

// 创建消息
const createMessage = function ({ appendTo, ...options }: SkMessageNormalOptions, context?: AppContext | null) {
  const id = `message_${seed++}`;
  // 用户的关闭回调
  const handleUserClose = options.onClose;
  // 渲染容器
  const container = document.createElement('div');
  // 组件属性
  const props = {
    ...options,
    id,
    onClose: () => {
      handleUserClose?.();
      closeMessage(instance);
    },
    onDestroy: () => {
      render(null, container);
    }
  };
  // vue 节点 VNode
  const vnode = createVNode(
    MessageConstructor,
    props,
    isFunction(props.message) || isVNode(props.message)
      ? {
          default: isFunction(props.message) ? props.message : () => props.message
        }
      : null
  );
  // 节点上下文
  vnode.appContext = context || message._context;
  // 开始渲染
  render(vnode, container);
  // 插入页面
  appendTo.appendChild(container.firstElementChild!);
  // 虚拟节点
  const vm = vnode.component!;
  // 处理函数
  const handler: SkMessageHandler = {
    // 关闭
    close: () => {
      vm.exposed!.close();
    }
  };
  // 实例对象
  const instance: SkMessageContext = {
    id,
    vnode,
    vm,
    handler,
    props: (vnode.component as any).props
  };

  return instance;
};

// 关闭消息
const closeMessage = function (instance: SkMessageContext) {
  // 获取当前实例索引
  const idx = instances.indexOf(instance);
  if (idx === -1) return;
  // 从集合中移除
  instances.splice(idx, 1);
  // 获取实例处理对象
  const { handler } = instance;
  // 调用关闭函数
  handler.close();
};
// 关闭索引同类组件
const closeAll = function (type?: SKMessageTypes) {
  const instancesToClose = [...instances];

  for (const instance of instancesToClose) {
    if (!type || type === instance.props.type) {
      instance.handler.close();
    }
  }
};

// 规范配置
const normalizeOptions = function (params: SkMessageParams) {
  const options: SkMessageOptions =
    !params || isString(params) || isVNode(params) || isFunction(params) ? { message: params } : params;

  const normalized = { ...options };
  if (!normalized.appendTo) {
    normalized.appendTo = document.body;
  } else if (isString(normalized.appendTo)) {
    const appendTo = document.querySelector<HTMLElement>(normalized.appendTo);
    if (!appendTo) {
      normalized.appendTo = document.body;
    } else {
      normalized.appendTo = appendTo;
    }
  }
  return normalized as SkMessageNormalOptions;
};
// 主接口
const message: SkMessageFn & Partial<SkMessage> & { _context: AppContext | null } = function (
  options = {},
  context = null
) {
  // 规范话配置
  const normalized = normalizeOptions(options);
  // 创建实例
  const instance = createMessage(normalized, context);
  // 加入集合
  instances.push(instance);
  // 返回处理函数
  return instance.handler;
};
// 绑定类型函数
skMessageTypes.forEach(type => {
  message[type] = (options = {}, appContext) => {
    const normalized = normalizeOptions(options);
    return message({ ...normalized, type }, appContext);
  };
});

message.closeAll = closeAll;
message._context = null;

/**
 * 消息组件
 */
export default message as SkMessage;
