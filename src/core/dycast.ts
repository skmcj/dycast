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
