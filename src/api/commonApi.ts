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
        /<script\snonce="\S+?"\s>self\.__pace_f\.push\(\[1,"[a-z]?:\[\\"\$\\",\\"\$L\d+\\",null,([\s\S]+?)\]\\n"\]\)<\/script>/
      );
      let json: string = matchRes[1];
      function removeEscapes(jsonString: string) {
        // 使用正则表达式去除转义的双引号和反斜杠
        return jsonString.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }
      const dict = JSON.parse(removeEscapes(json));
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
