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

/**
 * 输出标签
 * @param tip
 * @param link
 * @param color
 */
const printInfo = function (
  tip: string = '抖音弹幕姬',
  link: string = 'https://github.com/skmcj/dycast',
  color: string = '#dc6b82'
) {
  console.log(
    `%c ${tip} %c ${link}`,
    `color:white;background:${color};padding:5px 0;border-radius: 5px 0 0 5px;`,
    `padding:4px;border:1px solid ${color};border-radius: 0 5px 5px 0;`
  );
};

const printSKMCJ = function () {
  const info = `
 ________  ___  __    _____ ______   ________        ___     
|\\   ____\\|\\  \\|\\  \\ |\\   _ \\  _   \\|\\   ____\\      |\\  \\    
\\ \\  \\___|\\ \\  \\/  /|\\ \\  \\\\\\__\\ \\  \\ \\  \\___|      \\ \\  \\   
 \\ \\_____  \\ \\   ___  \\ \\  \\\\|__| \\  \\ \\  \\       __ \\ \\  \\  
  \\|____|\\  \\ \\  \\\\ \\  \\ \\  \\    \\ \\  \\ \\  \\____ |\\  \\\\_\\  \\ 
    ____\\_\\  \\ \\__\\\\ \\__\\ \\__\\    \\ \\__\\ \\_______\\ \\________\\
   |\\_________\\|__| \\|__|\\|__|     \\|__|\\|_______|\\|________|
   \\|_________|
  `;
  console.log(`%c${info}`, `color: #dc6b82`);
};
setTimeout(() => {
  console.clear();
  printSKMCJ();
  printInfo();
}, 1500);

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
