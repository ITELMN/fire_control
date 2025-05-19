<template>
  <div class="rates-api-test">
    <h2>通信速率 API 测试</h2>
    
    <div class="settings-panel">
      <div class="form-group">
        <label for="apiEndpoint">API 地址:</label>
        <input 
          id="apiEndpoint" 
          v-model="apiEndpoint" 
          type="text" 
          placeholder="输入API地址"
        />
      </div>
      
      <div class="form-group">
        <label>更新频率:</label>
        <div class="rate-buttons">
          <button 
            v-for="rate in updateRates" 
            :key="rate" 
            @click="setUpdateRate(rate)"
            :class="{ active: updateRate === rate }"
          >
            {{ rate === 0 ? '暂停' : `${rate}ms` }}
          </button>
        </div>
      </div>
      
      <div class="form-row">
        <button @click="startMonitoring" :disabled="isMonitoring">开始监控</button>
        <button @click="stopMonitoring" :disabled="!isMonitoring">停止监控</button>
        <button @click="singleRequest">单次请求</button>
      </div>
    </div>
    
    <div class="monitoring-panel">
      <div class="status-row">
        <div class="status-card">
          <div class="status-label">状态:</div>
          <div class="status-value" :class="statusClass">{{ statusText }}</div>
        </div>
        
        <div class="status-card">
          <div class="status-label">总请求数:</div>
          <div class="status-value">{{ requestCount }}</div>
        </div>
        
        <div class="status-card">
          <div class="status-label">成功请求:</div>
          <div class="status-value">{{ successCount }}</div>
        </div>
        
        <div class="status-card">
          <div class="status-label">失败请求:</div>
          <div class="status-value">{{ errorCount }}</div>
        </div>
        
        <div class="status-card">
          <div class="status-label">平均响应时间:</div>
          <div class="status-value">{{ avgResponseTime }} ms</div>
        </div>
      </div>
      
      <div class="data-values">
        <div class="data-card" v-for="(value, key) in latestData" :key="key">
          <div class="data-label">{{ key }}:</div>
          <div class="data-value">{{ value }}</div>
        </div>
      </div>
      
      <div v-if="showError" class="error-message">
        <div class="error-header">
          <h3>最新错误</h3>
          <button @click="clearError" class="clear-button">清除</button>
        </div>
        <pre>{{ latestError }}</pre>
      </div>
      
      <div class="history-panel">
        <h3>请求历史记录</h3>
        <div class="history-list">
          <div 
            v-for="(item, index) in requestHistory.slice().reverse()" 
            :key="index"
            class="history-item"
            :class="{ success: item.success, error: !item.success }"
          >
            <div class="history-time">{{ formatTime(item.timestamp) }}</div>
            <div class="history-status">{{ item.success ? '成功' : '失败' }}</div>
            <div class="history-time">{{ item.responseTime }}ms</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import axios from 'axios';

// API 设置
const apiEndpoint = ref('http://192.168.1.230:8080/api/devices/rates');
const updateRates = [0, 500, 1000, 2000, 5000]; // 0 表示暂停
const updateRate = ref(1000);
const isMonitoring = ref(false);
let intervalId: number | null = null;

// 请求统计
const requestCount = ref(0);
const successCount = ref(0);
const errorCount = ref(0);
const totalResponseTime = ref(0);
const avgResponseTime = computed(() => {
  if (successCount.value === 0) return 0;
  return Math.round(totalResponseTime.value / successCount.value);
});

// 最新数据
const latestData = ref<Record<string, any>>({});
const latestError = ref('');
const showError = computed(() => latestError.value !== '');

// 请求历史
interface RequestHistoryItem {
  timestamp: number;
  success: boolean;
  responseTime: number;
}
const requestHistory = ref<RequestHistoryItem[]>([]);
const maxHistoryItems = 20;

// 状态文本
const statusText = computed(() => {
  if (!isMonitoring.value) return '未监控';
  if (updateRate.value === 0) return '已暂停';
  return '监控中';
});

