/// <reference types="vite/client" />

declare namespace proto {
  class ProtoObject<T> {
    constructor()
    serializeBinary: () => string|Uint8Array
    static deserializeBinary: (bytes: string|Uint8Array) => T
  }

  interface ImageContent {
    getName: () => string
    getFontColor: () => string
    getLevel: () => number
    getAlternativeText: () => string

    setName: (name: string) => string
    setFontColor: (color: string) => string
    setLevel: (level: number) => number
    setAlternativeText: (alternativeText: string) => string
  }

  class PushFrame extends ProtoObject<T> {
    getSeqid: () => number
    setSeqid: (seqid: number) => void
    getLogid: () => number
    setLogid: (logid: number) => void
    getService: () => number
    setService: (service: number) => void
    getMethod: () => number
    setMethod: (method: number) => void
    getHeaderslistMap: () => HeadersList
    setHeaderslistMap: (headersList: Map<string, string>) => void
    getPayloadEncoding: () => string
    setPayloadEncoding: (payloadEncoding: string) => void
    getPayloadtype: () => string
    setPayloadtype: (payloadType: string) => void
    getPayload: () => Uint8Array
    getPayload_asU8: () => Uint8Array
    setPayload: (payload: Uint8Array) => void
  }
  class Message extends ProtoObject<Message> {
    getMethod: () => string
    getPayload: () => Uint8Array
    getMsgid: () => number
    getMsgtype: () => number
    getOffset: () => number
    setMethod: (method: string) => void
    setPayload: (payload: Uint8Array) => void
    setMsgid: (msgid: number) => void
    setMsgtype: (msgtype: number) => void
    setOffset: (offset: number) => void
  }
  class Response extends ProtoObject<Response> {
    getMessagesList: () => Message[]
    getCursor: () => string
    getFetchinterval: () => number
    getNow: () => number
    getInternalext: () => string
    getFetchtype: () => number
    getRouteparams: () => Map<string, string>
    getHeartbeatduration: () => number
    getNeedack: () => boolean
    getPushserver: () => string
    getLivecursor: () => string
    getHistorynomore: () => boolean

    setMessagesList: (messagesList: Message[]) => void
    setCursor: (cursor: string) => void
    setFetchinterval: (fetchInterval: number) => void
    setNow: (now: number) => void
    setInternalext: (internalExt: string) => void
    setFetchtype: (fetchType: number) => void
    setRouteparams: (routeParams: Map<string, string>) => void
    setHeartbeatduration: (heartbeatDuration: number) => void
    setNeedack: (needAck: boolean) => void
    setPushserver: (pushServer: string) => void
    setLivecursor: (liveCursor: string) => void
    setHistorynomore: (historyNoMore: boolean) => void
  }

  class User extends ProtoObject<User> {
    getId: () => number
    getShortid: () => number
    getNickname: () => string
    getGender: () => number
    getSignature: () => string
    getLevel: () => number
    getBirthday: () => number
    getTelephone: () => string
    getAvatarmedium: () => Image
    getVerified: () => Boolean
    getExperience: () => number
    getCity: () => string
    getStatus: () => number
    getCreatetime: () => number
    getModifytime: () => number
    getSecret: () => number
    getShareqrcodeuri: () => string
    getIncomesharepercent: () => number
    getSpecialid: () => string
    getTopvipno: () => number
    getPayscore: () => number
    getTicketcount: () => number
    getDisplayid: () => string

    setId: (id: number) => void
    setShortid: (shortId: number) => void
    setNickname: (nickname: string) => void
    setGender: (gender: number) => void
    setSignature: (signature: string) => void
    setLevel: (level: number) => void
    setBirthday: (birthday: number) => void
    setTelephone: (telephone: string) => void
    setAvatarmedium: (avatar: Image) => void
    setVerified: (verified: boolean) => void
    setExperience: (experience: number) => void
    setCity: (city: string) => void
    setStatus: (status: number) => void
    setCreatetime: (createTime: number) => void
    setModifytime: (modifyTime: number) => void
    setSecret: (secret: number) => void
    setShareqrcodeuri: (shareqrCodeUri: string) => void
    setIncomesharepercent: (incomeSharepercent: number) => void
    setSpecialid: (specialid: string) => void
    setTopvipno: (topVipno: number) => void
    setPayscore: (Payscore: number) => void
    setTicketcount: (ticketCount: number) => void
    setDisplayid: (displayId: string) => void
  }

