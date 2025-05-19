import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import axios from 'axios'
import { authService } from './services/auth'
import { deviceMappingManager } from './services/device-mapping-manager'

console.log('Application starting...')

// 本地存储键 - 必须与authService.ts中保持一致
const TOKEN_KEY = 'auth_token';

// 配置全局axios默认值
axios.defaults.baseURL = 'http://192.168.1.230:8080/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000;

// 配置 axios 拦截器添加 token
axios.interceptors.request.use(config => {
  // 使用authService获取token，保持一致性
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 确保Content-Type是application/json
  config.headers['Content-Type'] = 'application/json';
  
  return config;
}, error => {
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    // 处理401错误 - 未授权
    if (error.response && error.response.status === 401) {
      console.log('检测到401错误，可能需要重新登录')
      // 可以在这里添加重定向到登录页的逻辑
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)
app.use(router)
app.mount('#app')

console.log('Application mounted')
