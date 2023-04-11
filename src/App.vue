<template>
  <div class="main">
    <Left class="left" />
    <Right class="right" />
  </div>
</template>

<script setup lang="ts">
import Left from './components/Left.vue';
import Right from './components/Right.vue';
import { ref, reactive, provide, readonly } from 'vue';

// 弹幕表
const chatList = reactive<Mess[]>([]);
// 点赞送礼榜
const rankList = reactive<RankItem[]>([]);
// 是否停止自动滚动
const isStopScroll = ref(false);

provide('chatList', chatList);
provide('rankList', rankList);
provide('isStopScroll', readonly(isStopScroll));
provide('setIsStopScroll', (value: boolean) => {
  isStopScroll.value = value;
});
</script>

<style lang="less">
.main {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: space-between;
  .left {
    width: 45%;
  }
  .right {
    width: 55%;
  }
}
@media screen and (max-width: 768px) {
  .main {
    align-items: center;
    flex-direction: column;
    height: 100%;
    .left,
    .right {
      width: 100%;
    }
    .mess-c {
      height: 640px;
    }
  }
}
</style>