  class Image extends ProtoObject<Image> {
    getUrlList: () => string
    getUri: () => string
    getHeight: () => number
    getWidth: () => number
    getAvgColor: () => string
    getImageType: () => number
    getOpenWebUrl: () => string
    getContent: () => ImageContent
    getIsAnimated: () => boolean

    setUrlList: (urlList: string) => void
    setUri: (uri: string) => void
    setHeight: (height: number) => void
    setWidth: (width: number) => void
    setAvgColor: (color: string) => void
    setImageType: (type: number) => void
    setOpenWebUrl: (url: string) => void
    setContent: (content: ImageContent) => void
    setIsAnimated: (isAnimated: boolean) => void
  }


  /**
   * 聊天消息 - 普通弹幕
   */
  class ChatMessage extends ProtoObject<ChatMessage> {
    getCommon: () => Common
    getUser: () => User
    getContent: () => string
    getVisibleToSender: () => boolean
    getBackgroundImage: () => Image
    getFullScreenTextColor: () => string
    getBackgroundImageV2: () => Image
    getPublicAreaCommon: () => PublicAreaCommon
    getGiftImage: () => Image

    setCommon: (common: Common) => void
    setUser: (user: User) => void
    setContent: (content: string) => void
    setVisibleToSender: (sender: boolean) => void
    setBackgroundImage: (bg: Image) => void
    setFullScreenTextColor: (tc: string) => void
    setBackgroundImageV2: (bg2: Image) => void
    setPublicAreaCommon: (common: PublicAreaCommon) => void
    setGiftImage: (gif: Image) => void
  }

  /**
   * 进入直播间
   */
  class MemberMessage extends ProtoObject<MemberMessage> {
    getCommon: () => Common
    getUser: () => User
    getMemberCount: () => int64
    getOperator: () => User
    getIsSetToAdmin: () => bool
    getIsTopUser: () => bool
    getRankScore: () => int64
    getTopUserNo: () => int64
    getEnterType: () => int64
    getAction: () => int64
    getActionDescription: () => string
    getUserId: () => int64
    getEffectConfig: () => EffectConfig
    getPopStr: () => string
    getEnterEffectConfig: () => EffectConfig
    getBackgroundImage: () => Image
    getBackgroundImageV2: () => Image
    getAnchorDisplayText: () => Text
    getPublicAreaCommon: () => PublicAreaCommon

    setCommon: (common: Common) => void
    setUser: (user: User) => void
    setMemberCount: (count: number) => void
    setOperator: (operator: User) => void
    setIsSetToAdmin: (isAdmin: boolean) => void
    setIsTopUser: (isTop: boolean) => void
    setRankScore: (score: number) => void
    setTopUserNo: (no: number) => void
    setEnterType: (type: number) => void
    setAction: (action: number) => void
    setActionDescription: (desc: string) => void
    setUserId: (id: number) => void
    setEffectConfig: (config: EffectConfig) => void
    setPopStr: (pop: string) => void
    setEnterEffectConfig: (config: EffectConfig) => void
    setBackgroundImage: (bg: Image) => void
    setBackgroundImageV2: (bg2: Image) => void
    setAnchorDisplayText: (text: Text) => void
    setPublicAreaCommon: (pc: PublicAreaCommon) => void
  }

  /**
   * 关注
   */
  class SocialMessage extends ProtoObject<SocialMessage> {
    getCommon: () => Common
    getUser: () => User
    getShareType: () => number
    getAction: () => number
    getSharetarget: () => string
    getFollowCount: () => number
    getPublicAreaCommon: () => PublicAreaCommon

    setCommon: (common: Common) => void
    setUser: (user: User) => void
    setShareType: (type: number) => void
    setAction: (action: number) => void
    setSharetarget: (target: string) => void
    setFollowCount: (count: number) => void
    setPublicAreaCommon: (common: PublicAreaCommon) => void
  }

