<template>
  <div class="api-rate-display">
    <CommunicationChart
      :title="title"
      :color="color"
      :max-value="maxValue"
      :unit="unit"
      :communication-service="communicationService"
    />
    <div v-if="showDebugInfo" class="debug-info">
      <p>API URL: {{ apiUrl }}</p>
      <p>Rate Property: {{ rateProperty }}</p>
      <p>Current Rate: {{ communicationService.currentRate.value }}</p>
      <p>Connected: {{ communicationService.isConnected.value ? 'Yes' : 'No' }}</p>
      <p>Has Error: {{ communicationService.hasError.value ? 'Yes' : 'No' }}</p>
      <p>Data Points: {{ communicationService.historyData.value.length }}</p>
      <button @click="refreshData">刷新数据</button>
      <button @click="forceRefetch">强制重新获取</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, watch, ref } from 'vue';
import CommunicationChart from './CommunicationChart.vue';
import { createRateService } from '../services/communication';

const props = defineProps({
  title: {
    type: String,
    default: '数据通信速率'
  },
  color: {
    type: String,
    default: '#409EFF'
  },
  maxValue: {
    type: Number,
    default: 300
  },
  unit: {
    type: String,
    default: 'b/s'
  },
  apiUrl: {
    type: String,
    default: 'http://192.168.1.230:8080/api/devices/rates'
  },
  rateProperty: {
    type: String,
    required: true
  },
  updateInterval: {
    type: Number,
    default: 1000 // 1秒更新一次
  },
  showDebugInfo: {
    type: Boolean,
    default: false
  }
});

// 创建通信服务实例
const communicationService = createRateService(props.apiUrl, props.rateProperty);

// 初始化服务
onMounted(() => {
  console.log(`ApiRateDisplay mounted for ${props.title} with property ${props.rateProperty}`);
  
  // 确保使用正确的更新间隔
  communicationService.stopUpdates();
  communicationService.startRealDataFetching(props.updateInterval);
});

// 当组件卸载时停止更新
onUnmounted(() => {
  console.log(`ApiRateDisplay unmounted for ${props.title}`);
  communicationService.stopUpdates();
});

// 手动刷新数据
const refreshData = () => {
  console.log(`Manually refreshing data for ${props.title}`);
  communicationService.stopUpdates();
  communicationService.startRealDataFetching(props.updateInterval);
};

// 强制重新获取数据
const forceRefetch = async () => {
  console.log(`Force refetching data for ${props.title}`);
  
  try {
    // 强制请求，绕过任何缓存
    // 通过在URL后附加时间戳参数使其成为新的URL，确保使用新请求
    const uniqueUrl = `${props.apiUrl}?_t=${Date.now()}`;
    
    // 从localStorage获取token
    const token = localStorage.getItem('auth_token');
    
    // 手动获取一次数据
    const response = await fetch(uniqueUrl, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`手动获取数据成功 (${props.apiUrl}):`, data);
    
    // 刷新服务
    refreshData();
  } catch (error) {
    console.error(`手动获取数据失败 (${props.apiUrl}):`, error);
  }
};

// 监听更新间隔变化
watch(() => props.updateInterval, (newInterval) => {
  console.log(`Update interval changed to ${newInterval}ms for ${props.title}`);
  communicationService.stopUpdates();
  communicationService.startRealDataFetching(newInterval);
});
</script>

<style scoped>
.api-rate-display {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.debug-info {
  margin-top: 10px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.debug-info p {
  margin: 2px 0;
}

.debug-info button {
  margin-top: 5px;
  padding: 4px 8px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.debug-info button:hover {
  background-color: #337ecc;
}
</style> 