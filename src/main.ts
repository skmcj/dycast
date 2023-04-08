import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VirtualScroller from 'vue-virtual-scroller'

const app = createApp(App);

app.use(VirtualScroller);

app.mount('#app')
