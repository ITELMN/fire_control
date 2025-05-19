import axios from 'axios';
import { authService } from '../auth';

// 本地存储键
const TOKEN_KEY = 'auth_token';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://192.168.1.230:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // 增加超时时间，防止网络问题
  timeout: 30000,
  // 确保发送凭证信息
  withCredentials: false,
});



// 请求拦截器添加身份验证token
apiClient.interceptors.request.use(
  (config) => {
    // 获取token的函数，避免循环依赖
    const getAuthToken = () => {
      // 从localStorage直接获取token，避免循环引用authService
      return localStorage.getItem('auth_token') || '';
    };
    
    // 使用获取token函数而不是直接从authService获取
    const token = getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // 调试信息
      console.log(`📤 API请求: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`📤 API请求未设置token: ${config.method?.toUpperCase()} ${config.url}`);
      // 尝试直接从localStorage获取token
      const forcedToken = localStorage.getItem('auth_token');
      if (forcedToken) {
        config.headers.Authorization = `Bearer ${forcedToken}`;
        console.log(`已使用localStorage token: ${forcedToken.substring(0, 10)}...`);
      }
    }
    
    // 确保Content-Type是application/json，用于所有请求
    config.headers['Content-Type'] = 'application/json';
    
    return config;
  },
  (error) => {
    console.error('API请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 标记是否正在处理401错误，避免重定向循环
let isHandlingAuthError = false;
// 上次重定向时间
let lastRedirectTime = 0;
// 最小重定向间隔(毫秒)
const MIN_REDIRECT_INTERVAL = 2000;

// 响应拦截器处理常见错误
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 API响应: ${response.config.method?.toUpperCase()} ${response.config.url} - 状态: ${response.status}`);
    return response;
  },
  (error) => {
    // 如果请求被取消，直接返回错误
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      const currentTime = Date.now();
      const errorMessage = error.response.data?.message || '未授权';
      
      console.warn(`收到401错误: ${errorMessage} - 路径: ${error.config.url}`);
      
      // 检查是否已经在处理401错误或者两次重定向间隔太短
      if (!isHandlingAuthError && (currentTime - lastRedirectTime > MIN_REDIRECT_INTERVAL)) {
        isHandlingAuthError = true;
        lastRedirectTime = currentTime;
        
        console.warn('清除当前认证状态');
        
        // 直接操作localStorage，避免调用authService
        localStorage.removeItem('auth_token');
        
        // 如果不在登录页，则重定向到登录页
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          console.log('非登录页，重定向到登录页');
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        
        // 延迟重置标记
        setTimeout(() => {
          isHandlingAuthError = false;
        }, 500);
      } else {
        // 当前已有401处理中，增加日志但不重复处理
        console.log('已有401错误处理中或两次重定向间隔太短，跳过重定向');
      }
    }
    
    // 其他API错误处理
    if (error.response) {
      // 打印详细的错误信息，便于调试
      console.error('API错误:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('网络错误，无法连接到服务器:', error.request);
      
      // 网络错误时也重定向到登录页
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !isHandlingAuthError) {
        isHandlingAuthError = true;
        console.log('网络连接失败，重定向到登录页');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        // 延迟重置标记
        setTimeout(() => {
          isHandlingAuthError = false;
        }, 500);
      }
    } else {
      // 请求设置时发生错误
      console.error('请求错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 