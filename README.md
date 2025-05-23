# 抖音弹幕姬

<p align=center>
  <a href="https://github.com/skmcj/dycast">
    <img src="https://gcore.jsdelivr.net/gh/skmcj/pic-bed/common/dydm-bg-logo.png" alt="抖音弹幕姬" style="width: 200px">
  </a>
</p>

<p align=center style="font-weight: bold;">
   抖音弹幕姬
</p>

## 简介

一个用于获取抖音直播间弹幕的小作品

用户只需要输入直播间的房间号，程序就能实时获取对应直播间的弹幕，并将其解析展示出来，用户还可通过`ws/wss`地址将获取的弹幕信息转发到自己的后端以作它用（如：弹幕互动游戏、数据分析等）

### 实现功能

- 获取直播间连接信息
- 连接直播间，获取直播间弹幕
  - 实现重连机制，能一定程度保证连接的稳定性
- 转发直播间弹幕
  - 主要为解析提取后的弹幕，通过序列化`json`的格式
- 分类展示直播间弹幕
  - 聊天弹幕(包含文本、普通表情、会员表情、合并表情等)
  - 礼物弹幕
  - 关注弹幕
  - 点赞弹幕(包含点赞数量)
  - 进入弹幕
  - 其它信息(如连接过程的一些提示)
- 展示直播间信息，如人数等

## 实现原理

主要需解决两个难点，分别为计算抖音弹幕的`wss`链接和解析接收到的二进制弹幕数据

- 计算抖音弹幕的`wss`链接

  - 进入抖音直播间，打开浏览器的网络请求面板，可看到有一个`ws`链接，其则为抖音直播间实时弹幕通信链接
  - 观察它的协议地址，主要包含一个最重要的参数`signature`，其需通过`roomId`与`uniqueId`计算得出，通过断点跟随，执行一些逆向工程，即可知道其大致的计算原理
  - 本项目将对应计算函数封装在`src/core/signature`文件内
  - 计算出`signature`参数后，再将其与前面的`roomId`与`uniqueId`整合，即可得到完整的`wss`链接
  - 之后建立链接，接收数据即可

- 解析弹幕数据

  - 成功建立链接后，会发现接收到的数据为二进制串

  - 在网上查阅资料可知，其运用技术为`protobuf`协议传输，要解析，需对应的`proto`文件

  - 相应的`proto`文件可通过进入直播间，通过一些逆向工程，模仿其背后解析的对象结构，整合出相应的`proto`文件

  - 具体可自行尝试，如没有思路，可通过一些关键词搜寻，如`PushFrame`、`WebcastChatMessage`等

  - 得出弹幕数据的`proto`文件后，使用`protoc`或其它一些工具将其编译为各种语言的文件

  - 本项目主要是编译为`ts`文件，通过`protobufjs`进行编译，并对产物进行魔改，将`Long`改为字符串

    - ```sh
      # 参考命令
      pbjs --ts model.ts model.proto
      ```
    
  - 生成的`[model.ts]`即可在项目引入使用
  
- 有了解析文件后，即可使用其解析弹幕数据。将`ws`获取到的一帧数据解析为`PushFrame`，其中的`payload`依旧为一段二进制数据，且经过了`gzip`压缩，对其进行解压后，解析为`Response`，其中的`messages`即为对应的消息数据，结构为`Message`类型，其中的`payload`解析后即为具体的弹幕消息体，主要解析类型有`ChatMessage`、`MemberMessage`、`LikeMessage`等。
  
- 以上的`PushFrame`、`··· ···`均为弹幕数据的`proto`结构，具体可自行了解

## 数据结构

包装传给后台的数据

```typescript
/** 最后的整理转发的弹幕消息结构 */
export interface DyMessage {
  // 弹幕 ID
  id?: string;
  // 弹幕类型
  method?: CastMethod;
  // 用户信息
  user?: CastUser;
  // 礼物信息(当类型为礼物弹幕时有值)
  gift?: CastGift;
  // 弹幕文本
  content?: string;
  // 富文本信息
  rtfContent?: CastRtfContent[];
  // 房间相关信息
  room?: LiveRoom;
  // 礼物排行榜信息
  rank?: LiveRankItem[];
}

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
/**
 * 送礼点赞榜
 */
export interface LiveRankItem {
  nickname: string;
  avatar: string;
  rank: number | string;
}

export interface CastUser {
  // user.sec_uid | user.id_str
  id?: string;
  // user.nickname
  name?: string;
  // user.avatar_thumb.url_list.0
  avatar?: string;
  // 性别(猜测) 0 | 1 | 2 => 未知 | 男 | 女
  gender?: number;
}

export interface CastGift {
  id?: string;
  name?: string;
  // 价值抖音币 diamond_count
  price?: number;
  type?: number;
  // 描述
  desc?: string;
  // 图片
  icon?: string;
  // 数量 repeat_count | combo_count
  count?: number | string;
  // 礼物消息可能重复发送，0 表示第一次，未重复
  repeatEnd?: number;
}

/**
 * 富文本类型
 *  1 - 普通文本
 *  2 - 合并表情
 */
export enum CastRtfContentType {
  TEXT = 1,
  EMOJI = 2
}

// 富文本
export interface CastRtfContent {
  type?: CastRtfContentType;
  text?: string;
  url?: string;
}
// 弹幕类型
export enum CastMethod {
  CHAT = 'WebcastChatMessage',
  GIFT = 'WebcastGiftMessage',
  LIKE = 'WebcastLikeMessage',
  MEMBER = 'WebcastMemberMessage',
  SOCIAL = 'WebcastSocialMessage',
  ROOM_USER_SEQ = 'WebcastRoomUserSeqMessage',
  CONTROL = 'WebcastControlMessage',
  ROOM_RANK = 'WebcastRoomRankMessage',
  ROOM_STATS = 'WebcastRoomStatsMessage',
  EMOJI_CHAT = 'WebcastEmojiChatMessage',
  FANSCLUB = 'WebcastFansclubMessage',
  ROOM_DATA_SYNC = 'WebcastRoomDataSyncMessage',
  /** 自定义消息 */
  CUSTOM = 'CustomMessage'
}
```

