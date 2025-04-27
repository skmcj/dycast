const stringToBytes = function (t) {
    t = decodeURIComponent(encodeURIComponent(t));
    let n = [];
    for (let e = 0; e < t.length; e++) n.push(255 & t.charCodeAt(e));
    return n;
  },
  bytesToString = function (t) {
    let n = [];
    for (let e = 0; e < t.length; e++) n.push(String.fromCharCode(t[e]));
    return n.join('');
  },
  bytesToWords = function (t) {
    let n = [];
    for (let e = 0, p = 0; e < t.length; e++, p += 8) n[p >>> 5] |= t[e] << (24 - (p % 32));
    return n;
  },
  wordsToBytes = function (t) {
    let n = [];
    for (let e = 0; e < 32 * t.length; e += 8) n.push((t[e >>> 5] >>> (24 - (e % 32))) & 255);
    return n;
  },
  bytesToHex = function (t) {
    let n = [];
    for (let e = 0; e < t.length; e++) n.push((t[e] >>> 4).toString(16)), n.push((15 & t[e]).toString(16));
    return n.join('');
  },
  _ff = function (t, n, e, p, r, o, i) {
    var u = t + ((n & e) | (~n & p)) + (r >>> 0) + i;
    return ((u << o) | (u >>> (32 - o))) + n;
  },
  _gg = function (t, n, e, p, r, o, i) {
    var u = t + ((n & p) | (e & ~p)) + (r >>> 0) + i;
    return ((u << o) | (u >>> (32 - o))) + n;
  },
  _hh = function (t, n, e, p, r, o, i) {
    var u = t + (n ^ e ^ p) + (r >>> 0) + i;
    return ((u << o) | (u >>> (32 - o))) + n;
  },
  _ii = function (t, n, e, p, r, o, i) {
    var u = t + (e ^ (n | ~p)) + (r >>> 0) + i;
    return ((u << o) | (u >>> (32 - o))) + n;
  },
  rotl = function (t, n) {
    return (t << n) | (t >>> (32 - n));
  },
  endian = function (t) {
    if (t.constructor == Number) return (16711935 & rotl(t, 8)) | (4278255360 & rotl(t, 24));
    for (let n = 0; n < t.length; n++) t[n] = endian(t[n]);
    return t;
  };
