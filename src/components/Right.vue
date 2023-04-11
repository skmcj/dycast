<template>
  <div class="r-box">
    <div class="mess-box" @click="onStopScrollOfList">
      <div class="mess-h">
        <div class="mess-h-tool">
          <span class="mess-h-tool-item mess-h-r"></span>
          <span class="mess-h-tool-item mess-h-y"></span>
          <span class="mess-h-tool-item mess-h-g"></span>
        </div>
        <div class="mess-h-t">弹幕消息</div>
      </div>
      <div class="mess-c">
        <dynamic-scroller :items="chatList" :min-item-size="32" class="mess-l" id="mess-list">
          <template v-slot="{ item, index, active }">
            <dynamic-scroller-item
              :item="item"
              :active="active"
              :size-dependencies="[item.content]"
              :data-index="index">
              <div class="mess-l-item">
                <div class="item-name">{{ item.nickname }}</div>
                <div class="item-content-box">
                  <span
                    v-if="getChatType(item.type) === 0"
                    :class="{
                      in: item.type === 'member',
                      text: item.type === 'chat'
                    }"
                    >{{ item.content }}</span
                  >
                  <div v-if="getChatType(item.type) == 1" class="gift">
                    <span class="desc">送出了</span>
                    <img :src="item?.gift?.url" alt="gift" />
                    <span class="num">× {{ item?.gift?.count }}</span>
                  </div>
                </div>
              </div>
            </dynamic-scroller-item>
          </template>
        </dynamic-scroller>
      </div>
      <!-- 返回底部盒子 -->
      <div v-if="isStopScroll && chatList!.length > 0" class="rt-bt-box" @click.stop="returnBottom">
        <span>固定底部</span>
        <span class="icon">︾</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, type Ref } from 'vue';

const chatList = inject<Mess[]>('chatList');

const isStopScroll = inject<Ref<boolean>>('isStopScroll');
const setIsStopScroll = inject<(value: boolean) => void>('setIsStopScroll');

/**
 * 获取信息类型
 * @param type
 */
function getChatType(type: string): number {
  let f = 0;
  switch (type) {
    case 'member':
      f = 0;
      break;
    case 'chat':
      f = 0;
      break;
    case 'gift':
      f = 1;
      break;
  }
  return f;
}

/**
 * 返回底部
 */
function returnBottom() {
  setIsStopScroll && setIsStopScroll(false);
  const messListDom = document.getElementById('mess-list');
  messListDom && messListDom.scrollTo({ top: messListDom.scrollHeight - messListDom.clientHeight, behavior: 'smooth' });
}

/**
 * 点击停止自动滚动
 */
function onStopScrollOfList() {
  if (chatList!.length <= 0) return;
  setIsStopScroll && setIsStopScroll(true);
}
</script>

<style lang="less" scoped>
.r-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  .mess-box {
    position: relative;
    border-radius: 8px;
    margin: 24px 0;
    width: 90%;
    flex-grow: 1;
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: #0c0c0c;
    overflow: hidden;
    box-shadow: 5px 5px 8px 0px rgba(0, 0, 0, 0.3);
    border: 1px solid #1e2732;
  }
}
.mess-h {
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 100%;
  height: 36px;
  background-color: #fff;
  position: relative;
  box-shadow: 0px 1px 0px 0px #e6e6e6, 0 3px 6px 0px rgba(255, 255, 255, 0.3);
  .mess-h-tool {
    display: flex;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    margin-left: 12px;
    .mess-h-tool-item {
      display: inline-block;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid #ccc;
      margin: 0 5px;
    }
    .mess-h-r {
      background-color: #fb625f;
    }
    .mess-h-y {
      background-color: #ffbe40;
    }
    .mess-h-g {
      background-color: #30cd46;
    }
  }
  .mess-h-t {
    color: #7a7b78;
    font-weight: bold;
  }
}
.mess-c {
  position: relative;
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;
  overflow-y: auto;
}
.mess-l {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 8px 12px;
  box-sizing: border-box;
  &::-webkit-scrollbar  {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc; // 滑块颜色
    border-radius: 2.5px; // 滑块圆角
  }
  .mess-l-item {
    width: 100%;
    flex-shrink: 0;
    display: flex;
    .item-name {
      flex-shrink: 0;
      margin-right: 8px;
      font-size: 18px;
      color: #b148c6;
      line-height: 32px;
      &::before {
        content: '[';
        margin-right: 5px;
      }
      &::after {
        content: ']: ';
        margin-left: 5px;
      }
    }
    .item-content-box {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      font-size: 16px;
      line-height: 32px;
      .text {
        color: #fff;
      }
      .in {
        color: #e5e517;
      }
      .gift {
        display: flex;
        img {
          width: 32px;
          height: 32px;
          margin-left: 8px;
          margin-right: 5px;
        }
        .desc {
          color: #e5e517;
        }
        .num {
          color: #eba825;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
    &::before {
      font-weight: bold;
      margin: 5px 8px;
      content: '$';
      color: #14a800;
      font-size: 18px;
    }
    & + .mess-l-item {
      margin-top: 12px;
    }
  }
}
.rt-bt-box {
  animation: fade-in 1s ease-in-out;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 18px;
  right: 32px;
  color: #b148c6;
  &:hover {
    .icon {
      animation: shake-tb 1.5s ease-in-out infinite;
    }
  }
}

@keyframes shake-tb {
  0% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(3px);
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(48px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
