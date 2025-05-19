<template>
  <div class="api-rates-container">
    <!-- 控制面板，用于切换视图 -->
    <div class="view-controls">
      <button @click="activeView = 'dashboard'" :class="{ active: activeView === 'dashboard' }">
        仪表盘视图
      </button>
      <button @click="activeView = 'charts'" :class="{ active: activeView === 'charts' }">
        图表视图
      </button>
      <button @click="activeView = 'test'" :class="{ active: activeView === 'test' }">
        API测试工具
      </button>
    </div>
    
    <!-- DeviceDashboard是新的主要展示组件 -->
    <div v-if="activeView === 'dashboard'" class="dashboard-view">
      <div class="control-panel">
        <h2>设备通信速率监控</h2>
        <div class="control-buttons">
          <button @click="refreshAllData" class="refresh-button">
            刷新数据
          </button>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>MQTT 通信</h3>
          <div class="dashboard-value">{{ mqttRate }} 消息/秒</div>
          <div class="connection-indicator" :class="mqttStatus"></div>
        </div>
        
        <div class="dashboard-card">
          <h3>插件通信</h3>
          <div class="dashboard-value">{{ modbusRate }} 消息/秒</div>
          <div class="connection-indicator" :class="modbusStatus"></div>
        </div>
      </div>
    </div>
    
    <!-- 图表视图 -->
    <div v-if="activeView === 'charts'" class="charts-view">
      <div class="control-panel">
        <h2>通信速率监控</h2>
        <div class="control-buttons">
          <button @click="toggleDebugMode" class="debug-button" :class="{ active: showDebug }">
            {{ showDebug ? '隐藏调试信息' : '显示调试信息' }}
          </button>
          <button @click="refreshAllCharts" class="refresh-button">刷新所有图表</button>
        </div>
      </div>
      
      <div class="charts-row">
        <div class="chart-container">
          <ApiRateDisplay 
            title="MQTT 通信速率" 
            color="#67C23A"
            :max-value="5000"
            unit="消息/秒"
            rate-property="total_mqtt_communication.rate"
            :show-debug-info="showDebug"
            :key="`mqtt-${refreshKey}`"
            ref="mqttChartRef"
          />
        </div>
        <div class="chart-container">
          <ApiRateDisplay 
            title="插件通信速率" 
            color="#F56C6C"
            :max-value="5000"
            unit="消息/秒"
            rate-property="total_plugin_communication.rate"
            :show-debug-info="showDebug"
            :key="`modbus-${refreshKey}`"
            ref="modbusChartRef"
          />
        </div>
      </div>
      
      <!-- 连接状态显示 -->
      <div class="connection-status">
        <p>API 连接状态: <span :class="connectionClass">{{ connectionStatus }}</span></p>
        <p v-if="lastUpdateTime">上次更新: {{ lastUpdateTime }}</p>
      </div>
    </div>
    
    <div v-if="activeView === 'test'" class="test-view">
      <RatesApiTest />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import ApiRateDisplay from './ApiRateDisplay.vue';
import RatesApiTest from './RatesApiTest.vue';
import { apiRatesMqttService, apiRatesModbusService } from '../services/communication';

// 视图控制
const activeView = ref('charts'); // 默认显示图表视图

// 图表控制
const showDebug = ref(false);
const refreshKey = ref(0);

// 图表引用
const mqttChartRef = ref(null);
const modbusChartRef = ref(null);

// MQTT和Modbus速率值
const mqttRate = computed(() => {
  const rate = apiRatesMqttService.currentRate.value;
  return typeof rate === 'number' ? Math.round(rate) : 0;
});

const modbusRate = computed(() => {
  const rate = apiRatesModbusService.currentRate.value;
  return typeof rate === 'number' ? Math.round(rate) : 0;
});

// MQTT和Modbus状态
const mqttStatus = computed(() => {
  if (apiRatesMqttService.hasError.value) return 'error';
  return apiRatesMqttService.isConnected.value ? 'connected' : 'disconnected';
});

const modbusStatus = computed(() => {
  if (apiRatesModbusService.hasError.value) return 'error';
  return apiRatesModbusService.isConnected.value ? 'connected' : 'disconnected';
});

