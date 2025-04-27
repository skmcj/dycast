import type { DyLiveInfo } from './dycast';

/**
 * 解析直播间信息
 * @param html
 * @returns
 */
export const parseLiveHtml = function (html: string): DyLiveInfo | null {
  try {
    const matchRes = html.match(
      /<script\snonce="\S+?"\s>self\.__pace_f\.push\(\[1,"[a-z]?:\[\\"\$\\",\\"\$L\d+\\",null,([\s\S]+?)\]\\n"\]\)<\/script>/
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
