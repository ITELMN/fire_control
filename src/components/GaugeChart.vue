<template>
  <div class="gauge-chart-container">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';

const props = defineProps({
  title: {
    type: String,
    default: '温度'
  },
  value: {
    type: Number,
    default: 30
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 60
  },
  primaryColor: {
    type: String,
    default: '#FFAB91'
  },
  secondaryColor: {
    type: String,
    default: '#FD7347'
  },
  unit: {
    type: String,
    default: '°C'
  },
  autoUpdate: {
    type: Boolean,
    default: false
  },
  dataType: {
    type: String,
    default: 'cpu_temp' // 'cpu_temp' or 'board_temp'
  }
});

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let timer: number | null = null;

const initChart = () => {
  if (!chartRef.value) return;
  
  chart = echarts.init(chartRef.value);
  updateChart(props.value);
  
  // 自动更新数据
  if (props.autoUpdate) {
    startAutoUpdate();
  }
};

const updateChart = (value: number) => {
  if (!chart) return;
  
  const option = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '85%',
        startAngle: 180,
        endAngle: 0,
        min: props.min,
        max: props.max,
        splitNumber: 6,
        itemStyle: {
          color: props.primaryColor
        },
        progress: {
          show: true,
          width: 25
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 25
          }
        },
        axisTick: {
          distance: -30,
          splitNumber: 5,
          lineStyle: {
            width: 1,
            color: '#999'
          }
        },
        splitLine: {
          distance: -35,
          length: 10,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -15,
          color: '#999',
          fontSize: 10,
          formatter: function(value: number) {
            return value.toFixed(0);
          }
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '70%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '50%'],
          fontSize: 30,
          fontWeight: 'bolder',
          formatter: `{value} ${props.unit}`,
          color: 'inherit'
        },
        data: [
          {
            value: value
          }
        ]
      },
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '85%',
        startAngle: 180,
        endAngle: 0,
        min: props.min,
        max: props.max,
        itemStyle: {
          color: props.secondaryColor
        },
        progress: {
          show: true,
          width: 6
        },
        pointer: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        detail: {
          show: false
        },
        data: [
          {
            value: value
          }
        ]
      }
    ]
  };

  chart.setOption(option);
};

const fetchTemperatureData = async () => {
  try {
    // 获取token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('No authentication token found for temperature data request');
      updateData(0); // 获取不到token时设置为0
      return;
    }

    // 发送API请求获取温度数据
    const response = await axios.get('http://192.168.1.230:8080/api/hardware/temperature', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 如果请求成功并且返回了数据
    if (response.data) {
      // 根据dataType属性选择CPU温度或主板温度
      const tempValue = props.dataType === 'cpu_temp' 
        ? response.data.cpu_temp 
        : response.data.board_temp;
      
      updateData(tempValue);
    } else {
      updateData(0); // 获取不到数据时设置为0
    }
  } catch (error) {
    console.error('Failed to fetch temperature data:', error);
    updateData(0); // 请求出错时设置为0
  }
};

const startAutoUpdate = () => {
  // 立即获取一次数据
  fetchTemperatureData();
  
  // 每分钟获取一次数据
  timer = window.setInterval(() => {
    fetchTemperatureData();
  }, 60000); // 60000毫秒 = 1分钟
};

const updateData = (value: number) => {
  if (!chart) return;
  
  chart.setOption({
    series: [
      {
        data: [
          {
            value: value
          }
        ]
      },
      {
        data: [
          {
            value: value
          }
        ]
      }
    ]
  });
};

// 监听属性变化
watch(() => props.value, (newValue) => {
  updateData(newValue);
});

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
  chart?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.gauge-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style> 