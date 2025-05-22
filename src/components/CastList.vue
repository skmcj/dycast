<template>
  <div
    :class="{
      'cast-list': true,
      'pos-center': pos === 'center',
      'pos-left': pos === 'left',
      'no-prefix': noPrefix,
      'theme-light': theme === 'light',
      'theme-dark': theme === 'dark'
    }">
    <div class="cast-list-header">
      <!-- MAC 前缀 -->
      <div class="mac-prefix">
        <div class="cir red"></div>
        <div class="cir yellow"></div>
        <div class="cir green"></div>
      </div>
      <!-- 标题 -->
      <div class="title">
        <label>弹幕信息</label>
      </div>
      <div class="type-icons">
        <CastTypeBtn v-for="item in castTypes" :key="item.id" :type="item.type" @change="handleCastTypeBtn" />
      </div>
    </div>
    <div class="cast-list-main">
      <DynamicScroller ref="listRef" :items="casts" :min-item-size="30" class="scroller" @scroll="handleScroll">
        <template v-slot="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.content, item.rtfContent]"
            :data-index="item.id">
            <CastItem
              :method="item.method"
              :user="item.user"
              :gift="item.gift"
              :content="item.content"
              :rtf-content="item.rtfContent" />
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>
  </div>
</template>

<script setup lang="ts">
import CastTypeBtn from '@/components/CastTypeBtn/index.vue';
import { computed, nextTick, onMounted, ref } from 'vue';
import type { CastType } from './CastTypeBtn/type';
import { getId } from '@/utils/idUtil';
import CastItem from './CastItem.vue';
import { CastMethod, type DyMessage } from '@/core/dycast';
import { throttle } from '@/utils/loashUtil';

// vue-virtual-scroller 基本原理
// 生成一个大致等于总内容高的dom
// 然后监听该dom的滚动，判断那些元素需要显示

interface CastListProps {
  title?: string;
  theme?: 'light' | 'dark';
  types?: CastType[];
  pos?: 'center' | 'left';
  noPrefix?: boolean;
}

const props = withDefaults(defineProps<CastListProps>(), {
  types: () => [],
  noPrefix: false,
  pos: 'center'
});
// 类型控制器
const typeMap: Map<CastMethod, boolean> = new Map();

/** 右侧类型控制按钮 */
const castTypes = computed(() => {
  return props.types.map(item => {
    return {
      id: getId(),
      type: item
    };
  });
});
/**
 * 控制弹幕显示
 * @param active
 * @param type
 */
const handleCastTypeBtn = function (active?: boolean, type?: CastType) {
  if (type) {
    setCastType(type, active);
    // 整理显示
    addCasts(allCasts, true);
  }
};
/**
 * 设置弹幕类型显隐状态
 * @param type
 * @param flag
 */
const setCastType = function (type: CastType, flag?: boolean) {
  switch (type) {
    case 'chat':
      typeMap.set(CastMethod.CHAT, !!flag);
      typeMap.set(CastMethod.EMOJI_CHAT, !!flag);
      break;
    case 'gift':
      typeMap.set(CastMethod.GIFT, !!flag);
      break;
    case 'like':
      typeMap.set(CastMethod.LIKE, !!flag);
      break;
    case 'social':
      typeMap.set(CastMethod.SOCIAL, !!flag);
      break;
    case 'member':
      typeMap.set(CastMethod.MEMBER, !!flag);
      break;
  }
};

/** 显示弹幕 */
const casts = ref<DyMessage[]>([]);
// 所有弹幕
const allCasts: DyMessage[] = [];
// 添加弹幕
const appendCasts = function (msgs: DyMessage[]) {
  if (!msgs || !msgs.length) return;
  allCasts.push(...msgs);
  addCasts(msgs);
};
/**
 * 设置弹幕显示
 */
const addCasts = function (msgs: DyMessage[], isClear: boolean = false) {
  const list: DyMessage[] = msgs.filter(item => {
    if (item.method) return !!typeMap.get(item.method);
    else return false;
  });
  if (isClear) casts.value = list;
  else casts.value.push(...list);
  nextTick(() => {
    autoScrollToBottom();
  });
};
/**
 * 清空弹幕
 */
const clearCasts = function () {
  allCasts.length = 0;
  casts.value = [];
};
onMounted(() => {
  // 初始化
  if (props.types) {
    for (const key of props.types) {
      setCastType(key, true);
      if (key === 'member') {
        typeMap.set(CastMethod.CUSTOM, true);
        typeMap.set(CastMethod.CONTROL, true);
      }
    }
  }
});

/** 列表DOM Ref */
const listRef = ref();

// 判断是否滚动到底部的容差值，避免边缘情况
const SCROLL_BTH = 50;

let isAtBottom = true;

const handleScroll = throttle(function (event) {
  const { scrollTop, clientHeight, scrollHeight } = event.target;
  isAtBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_BTH;
}, 200);

const scrollToBottom = function () {
  listRef.value?.scrollToBottom?.();
};

const autoScrollToBottom = function () {
  if (isAtBottom) scrollToBottom();
};

