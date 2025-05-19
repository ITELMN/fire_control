<template>
  <div class="communication-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="connection-status">
        <div :class="['status-dot', connectionStatusClass]"></div>
        <span class="status-text">{{ connectionStatusText }}</span>
      </div>
    </div>
    
    <div class="current-rate">{{ currentRate }} {{ unit }}</div>
    
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, computed } from 'vue';
import * as echarts from 'echarts';
import type { CommunicationData } from '../services/communication';

const props = defineProps({
  title: {
    type: String,
    default: '通信速率'
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
  communicationService: {
    type: Object,
    required: true
  }
});

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

// 从通信服务中获取数据
const historyData = computed(() => props.communicationService.historyData.value);
const currentRate = computed(() => {
  // Format the rate as an integer
  const rate = props.communicationService.currentRate.value;
  return typeof rate === 'number' ? Math.round(rate) : 0;
});
const isConnected = computed(() => props.communicationService.isConnected.value);
const hasError = computed(() => props.communicationService.hasError.value);

// 连接状态
const connectionStatusClass = computed(() => {
  if (hasError.value) return 'error';
  return isConnected.value ? 'connected' : 'disconnected';
});

const connectionStatusText = computed(() => {
  if (hasError.value) return '连接失败';
  return isConnected.value ? '已连接' : '已断开';
});

// 图表数据
const dateList = computed(() => {
  return historyData.value.map((item: CommunicationData) => {
    const date = new Date(item.timestamp);
    return formatTime(date);
  });
});

const valueList = computed(() => {
  // Ensure values are processed as numbers
  return historyData.value.map((item: CommunicationData) => {
    return typeof item.value === 'number' ? Math.round(item.value) : 0;
  });
});

// 自动计算合适的Y轴最大值
const calculatedMaxValue = computed(() => {
  if (!valueList.value || valueList.value.length === 0) {
    return props.maxValue;
  }
  
  const maxDataValue = Math.max(...valueList.value);
  
  // 如果最大数据值小于设定的maxValue，则使用设定值
  if (maxDataValue <= props.maxValue) {
    return props.maxValue;
  }
  
  // 否则向上取整到合适的数值
  // 例如：3958 -> 5000, 12345 -> 15000
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxDataValue)));
  return Math.ceil(maxDataValue / magnitude) * magnitude;
});

// 格式化时间为 HH:MM:SS
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  chart = echarts.init(chartRef.value);
  updateChart();
};

// 更新图表
const updateChart = () => {
  if (!chart) return;
  
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const value = params[0].value;
        return `${params[0].name}<br/>${value} ${props.unit}`;
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateList.value,
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: calculatedMaxValue.value,
      axisLabel: {
        formatter: `{value} ${props.unit}`,
        fontSize: 8
      }
    },
    visualMap: {
      show: false,
      type: 'continuous',
      seriesIndex: 0,
      min: 0,
      max: calculatedMaxValue.value,
      inRange: {
        color: [props.color, props.color]
      }
    },
    series: [
      {
        type: 'line',
        data: valueList.value,
        showSymbol: false,
        smooth: 0.5,
        smoothMonotone: 'x',
        areaStyle: {
          opacity: 0.5,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: props.color
            },
            {
              offset: 0.3,
              color: `${props.color}90` // 56% opacity
            },
            {
              offset: 0.7,
              color: `${props.color}30` // 19% opacity
            },
            {
              offset: 1,
              color: 'rgba(255, 255, 255, 0.05)'
            }
          ])
        },
        lineStyle: {
          width: 2.5,
          cap: 'round',
          shadowColor: `${props.color}40`,
          shadowBlur: 8
        },
        emphasis: {
          focus: 'series'
        },
        animation: true,
        animationDuration: 1000
      }
    ],
    animation: true,
    animationThreshold: 2000,
    animationDuration: 1000,
    animationDurationUpdate: 800
  };

  chart.setOption(option);
};

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize();
};

// 生命周期钩子
onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  chart?.dispose();
  window.removeEventListener('resize', handleResize);
});

// 监听数据变化，更新图表
watch(
  [historyData, () => props.maxValue],
  () => {
    updateChart();
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.communication-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 4px 0;
}

.chart-title {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.connection-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.connected {
  background-color: #67C23A;
  box-shadow: 0 0 4px #67C23A;
}

.disconnected {
  background-color: #909399;
  box-shadow: 0 0 4px #909399;
}

.error {
  background-color: #F56C6C;
  box-shadow: 0 0 4px #F56C6C;
}

.status-text {
  font-size: 11px;
  color: #666;
}

.current-rate {
  font-size: 18px;
  font-weight: bold;
  color: v-bind('props.color');
  text-align: center;
  margin-bottom: 4px;
}

.chart-container {
  flex: 1;
  width: 100%;
}
</style> 