const statusClass = computed(() => {
  if (!isMonitoring.value) return 'inactive';
  if (updateRate.value === 0) return 'paused';
  return 'active';
});

// 设置更新频率
const setUpdateRate = (rate: number) => {
  updateRate.value = rate;
  if (isMonitoring.value) {
    stopMonitoring();
    if (rate > 0) {
      startMonitoring();
    }
  }
};

// 开始监控
const startMonitoring = () => {
  if (isMonitoring.value || updateRate.value === 0) return;
  
  isMonitoring.value = true;
  
  // 立即执行一次
  performRequest();
  
  // 设置定时器
  intervalId = window.setInterval(() => {
    performRequest();
  }, updateRate.value);
};

// 停止监控
const stopMonitoring = () => {
  isMonitoring.value = false;
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
};

// 单次请求
const singleRequest = () => {
  performRequest();
};

// 执行请求
const performRequest = async () => {
  const startTime = Date.now();
  requestCount.value++;
  
  try {
    const response = await axios.get(apiEndpoint.value, {
      timeout: Math.min(updateRate.value - 50, 5000) || 5000, // 设置合理的超时时间
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    // 更新统计信息
    successCount.value++;
    totalResponseTime.value += responseTime;
    
    // 更新最新数据
    latestData.value = response.data;
    
    // 添加到历史记录
    addToHistory({
      timestamp: Date.now(),
      success: true,
      responseTime
    });
    
  } catch (err) {
    errorCount.value++;
    
    // 设置错误信息
    if (axios.isAxiosError(err)) {
      if (err.response) {
        latestError.value = `服务器错误: ${err.response.status}\n${JSON.stringify(err.response.data, null, 2)}`;
      } else if (err.request) {
        latestError.value = `请求错误: 未收到响应 (${err.message})`;
      } else {
        latestError.value = `请求配置错误: ${err.message}`;
      }
    } else {
      latestError.value = `未知错误: ${err}`;
    }
    
    // 添加到历史记录
    addToHistory({
      timestamp: Date.now(),
      success: false,
      responseTime: Date.now() - startTime
    });
  }
};

// 添加到历史记录
const addToHistory = (item: RequestHistoryItem) => {
  requestHistory.value.push(item);
  
  // 限制历史记录数量
  if (requestHistory.value.length > maxHistoryItems) {
    requestHistory.value.shift();
  }
};

// 清除错误
const clearError = () => {
  latestError.value = '';
};

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// 组件卸载时清理
onUnmounted(() => {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
  }
});
</script>

<style scoped>
.rates-api-test {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2, h3 {
  margin-top: 0;
  color: #333;
}

h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.settings-panel {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.rate-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rate-buttons button {
  padding: 5px 10px;
  border: 1px solid #dcdfe6;
  background-color: #ffffff;
  color: #606266;
  border-radius: 4px;
}

.rate-buttons button.active {
  background-color: #409EFF;
  color: #ffffff;
  border-color: #409EFF;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #606266;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #409EFF;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #337ecc;
}

button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.monitoring-panel {
  margin-top: 20px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.status-card {
  flex: 1;
  min-width: 120px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.status-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.status-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.status-value.active {
  color: #67C23A;
}

.status-value.paused {
  color: #E6A23C;
}

.status-value.inactive {
  color: #909399;
}

.data-values {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.data-card {
  flex: 1;
  min-width: 150px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f0f9eb;
}

.data-label {
  font-size: 12px;
  color: #67C23A;
  margin-bottom: 5px;
}

.data-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.error-message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #fef0f0;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.error-header h3 {
  margin: 0;
  color: #F56C6C;
}

.clear-button {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #F56C6C;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  font-size: 12px;
}

.history-panel {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item.success .history-status {
  color: #67C23A;
}

.history-item.error .history-status {
  color: #F56C6C;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-status {
  font-weight: bold;
}

@media (max-width: 768px) {
  .status-row, .data-values {
    flex-direction: column;
  }
  
  .status-card, .data-card {
    min-width: auto;
  }
}
</style> 