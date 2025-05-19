<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        设备硬件信息
      </h2>
    </div>
    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
    </div>
    <div v-else-if="error" class="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm">
      {{ error }}
    </div>
    <div v-else class="grid grid-cols-2 gap-3">
      <div class="p-3 bg-gray-50 rounded-lg border">
        <div class="text-xs text-gray-500 mb-1">Linux内核版本</div>
        <div class="font-medium text-sm">{{ hardwareInfo.kernel || '未知' }}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg border">
        <div class="text-xs text-gray-500 mb-1">设备型号</div>
        <div class="font-medium text-sm">{{ hardwareInfo.board || '未知' }}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg border">
        <div class="text-xs text-gray-500 mb-1">无线模块型号</div>
        <div class="font-medium text-sm">{{ hardwareInfo.cellular || '未安装' }}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg border">
        <div class="text-xs text-gray-500 mb-1">WIFI模块型号</div>
        <div class="font-medium text-sm">{{ hardwareInfo.wifi || '未安装' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { hardwareApi, type HardwareInfo, type TemperatureInfo } from '../services/api/hardware'

const loading = ref(false)
const error = ref('')
const tempError = ref('')

// 硬件信息
const hardwareInfo = ref<HardwareInfo>({
  kernel: '',
  board: '',
  cellular: '',
  wifi: ''
})

// 刷新硬件信息
async function refreshHardwareInfo() {
  loading.value = true;
  error.value = '';
  
  try {
    // 调用API服务获取硬件信息
    const info = await hardwareApi.getInfo();
    hardwareInfo.value = info;
  } catch (err) {
    error.value = '获取硬件信息失败，请稍后重试';
    console.error('获取硬件信息失败:', err);
  } finally {
    loading.value = false;
  }
}

// 组件挂载时获取初始数据
onMounted(async () => {
  // 获取硬件信息
  await refreshHardwareInfo();
});
</script>