  /**
   * 点赞
   */
  class LikeMessage extends ProtoObject<LikeMessage> {
    getCommon: () => Common
    getCount: () => number
    getTotal: () => number
    getColor: () => number
    getUser: () => User
    getIcon: () => string

    setCommon: (common: Common) => void
    setCount: (count: number) => void
    setTotal: (total: number) => void
    setColor: (color: number) => void
    setUser: (user: User) => void
    setIcon: (icon: string) => void
  }

  /**
   * 礼物
   */
  class GiftMessage extends ProtoObject<GiftMessage> {
    getCommon: () => Common
    getGiftId: () => number
    getGift: () => proto.Gift
    getFanTicketCount: () => number
    getGroupCount: () => number
    getRepeatCount: () => number
    getComboCount: () => number
    getUser: () => User
    getToUser: () => User
    getRepeatEnd: () => number
    getGroupId: () => number
    getIncomeTaskgifts: () => number
    getRoomFanTicketCount: () => number
    getLogId: () => string
    getSendType: () => number
    getPublicAreaCommon: () => PublicAreaCommon
    getTrayDisplayText: () => Text
    getBannedDisplayEffects: () => number

    setCommon: (common: Common) => void
    setGiftId: (id: number) => void
    setFanTicketCount: (count: number) => void
    setGroupCount: (count: number) => void
    setRepeatCount: (count: number) => void
    setComboCount: (count: number) => void
    setUser: (user: User) => void
    setToUser: (toUser: User) => void
    setRepeatEnd: (end: number) => void
    setGroupId: (id: number) => void
    setIncomeTaskgifts: (income: number) => void
    setRoomFanTicketCount: (count: number) => void
    setLogId: (logId: string) => void
    setSendType: (type: number) => void
    setPublicAreaCommon: (common: PublicAreaCommon) => void
    setTrayDisplayText: (text: Text) => void
    setBannedDisplayEffects: (effects: number) => void
  }

  /**
   * 直播间统计
   */
  class RoomUserSeqMessage extends ProtoObject<RoomUserSeqMessage> {
    getCommon: () => Common
    getRanks: () => RoomContributor
    /**
     * 总人数
     */
    getTotal: () => number
    getPopStr: () => string
    getSeats: () => RoomContributor
    getPopularity: () => number
    getTotalUser: () => number
    getTotalUserStr: () => string
    getTotalStr: () => string
    getOnlineUserForAnchor: () => string
    getTotalPvForAnchor: () => string

    setCommon: (common: Common) => void
    setRanks: (rank: RoomContributor) => void
    setTotal: (total: number) => void
    setPopStr: (pop: string) => void
    setSeats: (seat: RoomContributor) => void
    setPopularity: (pop: number) => void
    setTotalUser: (total: number) => void
    setTotalUserStr: (str: string) => void
    setTotalStr: (str: string) => void
    setOnlineUserForAnchor: (anchor: string) => void
    setTotalPvForAnchor: (anchor: string) => void
  }

  class Text extends ProtoObject<Text> {
    getKey: () => string
    getDefaultPattern: () => string
    getDefaultFormat: () => TextFormat
    getPieces: () => TextPrice

    setKey: (key: string) => void
    setDefaultPattern: (pattern: string) => void
    setDefaultFormat: (format: TextFormat) => void
    setPieces: (price: TextPrice) => void
  }

  class TextFormat extends ProtoObject<TextFormat> {
    getColor: () => string
    getBold: () => boolean
    getItalic: () => boolean
    getWeight: () => number
    getItalicAngle: () => number
    getFontSize: () => number
    getUserHeightLightColor: () => boolean
    getUseRemoteClor: () => boolean

    setColor: (color: string) => void
    setBold: (bold: boolean) => void
    setItalic: (italic: boolean) => void
    setWeight: (weight: number) => void
    setItalicAngle: (italicAngle: number) => void
    setFontSize: (size: number) => void
    setUserHeightLightColor: (isLight: boolean) => void
    setUseRemoteClor: (isRemote: boolean) => void
  }

  class TextPiece{
    getType: () => number
    getFormat: () => TextFormat
    getStringValue: () => string
    getUserValue: () => TextPieceUser

