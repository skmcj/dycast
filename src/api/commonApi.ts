axios.defaults.withCredentials = true;

/**
 * 获取房间信息
 * @param roomNumber 房间号
 */
export const getRoomInfoApi = function (roomNumber: string) {
  return axios
    .get(`/dy/${roomNumber}`)
    .then((res: any) => {
      let html = res.data;
      const matchRes = html.match(
        /<script\snonce=\"\S+?\"\s>self\.__pace_f\.push\(\[1,\"c:\[\\\"\$\\\",\\\"\$L13\\\",null,([\s\S]+?)]\\n\"\]\)<\/script>/
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
        }
      ];
      if (!matchRes) throw new Error('房间信息获取失败');
      // 获取目标信息编码字符串，替换其中的转义字符
      let json: string = matchRes[1];
      for (const REG of REGLIST) {
        json = json.replace(REG.reg, REG.str);
      }
      // let dict = JSON.parse(decodeURIComponent(matchRes[1]));
      const dict = JSON.parse(json);
      let roomId = dict['state']['roomStore']['roomInfo']['roomId'];
      let roomTitle = dict['state']['roomStore']['roomInfo']['room']['title'];
      let roomUserCount = dict['state']['roomStore']['roomInfo']['room']['user_count_str'];
      let uniqueId = dict['state']['userStore']['odin']['user_unique_id'];
      let avatar = dict['state']['roomStore']['roomInfo']['anchor']['avatar_thumb']['url_list'][0];
      return {
        roomId,
        roomTitle,
        roomUserCount,
        uniqueId,
        avatar
      };
    })
    .catch((err: any) => {
      return err;
    });
};
