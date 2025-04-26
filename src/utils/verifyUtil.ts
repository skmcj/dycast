/**
 * 验证房间号
 * @param value
 * @returns
 */
export function verifyRoomNum(value: string) {
  const reg = /^[0-9]{8,12}$/;
  return reg.test(value);
}

/**
 * 验证 wss 地址
 * @param value
 * @returns
 */
export function verifyWsUrl(value: string) {
  const reg = /^wss?:\/\/(?:\[[^\]]+\]|[^/:]+)(?::\d+)?(?:\/.*)?$/i;
  return reg.test(value);
}
