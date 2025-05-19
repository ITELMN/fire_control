<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
    <Header />
    <div class="max-w-7xl 3xl:max-w-8xl 4xl:max-w-9xl mx-auto px-4 py-2 3xl:py-4 4xl:py-6">
      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 3xl:gap-6 4xl:gap-8">
        <!-- 左侧区域：系统连接拓扑图 -->
        <div class="col-span-1 backdrop-blur-lg bg-white/70 p-4 3xl:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white/50">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg 3xl:text-xl 4xl:text-2xl font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 3xl:h-6 3xl:w-6 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              设备连接状态
            </h2>
            <button class="px-3 py-1.5 3xl:px-4 3xl:py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color-dark)] transition-colors shadow-md flex items-center" @click="refreshTopology">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新状态
            </button>
          </div>
          <div class="text-right text-sm 3xl:text-base text-gray-600 mb-2 flex items-center justify-end">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ currentDateTime }}
          </div>
          <div class="h-100 3xl:h-130 4xl:h-150 chart-wrapper">
            <!-- 使用RelationshipChart组件 -->
            <RelationshipChart 
              ref="relationshipChartRef" 
              :device-counts="[3, 1, 3]" 
              :scale="1.25"
              :font-size="14"
              :node-size="50"
            />
          </div>
        </div>

        <!-- 右侧区域：通信速率和按钮 -->
        <div class="col-span-1 space-y-4 3xl:space-y-6">
          <!-- MQTT通信速率 -->
          <div class="backdrop-blur-lg bg-white/70 p-4 3xl:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white/50">
            <div class="h-52 3xl:h-64 4xl:h-72 relative">
              <CommunicationChart 
                title="MQTT通信速率"
                color="#1E40AF"
                :max-value="500"
                unit="b/s"
                :communication-service="apiRatesMqttService"
              />
            </div>
          </div>

          <!-- 插件通信速率 -->
          <div class="backdrop-blur-lg bg-white/70 p-4 3xl:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white/50">
            <div class="h-52 3xl:h-64 4xl:h-72 relative">
              <CommunicationChart 
                title="插件通信速率"
                color="#7C3AED"
                :max-value="500"
                unit="b/s"
                :communication-service="apiRatesModbusService"
              />
            </div>
          </div>
        </div>

        <!-- 第三行：设备信息和温度 -->
        <div class="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 3xl:gap-6 mt-2 3xl:mt-4">
          <!-- 集成Hardware组件 -->
          <div class="backdrop-blur-lg bg-white/70 p-4 3xl:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white/50">
            <Hardware />
          </div>

          <!-- CPU温度 -->
          <div class="backdrop-blur-lg bg-white/70 p-4 3xl:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white/50">
            <h2 class="text-lg 3xl:text-xl 4xl:text-2xl font-bold mb-2 text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 3xl:h-6 3xl:w-6 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              CPU 温度
            </h2>
            <div class="h-64 3xl:h-80 4xl:h-96 flex items-center justify-center">
              <GaugeChart 
                :value="cpuTemperature" 
                title="CPU 温度" 
                primaryColor="#FFAB91"
                secondaryColor="var(--primary-color)"
                unit="°C"
                :auto-update="true"
                data-type="cpu_temp"
              />
            </div>
          </div>

          <!-- 主板温度 -->
          <div class="backdrop-blur-lg bg-white/70 p-4 3xl:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white/50">
            <h2 class="text-lg 3xl:text-xl 4xl:text-2xl font-bold mb-2 text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 3xl:h-6 3xl:w-6 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              主板温度
            </h2>
            <div class="h-64 3xl:h-80 4xl:h-96 flex items-center justify-center">
              <GaugeChart 
                :value="boardTemperature" 
                title="主板温度" 
                primaryColor="#A7BDEB"
                secondaryColor="var(--primary-color)" 
                unit="°C"
                :auto-update="true"
                data-type="board_temp"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import Hardware from './Hardware.vue';
import { GaugeChart, CommunicationChart, RelationshipChart } from '../lib';
import { apiRatesMqttService, apiRatesModbusService } from '../services/communication';
import { authService } from '../services/auth';

const router = useRouter();

// 温度数据
const cpuTemperature = ref(0);
const boardTemperature = ref(0);

