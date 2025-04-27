import type { DyImInfo } from './dycast';
import { decodeResponse } from './model';
import { getMsToken } from './signature';
import { makeUrlParams, parseLiveHtml } from './util';

/**
 * 请求直播间信息
 */
export const fetchLiveInfo = async function (id: string) {
  try {
    const html = await fetch(`/dylive/${id}`).then(res => res.text());
    return html;
  } catch (err) {
    return Promise.reject(Error('Fetch Live Info Error'));
  }
};

/**
 * 获取直播间信息
 * @param id 房间号
 * @returns
 */
export const getLiveInfo = async function (id: string) {
  try {
    const html = await fetchLiveInfo(id);
    const first = parseLiveHtml(html);
    if (first) return first;
    else {
      // 如第一次请求无 cookie => __ac_nonce，无法获得目标信息
      // 但第一次请求会返回 cookie => __ac_nonce
      // 请求第二次
      const realHtml = await fetchLiveInfo(id);
      const second = parseLiveHtml(realHtml);
      if (second) return second;
      else throw new Error('Get Live Info Error');
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

const USER_AGENT =
  navigator.userAgent ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
const BROWSER_VERSION =
  navigator.appVersion ||
  '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
const BROWSER_NAME = navigator.appCodeName || 'Mozilla';
const VERSION_CODE = 180800;

/**
 * 接口默认参数
 *  - /webcast/im/fetch
 */
const defaultIMFetchParams = {
  aid: 6383,
  app_name: 'douyin_web',
  browser_language: 'zh-CN',
  browser_name: BROWSER_NAME,
  browser_online: true,
  browser_platform: 'Win32',
  browser_version: BROWSER_VERSION,
  cookie_enabled: true,
  cursor: '',
  device_id: '',
  device_platform: 'web',
  did_rule: 3,
  endpoint: 'live_pc',
  fetch_rule: 1,
  identity: 'audience',
  insert_task_id: '',
  internal_ext: '',
  last_rtt: 0,
  live_id: 1,
  live_reason: '',
  need_persist_msg_count: 15,
  resp_content_type: 'protobuf',
  screen_height: 1080,
  screen_width: 1920,
  support_wrds: 1,
  tz_name: 'Asia/Shanghai',
  version_code: VERSION_CODE
};

/**
 * 请求初次连接信息
 *  - im/fetch
 * @param roomId
 * @param uniqueId
 * @param roomNum 房间号；暂不需要
 */
export const fetchImInfo = async function (roomId: string, uniqueId: string) {
  // 请求需要一些关键参数：msToken、a_bogus
  // 请求成功后会响应 protobuf 二进制数据，解码为 model 的 Response 类型
  // 主要需要里面的 cursor、internal_ext 值
  try {
    const msToken = getMsToken(184);
    const params = Object.assign({}, defaultIMFetchParams, {
      msToken,
      room_id: roomId,
      user_unique_id: uniqueId
    });
    // 一个加密参数，须通过上侧 params 参数计算，感兴趣自己去逆向，这里不解析，不一定验证
    const aBogus = '00000000';
    Object.assign(params, {
      live_pc: roomId,
      a_bogus: aBogus
    });
    const url = `/dylive/webcast/im/fetch/?${makeUrlParams(params)}`;
    // 不清楚接口是否有 referer 验证，需要的话，得在服务器跨域配置处设置，这里配置无效
    // const headers = {
    //   Referer: `https://live.douyin.com/${roomNum}`
    // };
    const buffer = await fetch(url).then(res => res.arrayBuffer());
    return buffer;
  } catch (err) {
    return Promise.reject(Error('Fetch Im Info Error'));
  }
};

/**
 * 获取初次连接信息
 * @param roomId
 * @param uniqueId
 * @returns
 */
export const getImInfo = async function (roomId: string, uniqueId: string): Promise<DyImInfo> {
  const reqMs = Date.now();
  try {
    const buffer = await fetchImInfo(roomId, uniqueId);
    // 请求出错返回的可能为json
    const res = decodeResponse(new Uint8Array(buffer));
    return {
      cursor: res.cursor,
      internalExt: res.internalExt,
      now: res.now,
      pushServer: res.pushServer,
      fetchInterval: res.fetchInterval,
      fetchType: res.fetchType,
      liveCursor: res.liveCursor
    };
  } catch (err) {
    const now = Date.now();
    // 确保能返回 cursor、internalExt
    return {
      cursor: `r-7497180536918546638_d-1_u-1_fh-7497179772733760010_t-${now}`,
      internalExt: `internal_src:dim|wss_push_room_id:${roomId}|wss_push_did:${uniqueId}|first_req_ms:${reqMs}|fetch_time:${now}|seq:1|wss_info:0-${now}-0-0|wrds_v:7497180515443673855`
    };
  }
};
