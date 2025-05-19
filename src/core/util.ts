import type { DyLiveInfo } from './dycast';

/**
 * 解析直播间信息
 * @param html
 * @returns
 */
export const parseLiveHtml_old = function (html: string): DyLiveInfo | null {
  try {
    const matchRes = html.match(
      /<script\snonce="\S+?"\s>self\.__pace_f\.push\(\[1,"[a-z]?:\[\\"\$\\",\\"\$L\d+\\",null,([\s\S]+?state[\s\S]+?)\]\\n"\]\)<\/script>/
    );
    const REGLIST = [
      {
        reg: /\\{1,7}"/g,
        str: '"'
      },
      {
        reg: /"\{/g,
        str: '{'
      },
      {
        reg: /\}"/g,
        str: '}'
      },
      {
        reg: /"\[(.*)]\"/g,
        str: '[$1]'
      },
      {
        reg: /([^:,{\[])(")([^:,}\]])/g,
        str: '$1"$3'
      }
    ];
    if (!matchRes) return null;
    let json: string = matchRes[1];
    for (const REG of REGLIST) {
      json = json.replace(REG.reg, REG.str);
    }
    const data = JSON.parse(json);
    return {
      roomId: data['state']['roomStore']['roomInfo']['roomId'],
      uniqueId: data['state']['userStore']['odin']['user_unique_id'],
      avatar: data['state']['roomStore']['roomInfo']['anchor']?.['avatar_thumb']?.['url_list'][0],
      cover: data['state']['roomStore']['roomInfo']['room']?.['cover']?.['url_list'][0],
      nickname: data['state']['roomStore']['roomInfo']['anchor']['nickname'],
      title: data['state']['roomStore']['roomInfo']['room']['title'],
      status: data['state']['roomStore']['roomInfo']['room']['status']
    };
  } catch (err) {
    return null;
  }
};

/**
 * 解析直播间信息
 * @param html
 * @returns
 */
export const parseLiveHtml = function (html: string): DyLiveInfo | null {
  try {
    const matchRes = html.match(
      /<script\snonce="\S+?"\s>self\.__pace_f\.push\(\[1,"[a-z]?:\[\\"\$\\",\\"\$L\d+\\",null,([\s\S]+?state[\s\S]+?)\]\\n"\]\)<\/script>/
    );
    if (!matchRes) return null;
    let json: string = matchRes[1];
    const REGMAP: Record<string, RegExp> = {
      roomId: /{"state":{[\s\S]*?"roomStore":{[\s\S]*?"roomInfo":{[\s\S]*?"roomId":"([0-9]+?)"/,
      uniqueId: /{"state":{[\s\S]*?"userStore":{[\s\S]*?"odin":{[\s\S]*?"user_unique_id":"([0-9]+?)"/,
      avatar:
        /{"state":{[\s\S]*?"roomStore":{[\s\S]*?"roomInfo":{[\s\S]*?"anchor":{[\s\S]*?"avatar_thumb":{[\s\S]*?"url_list":\["([\S]+?)"/,
      cover:
        /{"state":{[\s\S]*?"roomStore":{[\s\S]*?"roomInfo":{[\s\S]*?"room":{[\s\S]*?"cover":{[\s\S]*?"url_list":\["([\S]+?)"/,
      nickname: /{"state":{[\s\S]*?"roomStore":{[\s\S]*?"roomInfo":{[\s\S]*?"anchor":{[\s\S]*?"nickname":"([\s\S]+?)"/,
      title: /{"state":{[\s\S]*?"roomStore":{[\s\S]*?"roomInfo":{[\s\S]*?"room":{[\s\S]*?"title":"([\s\S]+?)"/,
      status: /{"state":{[\s\S]*?"roomStore":{[\s\S]*?"roomInfo":{[\s\S]*?"room":{[\s\S]*?"status":([0-9]{1})/
    };
    function extractJsonField(name: string, json: string) {
      const reg = REGMAP[name];
      let res: string = '';
      if (reg) {
        const exec = reg.exec(json);
        if (exec) res = exec[1];
      }
      return res;
    }
    function decodeUnicodeUrl(url: string) {
      if (url) return url.replace(/\\u0026/g, '&');
      else return url;
    }
    json = json.replace(/\\{1,7}"/g, '"');
    const roomId = extractJsonField('roomId', json);
    const uniqueId = extractJsonField('uniqueId', json);
    const avatar = extractJsonField('avatar', json);
    const cover = extractJsonField('cover', json);
    const nickname = extractJsonField('nickname', json);
    const title = extractJsonField('title', json);
    const status = extractJsonField('status', json);
    return {
      roomId,
      uniqueId,
      avatar: decodeUnicodeUrl(avatar),
      cover: decodeUnicodeUrl(cover),
      nickname,
      title,
      status: parseInt(status || '4')
    };
  } catch (err) {
    return null;
  }
};

/**
 * 将对象化成请求参数字符串
 *  - 如：item1=value1&item2=value2&...
 * @param params 请求参数对象
 * @returns
 */
export const makeUrlParams = function (params: any): string {
  return Object.keys(params).reduce((t, n) => {
    let r;
    return `${t}${t ? '&' : ''}${n}=${null != (r = params[n]) ? r : ''}`;
  }, '');
};