// 关系图表引用
const relationshipChartRef = ref<InstanceType<typeof RelationshipChart> | null>(null);

// 记录定时器ID，便于清除
let timeUpdateTimer: number | null = null;
let communicationRefreshTimer: number | null = null;

// 标记组件是否已挂载
let isMounted = true;

// 刷新拓扑图状态
const refreshTopology = () => {
  // 使用新的刷新方法，获取实际的设备映射状态
  if (relationshipChartRef.value) {
    relationshipChartRef.value.refreshDeviceStatus();
  }
  
  // 同时刷新通信速率数据
  refreshCommunicationData();
};

// 刷新通信速率数据
const refreshCommunicationData = async () => {
  try {
    // 直接获取通信速率数据
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://192.168.1.230:8080/api/devices/rates', {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`获取通信速率失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('手动刷新获取到的通信速率数据:', data);
    
    // 手动更新通信服务
    apiRatesMqttService.startRealDataFetching();
    apiRatesModbusService.startRealDataFetching();
  } catch (error) {
    console.error('手动刷新通信数据失败:', error);
  }
};

// 启动通信连接
const startCommunication = async () => {
  console.log('启动通信服务...');
  
  // 首先尝试直接获取一次通信数据
  try {
    await refreshCommunicationData();
  } catch (error) {
    console.warn('初始获取通信数据失败,继续启动服务:', error);
  }
  
  // 使用apiRates服务获取通信数据
  apiRatesMqttService.startRealDataFetching(2000); // 每2秒更新一次
  apiRatesModbusService.startRealDataFetching(2000);
  
  console.log('通信服务已启动');
};

// 停止通信连接
const stopCommunication = () => {
  // 停止通信服务
  apiRatesMqttService.stopUpdates();
  apiRatesModbusService.stopUpdates();
};

// 初始化数据
const fetchInitialData = () => {
  // 验证身份
  if (!authService.isAuthenticated()) {
    console.warn('用户未授权，将被路由守卫重定向');
    return;
  }
  
  // 使用refreshDeviceStatus方法初始化拓扑图状态
  setTimeout(() => {
    if (relationshipChartRef.value && isMounted) {
      relationshipChartRef.value.refreshDeviceStatus();
    }
  }, 1000);
};

// 启动监控
const startMonitoring = () => {
  // 启动当前时间更新
  startTimeUpdate();
};

// 当前日期时间
const currentDateTime = ref(new Date().toLocaleString('zh-CN'));

// 更新当前时间
const startTimeUpdate = () => {
  // 立即更新一次
  currentDateTime.value = new Date().toLocaleString('zh-CN');
  
  // 每秒更新一次
  timeUpdateTimer = window.setInterval(() => {
    currentDateTime.value = new Date().toLocaleString('zh-CN');
  }, 1000);
};

// 组件挂载后的初始化
onMounted(async () => {
  // 设置组件挂载标志
  isMounted = true;
  
  console.log('Dashboard组件已挂载，开始初始化...');
  
  // 验证身份，如果未认证将自动重定向到登录页面
  if (!authService.isAuthenticated()) {
    console.log('用户未授权，将被重定向到登录页面');
    return;
  }
  
  // 获取初始数据
  fetchInitialData();
  
  // 启动通信，监控和拓扑图
  await startCommunication();
  startMonitoring();
  
  // 每30秒自动刷新一次通信数据
  communicationRefreshTimer = window.setInterval(() => {
    if (isMounted) {
      console.log('自动刷新通信数据...');
      refreshCommunicationData();
    }
  }, 30000);
  
  console.log('Dashboard初始化完成');
});

// 组件卸载前的清理工作
onBeforeUnmount(() => {
  // 设置组件卸载标志
  isMounted = false;
  
  // 清除所有定时器
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer);
    timeUpdateTimer = null;
  }
  
  // 清除通信刷新定时器
  if (communicationRefreshTimer) {
    clearInterval(communicationRefreshTimer);
    communicationRefreshTimer = null;
  }
  
  // 停止通信
  stopCommunication();
});
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 400px;
  padding-bottom: 40px; /* 为图例预留空间 */
  display: block;
  position: relative;
}
</style>



