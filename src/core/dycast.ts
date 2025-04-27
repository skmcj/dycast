/**
 * 连接状态
 *  0 - 未连接
 *  1 - 连接中(连接完成)
 *  2 - 连接失败
 *  3 - 已断开
 */
export type ConnectStatus = 0 | 1 | 2 | 3;

/** 直播间信息 */
export interface LiveRoom {
  /**
   * 在线观众数
   */
  audienceCount?: number | string;
  /**
   * 本场点赞数
   */
  likeCount?: number | string;
  /**
   * 主播粉丝数
   */
  followCount?: number | string;
  /**
   * 累计观看人数
   */
  totalUserCount?: number | string;
  /** 房间状态 */
  status?: number;
}

/** 直播间信息-连接信息 */
export interface DyLiveInfo {
  roomId: string;
  uniqueId: string;
  avatar: string;
  cover: string;
  nickname: string;
  title: string;
  status: number;
}
/** 直播间信息-初次连接信息 */
export interface DyImInfo {
  cursor?: string;
  fetchInterval?: string;
  now?: string;
  internalExt?: string;
  fetchType?: number;
  pushServer?: string;
  liveCursor?: string;
}

/**
 * 送礼点赞榜
 */
export interface LiveRankItem {
  nickname: string;
  avatar: string;
  rank: number | string;
}

export interface CastUser {
  // user.sec_uid | user.id_str
  id?: string;
  // user.nickname
  name?: string;
  // user.avatar_thumb.url_list.0
  avatar?: string;
  // 性别 0 | 1 | 2 => 未知 | 男 | 女
  gender?: number;
}

export interface CastGift {
  id?: string;
  name?: string;
  // 抖音币 diamond_count
  price?: number;
  type?: number;
  // 描述
  desc?: string;
  // 图片
  icon?: string;
  // 数量 repeat_count | combo_count
  count?: number | string;
  // 礼物消息可能重复发送，0 表示第一次，未重复
  repeatEnd?: number;
}

/**
 * 富文本类型
 *  1 - 普通文本
 *  2 - 合并表情
 */
export enum CastRtfContentType {
  TEXT = 1,
  EMOJI = 2
}

// 富文本
export interface CastRtfContent {
  type?: CastRtfContentType;
  text?: string;
  url?: string;
}

export interface DyMessage {
  id?: string;
  method?: CastMethod;
  user?: CastUser;
  gift?: CastGift;
  content?: string;
  rtfContent?: CastRtfContent[];
  room?: LiveRoom;
  rank?: LiveRankItem[];
}

export enum CastMethod {
  CHAT = 'WebcastChatMessage',
  GIFT = 'WebcastGiftMessage',
  LIKE = 'WebcastLikeMessage',
  MEMBER = 'WebcastMemberMessage',
  SOCIAL = 'WebcastSocialMessage',
  ROOM_USER_SEQ = 'WebcastRoomUserSeqMessage',
  CONTROL = 'WebcastControlMessage',
  ROOM_RANK = 'WebcastRoomRankMessage',
  ROOM_STATS = 'WebcastRoomStatsMessage',
  EMOJI_CHAT = 'WebcastEmojiChatMessage',
  FANSCLUB = 'WebcastFansclubMessage',
  ROOM_DATA_SYNC = 'WebcastRoomDataSyncMessage',
  /** 自定义消息 */
  CUSTOM = 'CustomMessage'
}
