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

一个用于获取抖音直播间弹幕的小作品。

用户只需要输入直播间的房间号，程序就能实时获取对应直播间的弹幕，并将其解析展示出来，用户还可通过`ws/wss`地址将获取的弹幕信息转发到自己的后端已作他用（如：弹幕互动游戏等）。

## 实现原理

主要需解决两个难点，分别为计算抖音弹幕的`wss`链接和解析接收到的二进制弹幕数据。

- 计算抖音弹幕的`wss`链接

  - 进入抖音直播间，打开浏览器的网络请求面板，可看到有一个`ws`链接，其则为抖音直播间实时弹幕通信链接。
  - 观察它的协议地址，主要包含一个最重要的参数`signature`，其需通过`roomId`与`uniqueId`计算得出，通过断点跟随，执行一些逆向工程，即可知道其大致的计算原理。
  - 本项目将对应计算函数封装暴露在`window.getSign(roomId, uniqueId)`函数下。
  - 计算出`signature`参数后，再将其与前面的`roomId`与`uniqueId`整合，即可得到完整的`wss`链接。
  - 之后建立链接，接收数据即可。

- 解析弹幕数据

  - 成功建立链接后，会发现接收到的数据为二进制串。

  - 在网上查阅资料可知，其运用技术为`protobuf`协议传输，要解析，需对应的`proto`文件。

  - 相应的`proto`文件可通过进入直播间，通过一些逆向工程，模仿其背后解析的对象结构，整合出相应的`proto`文件。

  - 具体可自行尝试，如没有思路，可通过一些关键词搜寻，如`PushFrame`、`WebcastChatMessage`等。

  - 得出弹幕数据的`proto`文件后，使用`protoc`将其编译为各种语言的文件。

  - 本项目主要是编译为`js`文件，并使用`browserify`二次编译为浏览器可用文件。

    - ```sh
      # 参考命令
      protoc --js_out=import_style=commonjs,binary:./ 文件名.proto
      browserify 文件名_pb.js > 自定义.js
      ```

    - 生成的`[自定义.js]`即可在浏览器引入使用。

  - 有了解析文件后，即可使用其解析弹幕数据。将`ws`获取到的一帧数据解析为`PushFrame`，其中的`payload`依旧为一段二进制数据，且经过了`gzip`压缩，对其进行解压后，解析为`Response`，其中的`MessagesList`即为对应的消息数据，结构为`Messages`类型，其中的`payload`解析后即为具体的弹幕消息体，主要解析类型有`ChatMessage`、`MemberMessage`、`LikeMessage`等。

  - 以上的`PushFrame`、`··· ···`均为弹幕数据的`proto`结构，具体可自行通过一些逆向工程解析。

## 数据结构

包装传给后台的数据

```typescript
interface Mess {
  id: number;
  /**
   * 消息类型
   * member - 进入直播间 | social - 关注主播 | chat - 文本弹幕 | gift - 礼物信息 | like - 点赞 | room - 房间统计
   */
  type: string | undefined;
  // 文本内容
  content: string;
  // from用户昵称
  nickname: string;
  /**
   * 在线观众数
   */
  memberCount: number;
  /**
   * 点赞数
   */
  likeCount: number;
  /**
   * 主播粉丝数
   */
  followCount: number;
  /**
   * 累计观看人数
   */
  totalUserCount: number;
  // 送礼、点赞排行榜信息
  rank: RankItem[];
  // 礼物信息
  gift: Gift;
}

interface Gift {
  // 礼物名称
  name: string;
  // 礼物数量
  count: number;
  // 礼物图片链接
  url: string;
  // 描述
  desc: string;
  // 礼物单个价值-抖音币
  diamondCount?: number;
}

interface RankItem {
  // 用户昵称
  nickname: string;
  // 用户头像
  avatar: string;
  // 用户排名
  rank: number;
}
```

**注意：** 理论上，接收的原始弹幕数据包含抖音弹幕该有的全部数据，但传递给后台的目前只包装了以上较为重要的数据，如需其它数据，可自行研究包装修改，目标文件为`client.ts`。

## 项目预览

完整项目演示，请移步[哔哩哔哩](https://www.bilibili.com/video/BV1Vj411c7FF/)

- 项目运行后，具体界面展示如下

  ![主界面](https://gcore.jsdelivr.net/gh/skmcj/pic-bed/common/dydm-o.png)

  - 整体界面为左右布局，左侧为操作区域，右侧为展示区域。
  - 左侧主要包含两个输入框，第一个为房间号输入框，第二个为转发地址输入框；底部房间信息主要用于连接成功后展示房间信息。
  - 右侧为连接成功后的弹幕结果展示区域

- 在左侧房间号输入框输入房间号后，点击**连接**，等待`1.5s`后，会在下方房间信息展示连接结果，有时可能出现网络拥堵情况，连接失败则再次点击连接即可，正常第二次就能成功。连接成功后，展示如下：

  ![结果](https://gcore.jsdelivr.net/gh/skmcj/pic-bed/common/dydm-c.png)

- 此时，用户可在转发信息框填入自己的`WebSocket`服务端地址，点击**转发**，即可建立连接，将弹幕信息实时传送到所设置后端。

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
  
      # 配置项目根路径资源
      location / {
          add_header Access-Control-Allow-Origin *;
          # 根目录，可以是项目的本地路径
          root   /var/dycast;
          # 配置默认主页文件
          index  index.html index.htm;
          # 配置单页面应用刷新问题，默认返回主页
          try_files $uri $uri/ /index.html;
      }
      # 配置接口跨域
      # 将 /dy/ 路径下的请求代理到 https://live.douyin.com/
      location /dy/ {
          # 响应头大小
          proxy_buffer_size 64k;
          # 响应体大小 = 数量 * size
          proxy_buffers   32 64k;
          # 处于busy状态的buffer大小，一般为 proxy_buffer_size * 2
          proxy_busy_buffers_size 128k;
          # proxy_pass 你要跨域的的接口地址
          proxy_pass https://live.douyin.com/;
      }
  }
  ```

  

## 免责声明

本项目仅用于学习交流使用，禁止一切非法滥用，否则后果自负。