axios.defaults.withCredentials = true;

/**
 * 获取房间信息
 * @param roomNumber 房间号
 */
export const getRoomInfoApi = function(roomNumber: string) {
  return axios.get(`/dy/${roomNumber}`).then((res: any) => {
    let html = res.data;
    let str = html.match(/<script id="RENDER_DATA" type="application\/json">(.*?)<\/script>/g);
    let dict = JSON.parse(decodeURIComponent(str?.[0].slice(49, -9)));
    let roomId = dict['app']['initialState']['roomStore']['roomInfo']['roomId'];
    let roomTitle = dict['app']['initialState']['roomStore']['roomInfo']["room"]['title'];
    let roomUserCount = dict['app']['initialState']['roomStore']['roomInfo']["room"]['user_count_str'];
    let uniqueId = dict['app']['odin']['user_unique_id'];
    let avatar = dict['app']['initialState']['roomStore']['roomInfo']['anchor']['avatar_thumb']['url_list'][0];
    return {
      roomId,
      roomTitle,
      roomUserCount,
      uniqueId,
      avatar
    };
  }).catch((err: any) => {
    return err;
  });
}