    setType: (type: number) => void
    setFormat: (format: TextFormat) => void
    setStringValue: (value: string) => void
    setUserValue: (value: TextPieceUser) => void
  }

  class TextPieceUser extends ProtoObject<TextPieceUser> {
    getUser: () => User
    getWithColon: () => boolean

    setUser: (user: User) => void
    setWithColon: (width: boolean) => void
  }

  class Room extends ProtoObject<Room> {
    getId: () => number
    getIdStr: () => string
    getStatus: () => number
    getOwnerUserId: () => number
    getTitle: () => string
    getUserCount: () => number
    getCreateTime: () => number
    getLinkmicLayout: () => number
    getFinishTime: () => number
    getDynamicCoverUri: () => string
    getDynamicCoverDict: () => Map<number, string>
    getLastPingTime: () => number
    getLiveId: () => number
    getStreamProvider: () => number
    getOsType: () => number
    getClientVersion: () => number
    getWithLinkmic: () => boolean
    getEnableRoomPerspective: () => boolean
    getCover: () => Image
    getShareUrl: () => string
    getAnchorShareText: () => string
    getUserShareText: () => string
    getStreamId: () => number
    getStreamIdStr: () => string
    getMosaicStatus: () => number
    getMosaicTip: () => string
    getCellStyle: () => number
    getLuckymoneyNum: () => number
    getSunDailyIconContent: () => string
    getDistance: () => string
    getDistanceCity: () => string
    getLocation: () => string
    getRealDistance: () => string
    getCommonLabelList: () => string
    getAdminUserIds: () => number
    getOwner: () => User
    getPrivateInfo: () => string

    setId: (id: number) => void
    setIdStr: (idStr: string) => void
    setStatus: (status: number) => void
    setOwnerUserId: (ownerId: number) => void
    setTitle: (title: string) => void
    setUserCount: (count: number) => void
    setCreateTime: (createTime: number) => void
    setLinkmicLayout: (layout: number) => void
    setFinishTime: (finishTime: number) => void
    setDynamicCoverUri: (uri: string) => void
    setDynamicCoverDict: (dict: Map<number, string>) => void
    setLastPingTime: (time: number) => void
    setLiveId: (id: number) => void
    setStreamProvider: (provider: number) => void
    setOsType: (type: number) => void
    setClientVersion: (version: number) => void
    setWithLinkmic: (mic: boolean) => void
    setEnableRoomPerspective: (perspective: boolean) => void
    setCover: (cover: Image) => void
    setShareUrl: (url: string) => void
    setAnchorShareText: (text: string) => void
    setUserShareText: (text: string) => void
    setStreamId: (id: number) => void
    setStreamIdStr: (idStr: string) => void
    setMosaicStatus: (status: number) => void
    setMosaicTip: (tip: string) => void
    setCellStyle: (style: number) => void
    setLuckymoneyNum: (num: number) => void
    setSunDailyIconContent: (content: string) => void
    setDistance: (distance: string) => void
    setDistanceCity: (city: string) => void
    setLocation: (location: string) => void
    setRealDistance: (distance: string) => void
    setCommonLabelList: (list: string) => void
    setAdminUserIds: (ids: number) => void
    setOwner: (owner: User) => void
    setPrivateInfo: (info: string) => void
  }

  class Common extends ProtoObject<Common> {
    getMethod: () => string
    getMsgId: () => number
    getRoomId: () => number
    getCreateTime: () => number
    getMonitor: () => number
    getIsShowMsg: () => boolean
    getDescribe: () => string
    getDisplayText: () => Text
    getFoldType: () => number
    getAnchorFoldType: () => number
    getPriorityScore: () => number
    getLogId: () => string
    getMsgProcessFilterK: () => string
    getMsgProcessFilterV: () => string
    getUser: () => User
    getRoom: () => Room
    getAnchorFoldTypeV2: () => number
    getProcessAtSeiTimeMs: () => number