defineExpose({
  appendCasts,
  clearCasts
});
</script>

<style lang="scss" scoped>
$redCirBg: #ff6157;
$redCirBd: #e24640;
$yellowCirBg: #ffc12f;
$yellowCirBd: #dfa023;
$greenCirBg: #2acb42;
$greenCirBd: #1bac2c;

$shadowB0: #000000;
$shadowB1: rgba(0, 0, 0, 0.1);
$shadowB2: rgba(0, 0, 0, 0.2);
$shadowB3: rgba(0, 0, 0, 0.3);
$shadowB12: rgba(0, 0, 0, 0.12);
$shadowB15: rgba(0, 0, 0, 0.15);
$shadowB05: rgba(0, 0, 0, 0.05);

$shadowW2: rgba(255, 255, 255, 0.2);
$shadowW6: rgba(255, 255, 255, 0.6);

$lightBd: rgba(0, 0, 0, 0.6);
$lightBarBg: #fcfcfc;
$lightBg: #ececec;
$lightText: #4b4b4b;

$darkBd: rgba(0, 0, 0, 0.6);
$darkBarBg: #363636;
$darkBg: #262626;
$darkText: #a5a5a5;
.mac-prefix {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  .cir {
    width: 0.8rem;
    height: 0.8rem;
    box-sizing: border-box;
    border-radius: 50%;
    &.red {
      background-color: $redCirBg;
      border: 0.5px solid $redCirBd;
    }
    &.yellow {
      background-color: $yellowCirBg;
      border: 0.5px solid $yellowCirBd;
    }
    &.green {
      background-color: $greenCirBg;
      border: 0.5px solid $greenCirBd;
    }
  }
}
.cast-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  box-shadow: 0px 5px 10px 0px $shadowB3, 0px 3px 6px 0px $shadowB15, 0 0 1px 0 $lightBd;
  border-radius: 0.5rem;
  background-color: $lightBg;
  overflow: hidden;
  position: relative;
  .mac-prefix {
    position: absolute;
    left: 8px;
  }
  &.no-prefix {
    .mac-prefix {
      display: none;
    }
  }
  &.pos-left {
    .cast-list-header {
      .title {
        justify-content: flex-start;
      }
    }
  }
  &.theme-dark {
    background-color: $darkBg;
    border: 0.5px solid $shadowW2;
    box-shadow: 0px 6px 10px 0px $shadowB2, 0px 3px 6px 0px $shadowB12, inset 0px 0.5px 0.5px 0px $shadowW6;
    .cast-list-header {
      background-color: $darkBarBg;
      box-shadow: 0px 1px 0px 0px $shadowB3, 0px 0.5px 0px 0px $shadowB0;
    }
    .title {
      color: $darkText;
    }
    .cast-list-main {
      .scroller {
        &::-webkit-scrollbar {
          width: 5px;
        }
        &::-webkit-scrollbar-thumb {
          background: #3f3f3f; // 滑块颜色
          border-radius: 2.5px; // 滑块圆角
        }
        &::-webkit-scrollbar-thumb:hover {
          background: #595959;
        }
        &::-webkit-scrollbar-thumb:active {
          background: #616161;
        }
        &::-webkit-scrollbar-track {
          background: rgba(61, 61, 61, 0.5);
          border-radius: 2.5px; // 滑块圆角
        }
      }
    }
  }
}
.cast-list-header {
  position: relative;
  width: 100%;
  height: 2rem;
  flex-shrink: 0;
  background-color: $lightBarBg;
  box-sizing: border-box;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  box-shadow: 0px 1px 0px 0px $shadowB05, 0px 0.5px 0px 0px $shadowB1;
  .title {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: 'mkwxy';
    font-size: 1rem;
    font-weight: bold;
    color: $lightText;
    box-sizing: border-box;
    label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      box-sizing: border-box;
    }
  }
  .cast-type-btn {
    width: 1.5rem;
    height: 1.5rem;
  }
  .type-icons {
    display: flex;
    align-items: center;
    gap: 5px;
    box-sizing: border-box;
    position: absolute;
    right: 12px;
  }
}
.cast-list-main {
  position: relative;
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 12px 8px;
  .scroller {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: #ccc; // 滑块颜色
      border-radius: 2.5px; // 滑块圆角
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #bbb;
    }
    &::-webkit-scrollbar-thumb:active {
      background: #999;
    }
    &::-webkit-scrollbar-track {
      background: rgba(217, 217, 217, 0.3);
      border-radius: 2.5px; // 滑块圆角
    }
  }
}

@-moz-document url-prefix() {
  .cast-list-main {
    .scroller {
      scrollbar-width: thin;
      scrollbar-color: #ccc rgba(217, 217, 217, 0.3);
    }
  }
  .cast-list {
    &.theme-dark {
      .cast-list-main {
        .scroller {
          scrollbar-width: thin;
          scrollbar-color: #4f4f4f rgba(61, 61, 61, 0.5);
        }
      }
    }
  }
}
</style>
