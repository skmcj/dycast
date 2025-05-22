import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/dylive': {
        target: 'https://live.douyin.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dylive/, ''),
        // 重要：允许接收 Set-Cookie
        configure: proxy => {
          // 拦截请求
          proxy.on('proxyReq', proxyReq => {
            // 强制修改 Referer
            proxyReq.setHeader('Referer', 'https://live.douyin.com/');
          });
          // 拦截响应
          proxy.on('proxyRes', proxyRes => {
            // 确保 set-cookie 能正常设置到当前域下
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              // 移除 Domain 或替换为当前域
              const newCookie = setCookie.map(cookie => cookie.replace(/; Domain=[^;]+/i, ''));
              proxyRes.headers['set-cookie'] = newCookie;
            }
          });
        }
      },
      '/socket': {
        target: 'wss://webcast5-ws-web-lf.douyin.com',
        changeOrigin: true, // 保持原始 Host，利于服务端识别 Cookie
        secure: true,
        ws: true, // 启用 WebSocket 代理
        rewrite: path => path.replace(/^\/socket/, '')
      }
    }
  }
});