**注意：** 理论上，接收的原始弹幕数据包含抖音弹幕该有的全部数据，但传递给后台的目前只提取包装了以上较为重要的数据，如需其它数据，可自行研究包装修改，目标文件为`src/core/dycast.ts`

## 项目预览

完整项目演示，请移步[哔哩哔哩](https://www.bilibili.com/video/BV1Vj411c7FF/)

- 项目运行后，具体界面展示如下

  ![主界面](https://static.ltgcm.top/md/20250428180514.png)

  - 整体界面为三栏布局：左侧为直播间信息及连接状态展示；中间为主要弹幕展示；右侧为输入及其它信息展示
  - 右侧主要包含两个输入框，第一个为房间号输入框，第二个为转发地址输入框；输入带有格式验证，格式不正确无法连接
  - 弹幕展示列表右侧的一排图标按钮表示当前列表所展示的弹幕类型，点击可控制其显隐

- 在右侧房间号输入框输入房间号后，点击**连接**，等待几秒后，会在左下方状态信息展示连接结果，有时可能出现网络拥堵情况，稍后再连接即可，正常连接成功/失败均会有相应的消息通知提示，也可以看控制台输出。连接成功后，大致展示如下：

  ![结果](https://static.ltgcm.top/md/20250428181510.png)

- 此时，用户可在转发信息框填入自己的`WebSocket`服务端地址，点击**转发**，即可建立连接，将弹幕信息实时传送到所设置后端

## 部署步骤

- 项目依赖安装

    ```sh
    npm install
    ```

- 项目运行

    ```sh
    npm run dev
    ```

- 项目打包

    ```sh
    npm run build
    ```

- 项目部署到`nginx`

  ```nginx
  # 配置网络监听
  server {
      # 监听端口号，如：1234
      listen       1234;
      # 监听地址，可以是域名或ip地址，可正则书写
      server_name  localhost;
  
      location / {
          add_header Access-Control-Allow-Origin *;
          # 根目录，即项目打包内容位置(···/dist)，可以是项目的本地路径
          root   /var/dycast;
          # 配置默认主页文件
          index  index.html index.htm;
          # 配置单页面应用刷新问题，默认返回主页
          try_files $uri $uri/ /index.html;
      }
      
      # 配置接口跨域
      location /dylive {
          # proxy_pass 你要跨域的的接口地址
          proxy_pass https://live.douyin.com/;
  
          # 响应头大小
          proxy_buffer_size 64k;
          # 响应体大小 = 数量 * size
          proxy_buffers   32 64k;
          # 处于busy状态的buffer大小，一般为 proxy_buffer_size * 2
          proxy_busy_buffers_size 128k;
  
          # 修改请求头
          proxy_set_header Host live.douyin.com;
          proxy_set_header Referer 'https://live.douyin.com/';
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          # 如果需要配置移动端打开也能用
          # 需设置请求头 User-Agent，伪装 PC 端 UA，防止移动端重定向
          set $ua $http_user_agent;
          if ($http_user_agent ~* "(iphone|ipad|android|mobile)") {
              set $ua "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0";
          }
          proxy_set_header User-Agent $ua;
  
          # 处理响应 Set-Cookie
          # 确保 Set-Cookie 能正常设置到当前域下
          # 清空 Domain
          proxy_cookie_domain ~.* $host;
          # 统一 Path
          proxy_cookie_path / /;
          
          # 清除 SameSite / Secure
          # 不一定都需要设置，某些浏览器需要
          # 可借助 ngx_headers_more 模块实现
  
          # 确保 Set-Cookie 被转发到客户端
          proxy_pass_header Set-Cookie;
          
  
          # 重写路径 - 移除/dylive前缀
          rewrite ^/dylive/(.*) /$1 break;
      }
      
      location /socket {
          # Nginx 不区分 ws / wss 协议
          # WebSocket 实际上是通过 HTTP 升级实现的
          # 故使用 https:// 非 wss://
          proxy_pass https://webcast5-ws-web-lf.douyin.com/;
  
          # WebSocket 关键配置
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
  
          # 跨域相关头
          proxy_set_header Origin https://live.douyin.com;
          proxy_set_header Host webcast5-ws-web-lf.douyin.com;
  
          # 可选：保留 Cookie 头，用于认证
          proxy_set_header Cookie $http_cookie;
          
          set $ua $http_user_agent;
          if ($http_user_agent ~* "(iphone|ipad|android|mobile)") {
              set $ua "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0";
          }
          proxy_set_header User-Agent $ua;
  
          # 重写路径 - 移除/socket
          rewrite ^/socket/(.*) /$1 break;
      }
  
  }
  ```
  

## Star History

![Star History Chart](https://api.star-history.com/svg?repos=skmcj/dycast&type=Date)

## 打赏

<p align=center>
  <img src="https://static.ltgcm.top/md/20250428191027.png" alt="打赏" style="width: 350px">
</p>

<p align=center style="color: #68945c;">
   如果想支持本项目的持续维护，可以投喂UP (｀･ω･´)ゞ敬礼っ
</p>



## 免责声明

本项目仅用于学习交流使用，禁止一切非法滥用，否则后果自负