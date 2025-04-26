<template>
  <!-- 直播间信息 -->
  <div class="live-info">
    <!-- 封面 -->
    <div class="live-info-cover">
      <div
        :class="{
          'live-info-cover_main': true,
          loading: coverLoadingStatus === 1,
          error: coverLoadingStatus === 3,
          loaded: coverLoadingStatus === 2,
          unload: coverLoadingStatus === 0
        }">
        <img :src="cover" alt="封面" @load="handleCoverLoaded" @error="handleCoverError" />
        <span>{{ coverLoadingTip }}</span>
      </div>
      <label class="live-info-title">{{ title }}</label>
    </div>
    <!-- 信息 -->
    <div class="live-info-list">
      <LiveInfoItem title="主播" :cover="avatar" :text="nickname" />
      <LiveInfoItem title="主播粉丝数" :text="followCount" />
      <LiveInfoItem title="在线观众数" :text="memberCount" />
      <LiveInfoItem title="累计观看人数" :text="userCount" />
      <LiveInfoItem title="本场点赞数" :text="likeCount" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import LiveInfoItem from './LiveInfoItem.vue';

interface LiveInfoProps {
  cover?: string;
  title?: string;
  avatar?: string;
  nickname?: string;
  followCount?: string | number;
  memberCount?: string | number;
  userCount?: string | number;
  likeCount?: string | number;
}

const props = withDefaults(defineProps<LiveInfoProps>(), {
  title: '直播间标题',
  nickname: '***',
  followCount: '*****',
  memberCount: '*****',
  userCount: '*****',
  likeCount: '*****'
});

// 封面加载状态
// 尚未设置|加载中|加载完成|加载失败
const coverLoadingStatus = ref<0 | 1 | 2 | 3>(0);

const coverLoadingTip = computed(() => {
  let tip: string = '';
  switch (coverLoadingStatus.value) {
    case 0:
      tip = '暂无封面';
      break;
    case 1:
      tip = '加载中···';
      break;
    case 3:
      tip = '加载失败';
      break;
  }
  return tip;
});

onBeforeMount(() => {
  if (props.cover) coverLoadingStatus.value = 1;
});

/** 图片加载完成 */
const handleCoverLoaded = function () {
  if (props.cover) coverLoadingStatus.value = 2;
};
/** 图片加载失败 */
const handleCoverError = function () {
  if (props.cover) coverLoadingStatus.value = 3;
};
</script>

<style lang="scss" scoped>
$loadingBgA: #eae5e3;
$loadingBgB: #fff;
$tipColor: #b9b7b5;
$titleColor: #1e2732;
$errorText: #e94829;

.live-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  padding: 24px 18px;
  .live-info-cover {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
}

.live-info-cover_main {
  position: relative;
  background-color: $loadingBgA;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  &::after {
    display: none;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 400%;
    height: 100%;
    background: linear-gradient(-45deg, $loadingBgA 25%, $loadingBgB 45%, $loadingBgA 65%);
    background-size: 100% 100%;
    animation: skeletonLoading 1.2s ease-in-out infinite;
    will-change: transform;
  }
  // 加载中
  &.loading {
    img {
      display: none;
    }
    span {
      z-index: 1;
    }
    &::after {
      display: block;
    }
  }
  &.unload {
    img {
      display: none;
    }
    span {
      z-index: 1;
    }
  }
  // 加载完成
  &.loaded {
    span {
      display: none;
    }
  }
  // 加载失败
  &.error {
    img {
      display: none;
    }
    span {
      z-index: 1;
      color: $errorText;
    }
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  span {
    font-size: 0.8rem;
    font-family: 'mkwxy';
    color: $tipColor;
    letter-spacing: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
    padding: 0 6px;
  }
}

.live-info-title {
  text-align: center;
  flex-shrink: 0;
  font-family: 'mkwxy';
  font-size: 1rem;
  letter-spacing: 1px;
  font-weight: bold;
  line-height: 24px;
  width: 100%;
  height: 24px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: $titleColor;
}

.live-info-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@keyframes skeletonLoading {
  0% {
    transform: translate(-75%);
  }
  100% {
    transform: translate(0);
  }
}
</style>
