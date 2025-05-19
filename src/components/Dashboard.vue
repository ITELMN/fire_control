<template>
  <div class="dashboard-main">
    <header class="dashboard-header">
      <h1>设备通信管理平台</h1>
      <div class="system-info">
        <div class="time">{{ currentTime }}</div>
        <div class="api-status" :class="apiStatusClass">
          API状态: {{ apiStatusText }}
        </div>
      </div>
    </header>
    
    <main class="dashboard-content">
      <ApiRatesDemo />
    </main>
    
    <footer class="dashboard-footer">
      <p>© 2023 火灾控制系统</p>
      <button @click="showDebugPanel = !showDebugPanel" class="debug-toggle">
        {{ showDebugPanel ? '隐藏调试面板' : '显示调试面板' }}
      </button>
    </footer>
    
    <!-- 调试面板 -->
    <div v-if="showDebugPanel" class="debug-panel">
      <h3>API 调试工具</h3>
      <ApiTest />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ApiTest from './ApiTest.vue';
import ApiRatesDemo from './ApiRatesDemo.vue';
import { apiRatesMqttService, apiRatesModbusService, fetchApiData } from '../services/communication';

// 系统时间
const currentTime = ref('');
let timeInterval: number | null = null;

// 调试面板控制
const showDebugPanel = ref(false);

// API状态
const apiStatus = ref('pending'); // pending, connected, error

// API状态文本
const apiStatusText = computed(() => {
  switch (apiStatus.value) {
    case 'connected': return '已连接';
    case 'error': return '连接失败';
    default: return '检测中...';
  }
});

// API状态样式
const apiStatusClass = computed(() => {
  switch (apiStatus.value) {
    case 'connected': return 'status-success';
    case 'error': return 'status-error';
    default: return 'status-pending';
  }
});

// 更新系统时间
const updateTime = () => {
  const now = new Date();
  const format = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  currentTime.value = format.format(now);
};

// 检查API状态
const checkApiStatus = async () => {
  try {
    // 使用全局API请求函数
    await fetchApiData('http://192.168.1.230:8080/api/devices/rates');
    apiStatus.value = 'connected';
  } catch (error) {
    apiStatus.value = 'error';
    console.error('API连接失败:', error);
  }
};

// 初始化通信服务
const initCommunicationServices = () => {
  // 确保服务已停止
  apiRatesMqttService.stopUpdates();
  apiRatesModbusService.stopUpdates();
  
  // 短暂延迟后启动服务
  setTimeout(() => {
    apiRatesMqttService.startRealDataFetching(1000);
    apiRatesModbusService.startRealDataFetching(1000);
  }, 100);
};

onMounted(() => {
  console.log('Dashboard mounted, initializing...');
  // 初始化时间
  updateTime();
  
  // 定时更新时间
  timeInterval = window.setInterval(updateTime, 1000);
  
  // 检查API状态
  checkApiStatus();
  
  // 定时检查API状态
  const statusInterval = window.setInterval(checkApiStatus, 30000); // 每30秒检查一次
  
  // 初始化通信服务
  initCommunicationServices();
  
  // 清理定时器
  onUnmounted(() => {
    console.log('Dashboard unmounted, cleaning up...');
    if (timeInterval) window.clearInterval(timeInterval);
    if (statusInterval) window.clearInterval(statusInterval);
    
    // 停止通信服务
    apiRatesMqttService.stopUpdates();
    apiRatesModbusService.stopUpdates();
  });
});
</script>

<style scoped>
.dashboard-main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.dashboard-header {
  background-color: #409EFF;
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 22px;
}

.system-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.time {
  font-size: 14px;
}

.api-status {
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
}

.status-success {
  background-color: #67C23A;
}

.status-error {
  background-color: #F56C6C;
}

.status-pending {
  background-color: #E6A23C;
}

.dashboard-content {
  flex: 1;
  padding: 20px;
}

.dashboard-footer {
  background-color: #303133;
  color: #DCDFE6;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-footer p {
  margin: 0;
  font-size: 12px;
}

.debug-toggle {
  background-color: transparent;
  color: #DCDFE6;
  border: 1px solid #DCDFE6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.debug-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.debug-panel {
  background-color: #fff;
  padding: 20px;
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.debug-panel h3 {
  margin-top: 0;
  font-size: 16px;
  margin-bottom: 15px;
  color: #303133;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .system-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 