// 切换调试模式
const toggleDebugMode = () => {
  showDebug.value = !showDebug.value;
};

// 刷新所有图表
const refreshAllCharts = () => {
  console.log('Refreshing all charts...');
  refreshKey.value++;
  
  // 手动重新启动服务
  apiRatesMqttService.stopUpdates();
  apiRatesModbusService.stopUpdates();
  
  apiRatesMqttService.startRealDataFetching(1000);
  apiRatesModbusService.startRealDataFetching(1000);
};

// 刷新所有数据
const refreshAllData = () => {
  console.log('Refreshing all data...');
  apiRatesMqttService.stopUpdates();
  apiRatesModbusService.stopUpdates();
  
  // 短暂延迟后重新启动，确保停止完成
  setTimeout(() => {
    apiRatesMqttService.startRealDataFetching(1000);
    apiRatesModbusService.startRealDataFetching(1000);
  }, 100);
};

// 获取连接状态
const connectionStatus = computed(() => {
  if (apiRatesMqttService.hasError.value || apiRatesModbusService.hasError.value) {
    return '连接错误';
  }
  
  if (!apiRatesMqttService.isConnected.value || !apiRatesModbusService.isConnected.value) {
    return '已断开';
  }
  
  return '已连接';
});

// 连接状态样式
const connectionClass = computed(() => {
  if (apiRatesMqttService.hasError.value || apiRatesModbusService.hasError.value) {
    return 'error';
  }
  
  if (!apiRatesMqttService.isConnected.value || !apiRatesModbusService.isConnected.value) {
    return 'disconnected';
  }
  
  return 'connected';
});

// 更新时间
const lastUpdateTime = ref('');

// 更新时间定时器
let updateTimeInterval: number | null = null;

// 格式化时间
const formatTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  lastUpdateTime.value = `${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  console.log('ApiRatesDemo mounted, initializing services...');
  
  // 每秒更新一次时间
  updateTimeInterval = window.setInterval(() => {
    formatTime();
  }, 1000);
  
  // 初始化时间
  formatTime();
  
  // 确保服务正在运行
  apiRatesMqttService.stopUpdates();
  apiRatesModbusService.stopUpdates();
  
  // 短暂延迟后启动
  setTimeout(() => {
    apiRatesMqttService.startRealDataFetching(1000);
    apiRatesModbusService.startRealDataFetching(1000);
  }, 100);
});

onUnmounted(() => {
  console.log('ApiRatesDemo unmounted, cleaning up...');
  
  if (updateTimeInterval) {
    window.clearInterval(updateTimeInterval);
    updateTimeInterval = null;
  }
  
  apiRatesMqttService.stopUpdates();
  apiRatesModbusService.stopUpdates();
});
</script>

<style scoped>
.api-rates-container {
  width: 100%;
  padding: 16px;
}

.view-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 8px;
  gap: 10px;
}

.view-controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #DCDFE6;
  color: #606266;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.view-controls button.active {
  background-color: #409EFF;
  color: white;
}

.dashboard-view {
  margin-bottom: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.dashboard-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
  position: relative;
  min-height: 120px;
}

.dashboard-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.dashboard-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin: 16px 0;
}

.connection-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.connected {
  background-color: #67C23A;
  box-shadow: 0 0 5px #67C23A;
}

.disconnected {
  background-color: #909399;
  box-shadow: 0 0 5px #909399;
}

.error {
  background-color: #F56C6C;
  box-shadow: 0 0 5px #F56C6C;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.control-panel h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.debug-button, .refresh-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.debug-button {
  background-color: #909399;
  color: white;
}

.debug-button.active {
  background-color: #409EFF;
}

.refresh-button {
  background-color: #67C23A;
  color: white;
}

.refresh-button:hover {
  background-color: #529b2e;
}

.charts-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-container {
  flex: 1;
  min-width: 0;
  height: 200px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.connection-status {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
}

.connection-status p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .charts-row {
    flex-direction: column;
  }
  
  .control-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .view-controls {
    flex-direction: column;
  }
}
</style> 