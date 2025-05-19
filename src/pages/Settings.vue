<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="max-w-4xl mx-auto mt-24 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6">常规设置</h1>

        <div class="mb-8">
          <div class="flex items-center mb-4">
            <label class="text-gray-700 font-medium w-24 text-right mr-4">主题色：</label>
            <div class="flex gap-3">
              <button v-for="(color, index) in themeColors" :key="index" :style="{ backgroundColor: color.value }"
                @click="changeThemeColor(color.value)"
                class="w-12 h-12 rounded-md hover:ring-2 hover:ring-offset-2 transition-all flex items-center justify-center"
                :class="{ 'ring-2 ring-offset-2 ring-blue-500': currentThemeColor === color.value }">
                <svg v-if="currentThemeColor === color.value" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>


          <div class="flex items-center mt-8 mb-4">
            <label class="text-gray-700 font-medium w-24 text-right mr-4">新密码：</label>
            <input type="password" v-model="newPassword" placeholder="********"
              class="border border-gray-300 rounded-md px-3 py-2 bg-gray-100 w-64" />
          </div>

          <div class="flex justify-center mt-8">
            <button @click="saveSettings" class="px-8 py-2 rounded-md text-white hover:shadow-md transition-colors"
              :style="{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color-dark)' }">
              保存修改
            </button>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-6 mt-6">
          <div class="flex justify-center">
            <button @click="logout"
              class="bg-zinc-800/30 text-white px-6 py-2 rounded-md hover:bg-zinc-800 transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import { authService } from '../services/auth';
const router = useRouter();
const newPassword = ref('');
const currentThemeColor = ref('#0D47A1');

const themeColors = [
  { name: '深蓝', value: '#0D47A1' },
  { name: '深红', value: '#B71C1C' },
  { name: '紫色', value: '#7c3aed' },
  { name: '绿色', value: '#16a34a' },
  { name: '橙色', value: '#E65100' },
  { name: '黄色', value: '#eab308' },
  { name: '蓝色', value: '#0ea5e9' },
  { name: '粉色', value: '#e879f9' },
  { name: '灰色', value: '#6b7280' },
  { name: '黑色', value: '#0a0a0a' },
  { name: '青色', value: '#14b8a6' },
];

onMounted(() => {
  // 从localStorage读取保存的主题色，如果有的话
  const savedColor = localStorage.getItem('themeColor');
  if (savedColor) {
    currentThemeColor.value = savedColor;
  }
});

function changeThemeColor(color: string) {
  currentThemeColor.value = color;
  // 利用App.vue中定义的全局主题应用函数
  // @ts-ignore - 这个函数在App.vue中定义，会在全局作用域中可用
  window.applyThemeColor(color);
}

function saveSettings() {
  // 保存主题色到localStorage
  localStorage.setItem('themeColor', currentThemeColor.value);

  // 如果输入了新密码，则更新密码
  if (newPassword.value) {
    const username = localStorage.getItem('username') || 'admin'; // Default to 'admin' if not found
    authService.changePassword(username, newPassword.value)
      .then((response) => {
        // 设置新token到localStorage
        localStorage.setItem('auth_token', response.token);
        alert('密码修改成功，设置已保存！');
        newPassword.value = '';
      })
      .catch(error => {
        console.error('密码更新失败', error);
        let errorMessage = '密码更新失败';
        if (error.response) {
          // 根据API文档中定义的错误码处理不同情况
          if (error.response.status === 400) {
            errorMessage += '，请求格式错误';
          } else if (error.response.status === 401) {
            errorMessage += '，认证令牌无效';
          } else if (error.response.status === 404) {
            errorMessage += '，用户不存在';
          }
        }
        alert(errorMessage + '，请重试！');
      });
  } else {
    alert('设置已保存！');
  }
}

function logout() {
  authService.logout();
  localStorage.removeItem('username');
  router.push('/login');
}
</script>
