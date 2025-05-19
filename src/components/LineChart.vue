<template>
  <div class="line-chart-container">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineExpose } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  title: {
    type: String,
    default: '通信速率'
  },
  color: {
    type: String,
    default: '#409EFF'
  },
  maxDataPoints: {
    type: Number,
    default: 50 // 显示的最大数据点数量
  },
  minValue: {
    type: Number,
    default: 0
  },
  maxValue: {
    type: Number,
    default: 400
  },
  unit: {
    type: String,
    default: 'b/s'
  },
  autoUpdate: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let timer: number | null = null;

// 存储时间和数值数据
const dateList = ref<string[]>([]);
const valueList = ref<number[]>([]);

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  chart = echarts.init(chartRef.value);
  
  if (dateList.value.length === 0) {
    // 初始化空数据
    const now = new Date();
    for (let i = 0; i < props.maxDataPoints; i++) {
      const time = new Date(now.getTime() - (props.maxDataPoints - i - 1) * 1000);
      dateList.value.push(formatTime(time));
      valueList.value.push(0);
    }
  }
  
  updateChart();
  
  // 自动更新数据
  if (props.autoUpdate) {
    startAutoUpdate();
  }
};

// 格式化时间为 HH:MM:SS
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// 更新图表
const updateChart = () => {
  if (!chart) return;
  
  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const value = params[0].value;
        return `${params[0].name}<br/>${value} ${props.unit}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '60',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateList.value,
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      min: props.minValue,
      max: props.maxValue,
      axisLabel: {
        formatter: `{value} ${props.unit}`
      }
    },
    visualMap: {
      show: false,
      type: 'continuous',
      seriesIndex: 0,
      min: props.minValue,
      max: props.maxValue,
      inRange: {
        color: [props.color, props.color]
      }
    },
    series: [
      {
        type: 'line',
        data: valueList.value,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: props.color
            },
            {
              offset: 1,
              color: 'rgba(255, 255, 255, 0.2)'
            }
          ])
        },
        lineStyle: {
          width: 2
        },
        emphasis: {
          focus: 'series'
        }
      }
    ]
  };

  chart.setOption(option);
};

// 添加新数据点
const addDataPoint = (value: number) => {
  if (dateList.value.length >= props.maxDataPoints) {
    // 移除最旧的数据点
    dateList.value.shift();
    valueList.value.shift();
  }
  
  // 添加新数据点
  const now = new Date();
  dateList.value.push(formatTime(now));
  valueList.value.push(value);
  
  updateChart();
};

// 自动更新逻辑 - 模拟数据
const startAutoUpdate = () => {
  timer = window.setInterval(() => {
    // MQTT通常在50-200 b/s范围，Modbus在20-150 b/s范围
    // 这里模拟一个随机变化的通信速率
    const randomValue = Math.floor(
      Math.random() * (props.maxValue / 2) + (props.maxValue / 4)
    );
    addDataPoint(randomValue);
  }, 1000); // 每秒更新一次
};

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize();
};

// 清除所有数据
const clearData = () => {
  dateList.value = [];
  valueList.value = [];
  
  const now = new Date();
  for (let i = 0; i < props.maxDataPoints; i++) {
    const time = new Date(now.getTime() - (props.maxDataPoints - i - 1) * 1000);
    dateList.value.push(formatTime(time));
    valueList.value.push(0);
  }
  
  updateChart();
};

// 暴露给父组件的方法
defineExpose({
  addDataPoint,
  clearData
});

// 生命周期钩子
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

// 监听属性变化
watch(
  () => [props.minValue, props.maxValue, props.title, props.color],
  () => {
    updateChart();
  }
);
</script>

<style scoped>
.line-chart-container {
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