function un(t, n) {
  t = stringToBytes(t);
  let e = bytesToWords(t),
    r = 8 * t.length,
    o = 1732584193,
    i = -271733879,
    u = -1732584194,
    l = 271733878;
  for (let t = 0; t < e.length; t++)
    e[t] = (16711935 & ((e[t] << 8) | (e[t] >>> 24))) | (4278255360 & ((e[t] << 24) | (e[t] >>> 8)));
  (e[r >>> 5] |= 128 << r % 32), (e[14 + (((r + 64) >>> 9) << 4)] = r);
  let f = _ff,
    s = _gg,
    c = _hh,
    d = _ii;
  for (let p = 0; p < e.length; p += 16) {
    let g = o,
      _ = i,
      h = u,
      a = l;
    (o = d(
      (o = c(
        (o = c(
          (o = c(
            (o = c(
              (o = s(
                (o = s(
                  (o = s(
                    (o = s(
                      (o = f(
                        (o = f(
                          (o = f(
                            (o = f(o, i, u, l, e[p + 0], 7, -680876936)),
                            (i = f(
                              i,
                              (u = f(u, (l = f(l, o, i, u, e[p + 1], 12, -389564586)), o, i, e[p + 2], 17, 606105819)),
                              l,
                              o,
                              e[p + 3],
                              22,
                              -1044525330
                            )),
                            u,
                            l,
                            e[p + 4],
                            7,
                            -176418897
                          )),
                          (i = f(
                            i,
                            (u = f(u, (l = f(l, o, i, u, e[p + 5], 12, 1200080426)), o, i, e[p + 6], 17, -1473231341)),
                            l,
                            o,
                            e[p + 7],
                            22,
                            -45705983
                          )),
                          u,
                          l,
                          e[p + 8],
                          7,
                          1770035416
                        )),
                        (i = f(
                          i,
                          (u = f(u, (l = f(l, o, i, u, e[p + 9], 12, -1958414417)), o, i, e[p + 10], 17, -42063)),
                          l,
                          o,
                          e[p + 11],
                          22,
                          -1990404162
                        )),
                        u,
                        l,
                        e[p + 12],
                        7,
                        1804603682
                      )),
                      (i = f(
                        i,
                        (u = f(u, (l = f(l, o, i, u, e[p + 13], 12, -40341101)), o, i, e[p + 14], 17, -1502002290)),
                        l,
                        o,
                        e[p + 15],
                        22,
                        1236535329
                      )),
                      u,
                      l,
                      e[p + 1],
                      5,
                      -165796510
                    )),
                    (i = s(
                      i,
                      (u = s(u, (l = s(l, o, i, u, e[p + 6], 9, -1069501632)), o, i, e[p + 11], 14, 643717713)),
                      l,
                      o,
                      e[p + 0],
                      20,
                      -373897302
                    )),
                    u,
                    l,
                    e[p + 5],
                    5,
                    -701558691
                  )),
                  (i = s(
                    i,
                    (u = s(u, (l = s(l, o, i, u, e[p + 10], 9, 38016083)), o, i, e[p + 15], 14, -660478335)),
                    l,
                    o,
                    e[p + 4],
                    20,
                    -405537848
                  )),
                  u,
                  l,
                  e[p + 9],
                  5,
                  568446438
                )),
                (i = s(
                  i,
                  (u = s(u, (l = s(l, o, i, u, e[p + 14], 9, -1019803690)), o, i, e[p + 3], 14, -187363961)),
                  l,
                  o,
                  e[p + 8],
                  20,
                  1163531501
                )),
                u,
                l,
                e[p + 13],
                5,
                -1444681467
              )),
              (i = s(
                i,
                (u = s(u, (l = s(l, o, i, u, e[p + 2], 9, -51403784)), o, i, e[p + 7], 14, 1735328473)),
                l,
                o,
                e[p + 12],
                20,
                -1926607734
              )),
              u,
              l,
              e[p + 5],
              4,
              -378558
            )),
            (i = c(
              i,
              (u = c(u, (l = c(l, o, i, u, e[p + 8], 11, -2022574463)), o, i, e[p + 11], 16, 1839030562)),
              l,
              o,
              e[p + 14],
              23,
              -35309556
            )),
            u,
            l,
            e[p + 1],
            4,
            -1530992060
          )),
          (i = c(
            i,
            (u = c(u, (l = c(l, o, i, u, e[p + 4], 11, 1272893353)), o, i, e[p + 7], 16, -155497632)),
            l,
            o,
            e[p + 10],
            23,
            -1094730640
          )),
          u,
          l,
          e[p + 13],
          4,
          681279174
        )),
        (i = c(
          i,
          (u = c(u, (l = c(l, o, i, u, e[p + 0], 11, -358537222)), o, i, e[p + 3], 16, -722521979)),
          l,
          o,
          e[p + 6],
          23,
          76029189
        )),
        u,
        l,
        e[p + 9],
        4,
        -640364487
      )),
      (i = c(
        i,
        (u = c(u, (l = c(l, o, i, u, e[p + 12], 11, -421815835)), o, i, e[p + 15], 16, 530742520)),
        l,
        o,
        e[p + 2],
        23,
        -995338651
      )),
      u,
      l,
      e[p + 0],
      6,
      -198630844
    )),
      (i = d(
        (i = d(
          (i = d(
            (i = d(
              i,
              (u = d(u, (l = d(l, o, i, u, e[p + 7], 10, 1126891415)), o, i, e[p + 14], 15, -1416354905)),
              l,
              o,
              e[p + 5],
              21,
              -57434055
            )),
            (u = d(
              u,
              (l = d(l, (o = d(o, i, u, l, e[p + 12], 6, 1700485571)), i, u, e[p + 3], 10, -1894986606)),
              o,
              i,
              e[p + 10],
              15,
              -1051523
            )),
            l,
            o,
            e[p + 1],
            21,
            -2054922799
          )),
          (u = d(
            u,
            (l = d(l, (o = d(o, i, u, l, e[p + 8], 6, 1873313359)), i, u, e[p + 15], 10, -30611744)),
            o,
            i,
            e[p + 6],
            15,
            -1560198380
          )),
          l,
          o,
          e[p + 13],
          21,
          1309151649
        )),
        (u = d(
          u,
          (l = d(l, (o = d(o, i, u, l, e[p + 4], 6, -145523070)), i, u, e[p + 11], 10, -1120210379)),
          o,
          i,
          e[p + 2],
          15,
          718787259
        )),
        l,
        o,
        e[p + 9],
        21,
        -343485551
      )),
      (o = (o + g) >>> 0),
      (i = (i + _) >>> 0),
      (u = (u + h) >>> 0),
      (l = (l + a) >>> 0);
  }
  return endian([o, i, u, l]);
}
function getSTUB(t) {
  let n = wordsToBytes(un(t));
  return bytesToHex(n);
}

/**
 * 获取链接签名
 * @param {string} roomId
 * @param {string} uniqueId
 * @return {string} signature
 */
export const getSignature = function (roomId, uniqueId) {
  const sdkVersion = '1.0.14-beta.0';
  const e = getSTUB(
    `live_id=1,aid=6383,version_code=180800,webcast_sdk_version=${sdkVersion},room_id=${roomId},sub_room_id=,sub_channel_id=,did_rule=3,user_unique_id=${uniqueId},device_platform=web,device_type=,ac=,identity=audience`
  );
  // 也可以自己去文件内把 frontierSign 代码提取出来
  // 之前提取过，但这里就不放出来了，感兴趣自己尝试
  const res = window.byted_acrawler.frontierSign({
    'X-MS-STUB': e
  });
  return res['X-Bogus'] || '';
};

/**
 * 获取一个 msToken
 *  - 这里只是模拟，不一定准确，实际是通过请求响应的 cookie 获取
 * @param {number} length
 * @returns
 */
export const getMsToken = function (length = 182) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
