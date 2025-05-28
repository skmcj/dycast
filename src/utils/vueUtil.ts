import type { ComponentPublicInstance, MaybeRef, MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';

export type VueInstance = ComponentPublicInstance;
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>;
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeRefOrGetter<T>;
export type MaybeElement = HTMLElement | SVGElement | VueInstance | undefined | null;

export type UnRefElementReturn<T extends MaybeElement = MaybeElement> = T extends VueInstance
  ? Exclude<MaybeElement, VueInstance>
  : T | undefined;

/**
 * 获取元素或 Vue 组件实例 ref 的 dom 元素
 * @param elRef
 */
export function unrefElement<T extends MaybeElement>(elRef: MaybeComputedElementRef<T>): UnRefElementReturn<T> {
  const plain = toValue(elRef);
  return (plain as VueInstance)?.$el ?? plain;
}
