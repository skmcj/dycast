import { unrefElement } from '@/utils/vueUtil';
import { computed, getCurrentScope, onScopeDispose, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { MaybeComputedElementRef, MaybeElement } from '@/utils/vueUtil';

/** @vue/use useResizeObserver */

/**
 * 如果有活跃的 effect 作用域，则调用 onScopeDispose
 *  - 即尝试取消当前作用域内的监听(副作用函数)
 * @param fn
 */
export function tryOnScopeDispose(fn: () => void) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}

export interface UseResizeObserverOptions {
  /*
   * 指定一个自定义的 window 实例，例如使用 iframe 或在测试环境中
   */
  window?: Window;
  /**
   * 观察者观察的框模型
   * @default 'content-box'
   */
  box?: ResizeObserverBoxOptions;
}

const defaultWindow = window;

export const useResizeObserver = function (
  target: MaybeComputedElementRef | MaybeComputedElementRef[] | MaybeRefOrGetter<MaybeElement[]>,
  callback: ResizeObserverCallback,
  options: UseResizeObserverOptions = {}
) {
  const { window = defaultWindow, ...observerOptions } = options;
  let observer: ResizeObserver | undefined;

  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };

  const targets = computed(() => {
    const _targets = toValue(target);
    return Array.isArray(_targets) ? _targets.map(el => unrefElement(el)) : [unrefElement(_targets)];
  });

  const stopWatch = watch(
    targets,
    els => {
      cleanup();
      observer = new ResizeObserver(callback);
      for (const _el of els) {
        if (_el) observer!.observe(_el, observerOptions);
      }
    },
    { immediate: true, flush: 'post' }
  );

  const stop = () => {
    cleanup();
    stopWatch();
  };

  tryOnScopeDispose(stop);

  return { stop };
};
