<template>
  <div class="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8" :style="loginBackgroundStyle">
    <div class="max-w-md w-full mx-auto">
      <!-- 徽标和标题 -->
      <div class="flex flex-col items-center mb-10">
        <div class="text-white mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <h2 class="text-center text-3xl font-bold text-white">
          智慧消防IoT网关
        </h2>
        <h3 class="mt-3 text-center text-xl text-white">
          欢迎登录
        </h3>
      </div>
      
      <!-- 登录表单 -->
      <div class="bg-white py-8 px-6 shadow-lg rounded-lg">
        <form class="space-y-6" @submit.prevent="handleLogin">
          
          <!-- 密码输入框 -->
          <div>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none block w-full px-3 py-4 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none text-center text-lg input-themed"
              placeholder="密码"
              ref="passwordInput"
              @keyup.enter="handleLogin"
              autofocus
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- 成功提示 -->
          <div v-if="loginSuccess" class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">登录成功，正在跳转...</p>
              </div>
            </div>
          </div>

          <!-- 登录按钮 -->
          <div>
            <button
              type="submit"
              :disabled="loading || loginSuccess"
              class="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white transition-all"
              :class="{'opacity-70': loading || loginSuccess}"
              :style="loginButtonStyle"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? '登录中...' : (loginSuccess ? '跳转中...' : '登录') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';

const router = useRouter();
// 固定用户名为admin
const username = ref('admin');
const password = ref('');
const loading = ref(false);
const error = ref('');
const loginSuccess = ref(false);
const passwordInput = ref<HTMLInputElement | null>(null);
const themeColor = ref('');

// 计算背景样式
const loginBackgroundStyle = computed(() => {
  const color = themeColor.value || '#FF5722'; // 默认使用系统主题色
  
  // 计算渐变的深色和浅色变种
  const darkerColor = adjustColorBrightness(color, -30);
  
  return {
    background: `linear-gradient(to bottom, ${color}, ${darkerColor})`,
  };
});

// 计算登录按钮样式
const loginButtonStyle = computed(() => {
  const color = themeColor.value || '#FF5722'; // 默认使用系统主题色
  const hoverColor = adjustColorBrightness(color, -20);
  
  return {
    backgroundColor: color,
    borderColor: hoverColor,
    // 添加hover效果
    '--hover-bg': hoverColor,
  };
});

// 辅助函数：调整颜色明度
function adjustColorBrightness(hex: string, percent: number): string {
  // 简单的颜色亮度调整算法
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 当组件挂载时检查是否已经认证，如是则直接跳转
onMounted(() => {
  // 从localStorage读取保存的主题色
  const savedColor = localStorage.getItem('themeColor');
  if (savedColor) {
    themeColor.value = savedColor;
    // 设置CSS变量用于输入框聚焦效果
    document.documentElement.style.setProperty('--login-focus-color', savedColor);
    // 提取HEX颜色并转换为RGB以便于使用rgba
    const r = parseInt(savedColor.substring(1, 3), 16);
    const g = parseInt(savedColor.substring(3, 5), 16);
    const b = parseInt(savedColor.substring(5, 7), 16);
    document.documentElement.style.setProperty('--login-focus-rgb', `${r}, ${g}, ${b}`);
  } else {
    // 使用默认颜色
    document.documentElement.style.setProperty('--login-focus-color', '#FF5722');
    document.documentElement.style.setProperty('--login-focus-rgb', '255, 87, 34');
  }
  
  // 检查是否已经登录，如果已登录则直接跳转到仪表盘
  if (authService.isAuthenticated()) {
    console.log('用户已登录，直接跳转到仪表盘');
    router.push('/dashboard');
    return;
  }
  
  // 如果未登录，聚焦密码输入框
  if (passwordInput.value) {
    passwordInput.value.focus();
  }
});

const handleLogin = async () => {
  if (!password.value) {
    error.value = '请输入密码';
    if (passwordInput.value) {
      passwordInput.value.focus();
    }
    return;
  }
  
  if (loading.value || loginSuccess.value) {
    return; // 防止重复提交
  }
  
  try {
    loading.value = true;
    error.value = '';
    loginSuccess.value = false;
    
    // 使用固定的admin用户名和用户输入的密码登录
    const response = await authService.login({
      username: 'admin', // 固定为admin
      password: password.value,
    });
    
    if (response.token) {
      console.log('登录成功，准备跳转到仪表盘');
      loginSuccess.value = true;
      
      // 触发登录成功事件，用于设备映射自动执行
      document.dispatchEvent(new Event('login-success'));
      
      // 登录成功后延迟跳转，避免可能的冲突
      setTimeout(() => {
        // 登录成功，跳转到仪表盘页面
        router.push('/dashboard').catch(err => {
          console.error('无法跳转到仪表盘:', err);
          error.value = '跳转失败，请刷新页面重试';
          loginSuccess.value = false;
        });
      }, 1000);
    } else {
      error.value = '登录失败，请重试';
    }
  } catch (err: any) {
    console.error('登录失败:', err);
    loginSuccess.value = false;
    
    // 显示适当的错误信息
    if (err.response) {
      if (err.response.status === 401) {
        error.value = '密码错误';
      } else if (err.response.status === 404) {
        error.value = 'API端点不存在，请检查服务器配置';
      } else if (err.response.data?.message) {
        error.value = err.response.data.message;
      } else {
        error.value = `服务器错误: ${err.response.status}`;
      }
    } else if (err.request) {
      error.value = '无法连接到服务器，请检查网络和服务器地址';
    } else {
      error.value = err.message || '登录失败，请检查密码';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 登录按钮hover效果 */
button[type="submit"]:hover:not(:disabled) {
  background-color: var(--hover-bg) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button[type="submit"]:active:not(:disabled) {
  transform: translateY(0);
}

/* 主题化输入框 */
.input-themed:focus {
  border-color: var(--login-focus-color) !important;
  box-shadow: 0 0 0 3px rgba(var(--login-focus-rgb), 0.2) !important;
}

/* 其他样式 */
</style>