    setMethod: (method: string) => void
    setMsgId: (id: number) => void
    setRoomId: (id: number) => void
    setCreateTime: (time: number) => void
    setMonitor: (monitor: number) => void
    setIsShowMsg: (msg: boolean) => void
    setDescribe: (describe: string) => void
    setDisplayText: (text: Text) => void
    setFoldType: (type: number) => void
    setAnchorFoldType: (type: number) => void
    setPriorityScore: (score: number) => void
    setLogId: (id: string) => void
    setMsgProcessFilterK: (k: string) => void
    setMsgProcessFilterV: (v: string) => void
    setUser: (user: User) => void
    setRoom: (room: Room) => void
    setAnchorFoldTypeV2: (type: number) => void
    setProcessAtSeiTimeMs: (ms: number) => void
  }

  class PublicAreaCommon extends ProtoObject<PublicAreaCommon> {
    getUserLabel: () => Image
    getUserConsumeInRoom: () => number
    getUserSendGiftCntInRoom: () => number

    setUserLabel: (label: number) => void
    setUserConsumeInRoom: (room: number) => void
    setUserSendGiftCntInRoom: (room: number) => void
  }

  class EffectConfig extends ProtoObject<EffectConfig> {
    getType: () => number
    getIcon: () => Image
    getAvatarPos: () => number
    getText: () => Text
    getTextIcon: () => Image
    getStayTime: () => number
    getAnimAssetId: () => number
    getBadge: () => Image
    getFlexSettingArray: () => number
    getTextIconOverlay: () => Image
    getAnimatedBadge: () => Image
    getHasSweepLight: () => boolean
    getTextFlexSettingArray: () => number
    getCenterAnimAssetId: () => number

    setType: (type: number) => void
    setIcon: (icon: Image) => void
    setAvatarPos: (pos: Image) => void
    setText: (text: Text) => void
    setTextIcon: (icon: Image) => void
    setStayTime: (time: number) => void
    setAnimAssetId: (id: number) => void
    setBadge: (badge: Image) => void
    setFlexSettingArray: (array: number) => void
    setTextIconOverlay: (icon: Image) => void
    setAnimatedBadge: (icon: Image) => void
    setHasSweepLight: (light: boolean) => void
    setTextFlexSettingArray: (array: number) => void
    setCenterAnimAssetId: (id: number) => void
  }

  class RoomContributor {
    getScore: () => number
    getUser: () => User
    getRank: () => number
    getDelta: () => number
    getIsHidden: () => boolean
    getScoreDescription: () => string
    getExactlyScore: () => string

    setScore: (score: number) => void
    setUser: (user: User) => void
    setRank: (rank: number) => void
    setDelta: (delta: number) => void
    setIsHidden: (isHidden: boolean) => void
    setScoreDescription: (desc: string) => void
    setExactlyScore: (score: string) => void
  }

  class Gift extends ProtoObject<Gift> {
    getName: () => string
    getDiamondcount: () => number
  }

}

declare namespace pako {
  const deflate: (input: Uint8Array) => Uint8Array
  const inflate: (output: Uint8Array) => Uint8Array
}

declare const axios: any;

interface BytedAcrawler {
  frontierSign: (param: any) => void,
  getReferer: (param: any) => void,
  init: (param: any) => void,
  isWebmssdk: (param: any) => void,
  report: (param: any) => void,
  setConfig: (param: any) => void,
  setTTWebid: (param: any) => void,
  setTTWebidV2: (param: any) => void,
  setTTWid: (param: any) => void,
  setUserMode: (param: any) => void
}

interface Window {
  byted_acrawler: BytedAcrawler
  getSign: (roomId: string, uniqueId: string) => {
    'X-Bogus': string
  }
}


interface Mess {
  id: number,
  type: string | undefined,
  content: string,
  nickname: string,
  /**
   * 在线观众
   */
  memberCount: number,
  /**
   * 点赞数
   */
  likeCount: number,
  /**
   * 主播粉丝数
   */
  followCount: number,
  /**
   * 累计观看人数
   */
  totalUserCount: number,
  rank: RankItem[]
  gift: Gift
}

interface Gift {
  name: string,
  count: number,
  url: string,
  desc: string
}

/**
 * 送礼点赞榜
 */
interface RankItem {
  nickname: string,
  avatar: string,
  rank: number
}

declare module 'vue-virtual-scroller';
