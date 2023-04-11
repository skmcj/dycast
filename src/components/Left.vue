<template>
  <div class="l-box">
    <div class="dy-form">
      <div class="dy-title">房间信息</div>
      <div
        class="dy-room-box"
        :class="{
          error: rnFlag
        }">
        <div class="dy-room-tag">房间号</div>
        <input v-model="roomNum" type="text" class="dy-room-input" placeholder="请输入12位房间号" />
        <button class="dy-room-btn" @click="gotoConnect">连接</button>
      </div>
      <div class="dy-title">转发信息</div>
      <div class="dy-room-box">
        <div class="dy-room-tag">ws地址</div>
        <input v-model="relayWs" type="text" class="dy-room-input" placeholder="请输入ws/wss协议链接" />
        <button class="dy-room-btn" @click="relay">转发</button>
      </div>
      <div class="dy-title">
        <span>房间信息</span>
        <span
          v-if="connectCode !== 100"
          class="state"
          :class="{
            success: connectCode === 200,
            fail: connectCode === 400
          }"
          >{{ connectCode === 200 ? '连接成功' : '连接失败' }}</span
        >
      </div>
      <div class="dy-room-info" v-if="connectCode !== 100">
        <div class="title-box">
          <img :src="roomAvatar" alt="头像" />
          <span>{{ roomTitle }}</span>
        </div>
        <div class="info-item">
          <span class="tit">主播粉丝数：</span>
          <span class="text">{{ followCount }}</span>
        </div>
        <div class="info-item">
          <span class="tit">累计观看人数：</span>
          <span class="text">{{ totalUserCount }}</span>
        </div>
        <div class="info-item">
          <span class="tit">在线观众数：</span>
          <span class="text">{{ memberCount }}</span>
        </div>
        <div class="info-item">
          <span class="tit">点赞数：</span>
          <span class="text">{{ likeCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DyClient, handleMessage } from '../utils/client';
import { getRoomInfoApi } from '@/api/commonApi';
import { ref, inject, onMounted, type Ref } from 'vue';

// 房间号
const roomNum = ref<string | null>(null);

const relayWs = ref<string>('');
// 弹幕列表
const chatList = inject<Mess[]>('chatList');
// 点赞送礼榜
const rankList = inject<RankItem[]>('rankList');

// 连接状态
const connectCode = ref<number>(100);
const roomAvatar = ref<string>('');
const roomTitle = ref<string | null>(null);

const isStopScroll = inject<Ref<boolean>>('isStopScroll');
const setIsStopScroll = inject<(value: boolean) => void>('setIsStopScroll');

const rnFlag = ref(false);
/**
 * 在线观众
 */
const memberCount = ref(0);
/**
 * 点赞数
 */
const likeCount = ref(0);
/**
 * 主播粉丝数
 */
const followCount = ref(0);
/**
 * 累计观看人数
 */
const totalUserCount = ref(0);

// 传送的socket
let relaySocket: any;
// 消息列表DOM
let messListDom: HTMLElement | null;

onMounted(() => {
  messListDom = document.getElementById('mess-list');
});

/**
 * 连接直播间
 */
function gotoConnect() {
  if (!roomNum.value) {
    rnFlag.value = true;
    return;
  }
  if (!/\d{8,12}/.test(roomNum.value)) {
    rnFlag.value = true;
    return;
  }
  rnFlag.value = false;
  let n = window.open(`https://live.douyin.com/${roomNum.value}`, '_blank');
  setTimeout(() => {
    n?.close();
    roomNum.value &&
      getRoomInfoApi(roomNum.value)
        .then((res: any) => {
          // console.log(res);
          roomAvatar.value = res.avatar;
          roomTitle.value = res.roomTitle;
          connection(res.roomId, res.uniqueId);
        })
        .catch((err: any) => {
          console.log(err);
        });
  }, 2000);
}

/**
 * 转发消息
 */
function relay() {
  relaySocket = new WebSocket(relayWs.value);
}

/**
 * 链接弹幕
 * @param roomId
 * @param uniqueId
 */
function connection(roomId: string, uniqueId: string) {
  let sign = window.getSign(roomId, uniqueId)['X-Bogus'];
  let now = Date.now();
  let wsUrl = `wss://webcast3-ws-web-hl.douyin.com/webcast/im/push/v2/?app_name=douyin_web&version_code=180800&webcast_sdk_version=1.3.0&update_version_code=1.3.0&compress=gzip&internal_ext=internal_src:dim|wss_push_room_id:${roomId}|wss_push_did:${uniqueId}|fetch_time:${now}|seq:1|wss_info:0-${now}-0-0&cursor=t-${now}_r-1_d-1_u-1_h-1&host=https://live.douyin.com&aid=6383&live_id=1&did_rule=3&debug=false&maxCacheMessageNumber=20&endpoint=live_pc&support_wrds=1&im_path=/webcast/im/fetch/&user_unique_id=${uniqueId}&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Mozilla&browser_version=5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/111.0.0.0%20Safari/537.36%20Edg/111.0.1661.62&browser_online=true&tz_name=Asia/Shanghai&identity=audience&room_id=${roomId}&heartbeatDuration=0&signature=${sign}`;
  // 服务地址 发送
  const client = new DyClient();
  client.init(wsUrl);
  client.accept = (message: proto.Message) => {
    if (message) {
      let m = handleMessage(message);
      handleChat(m);
      renewPos();
      relayMess(m);
    }
  };
  client.onOff = (flag: boolean) => {
    if (flag) {
      connectCode.value = 200;
    } else {
      connectCode.value = 400;
    }
  };
}

/**
 * 处理信息
 * @param chat
 */
function handleChat(data: Mess) {
  let type = data.type;
  switch (type) {
    case 'chat':
      chatList!.push(data);
      break;
    case 'member':
      memberCount.value = data.memberCount;
      break;
    case 'like':
      likeCount.value = data.likeCount;
      break;
    case 'gift':
      chatList!.push(data);
      break;
    case 'social':
      followCount.value = data.followCount;
      break;
    case 'room':
      memberCount.value = data.memberCount;
      totalUserCount.value = data.totalUserCount;
      rankList!.length = 0;
      rankList!.push(...data.rank);
      break;
  }
}

/**
 * 更新消息列表位置
 */
function renewPos() {
  if (!messListDom) {
    messListDom = document.getElementById('mess-list');
  }
  console.log(isStopScroll?.value);
  if (!isStopScroll?.value) {
    messListDom &&
      messListDom.scrollTo({ top: messListDom.scrollHeight - messListDom.clientHeight, behavior: 'smooth' });
  }
}

/**
 * 转发消息
 * @param data
 */
function relayMess(data: Mess) {
  if (!data.type) return;
  relaySocket && relaySocket?.send(JSON.stringify(data));
}
</script>

<style lang="less" scoped>
.dy-form {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  padding: 24px 36px;
  flex-direction: column;
  .dy-title {
    position: relative;
    font-size: 18px;
    font-weight: bold;
    padding: 8px 5px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 8px;
    .state {
      position: absolute;
      right: 12px;
      font-size: 16px;
      font-weight: normal;
      &.success {
        color: #98d98e;
      }
      &.fail {
        color: #f7315d;
      }
    }
  }
  .dy-room-box {
    max-width: 420px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #9aa7b1;
    border-radius: 5px;
    overflow: hidden;
    box-sizing: border-box;
    margin: 12px 8px;
    margin-bottom: 24px;
    flex-shrink: 0;
    &.error {
      border-color: #fa5232;
    }
    .dy-room-tag {
      flex-shrink: 0;
      text-align: center;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .dy-room-input {
      min-width: 114px;
      height: 100%;
      font-size: 14px;
      color: #5c4f55;
      flex-grow: 1;
      height: 100%;
      outline: none;
      border: none;
      padding: 0;
    }
    .dy-room-btn {
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
      outline: none;
      height: 100%;
      border: none;
      padding: 0;
      box-sizing: border-box;
      padding: 0 24px;
      background-color: #a9b7c2;
    }
  }
  .dy-room-info {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 12px 8px;
    .title-box {
      display: flex;
      align-items: center;
      margin: 12px 0;
      img {
        border-radius: 50%;
        width: 64px;
        height: 64px;
        border: 1px solid #ccc;
      }
      span {
        margin-left: 12px;
        font-size: 16px;
        font-weight: bold;
        color: #8b968d;
      }
    }
    .info-item {
      font-size: 14px;
      font-weight: bold;
      & + .info-item {
        margin-top: 8px;
      }
      .tit {
        margin-right: 12px;
        color: #333631;
      }
      .text {
        color: #9e9478;
      }
    }
  }
}
</style>
