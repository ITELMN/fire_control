<template>
  <div class="relationship-chart-container">
    <div ref="chartRef" class="chart-container">
      <div v-if="loading" class="chart-loading">
        <div class="spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    </div>
    <div class="status-info">
      <div class="status-item">
        <div class="status-icon online"></div>
        <span>在线</span>
      </div>
      <div class="status-item">
        <div class="status-icon offline"></div>
        <span>离线</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineExpose } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { deviceMappingApi, type DeviceMapping } from '../services/api/device-mappings';
import { deviceMappingManager } from '../services/device-mapping-manager';

interface NodeData {
  id: string;
  name: string;
  symbol: string;
  symbolSize: number | number[];
  category: number;
  x?: number;
  y?: number;
  fixed?: boolean;
  itemStyle: {
    color: string;
  };
  label: {
    show: boolean;
    position: 'top' | 'left' | 'right' | 'bottom' | 'inside' | [number, number];
    formatter?: string;
    color?: string;
    fontSize?: number;
  };
}

interface LinkData {
  source: string;
  target: string;
  lineStyle: {
    color: string;
    width: number;
    type?: 'solid' | 'dashed';
  };
  label?: {
    show: boolean;
    formatter: string;
    fontSize: number;
    color: string;
    backgroundColor?: string;
    padding?: number[];
    borderRadius?: number;
  };
}

const props = defineProps({
  deviceCounts: {
    type: Array as () => number[],
    default: () => [3, 1, 3] // [下位机数量, 中心服务器数量, MQTT服务器数量]
  },
  primaryColor: {
    type: String,
    default: '#1890ff' // 默认主题色
  },
  scale: {
    type: Number,
    default: 1 // 图表整体缩放比例
  },
  fontSize: {
    type: Number,
    default: 14 // 字体大小
  },
  nodeSize: {
    type: Number,
    default: 40 // 节点大小基础值
  }
});

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let destroyed = ref(false); // 跟踪组件是否已销毁

// 节点状态映射
const nodeStatusMap = ref<Record<string, boolean>>({});

// 设备映射数据
const deviceMappings = ref<DeviceMapping[]>([]);

// 主题色
const themeColors = {
  primary: props.primaryColor,
  online: '#52c41a',
  offline: '#ff4d4f',
  lowerDevice: '#3b82f6', // 蓝色
  centerServer: '#10b981', // 绿色
  mqttServer: '#8b5cf6', // 紫色
  link: '#91d5ff',
  linkOffline: '#ff7875'
};

// 添加loading状态变量
const loading = ref(true);

// 获取设备映射数据
const fetchDeviceMappings = async () => {
  try {
    deviceMappings.value = await deviceMappingApi.getMappings();
    console.log('加载到设备映射数据:', deviceMappings.value);
    // 获取设备映射后更新图表
    initChart();
  } catch (error) {
    console.error('获取设备映射失败:', error);
    // 如果获取失败，仍使用默认数据初始化图表
    initChart();
  }
};

// 生成节点和连接数据
const generateTopologyData = () => {
  const nodes: NodeData[] = [];
  const links: LinkData[] = [];
  let currentId = 0;

  // 计算垂直分布 - 增加总高度
  const totalHeight = 700; // 增加图表的垂直空间
  
  // 下位机设备 - 使用设备映射数据中的下位机数量或默认值
  const lowerDeviceCount = deviceMappings.value.length > 0 ? deviceMappings.value.length : props.deviceCounts[0];
  const lowerDeviceSpacing = totalHeight / (lowerDeviceCount + 1);
  
  // 应用缩放比例
  const baseNodeSize = props.nodeSize * 1.3; // 增大基础节点大小
  const centerNodeSize = baseNodeSize * 1.5 * props.scale;
  const standardNodeSize = baseNodeSize * props.scale;
  const labelFontSize = props.fontSize * props.scale;
  
  // 添加中心服务器节点 - 中间
  const centerServerId = "center";
  const isCenterOnline = nodeStatusMap.value[centerServerId] !== false;
  const centerServer: NodeData = {
    id: centerServerId,
    name: '上位机',
    symbol: 'image:///devices.svg',
    symbolSize: [centerNodeSize, centerNodeSize],
    category: 1,
    x: 0,
    y: 0, // 居中放置
    fixed: true,
    itemStyle: {
      color: isCenterOnline ? themeColors.online : themeColors.offline
    },
    label: {
      show: true,
      position: 'bottom',
      color: '#333',
      fontSize: labelFontSize
    }
  };
  nodes.push(centerServer);
  
  // MQTT服务器列表
  const mqttServers: Record<string, NodeData> = {};
  
  // 添加下位机节点 - 左侧，使用deviceMappings数据
  if (deviceMappings.value.length > 0) {
    deviceMappings.value.forEach((mapping, index) => {
      const nodeId = mapping.id?.toString() || `device-${index}`;
      const isActive = deviceMappingManager.isActive(mapping.id || 0);
      const deviceNode: NodeData = {
        id: nodeId,
        name: mapping.device_path.split('/').pop() || `下位机${index + 1}`,
        symbol: 'image:///developer_board.svg',
        symbolSize: [standardNodeSize, standardNodeSize],
        category: 0,
        x: -350, // 增加水平间距
        y: (index + 1) * lowerDeviceSpacing - totalHeight / 2 - 40, // 上移40px
        itemStyle: {
          color: isActive ? themeColors.online : themeColors.offline
        },
        label: {
          show: true,
          position: 'bottom',
          formatter: '{b}',
          color: '#333',
          fontSize: labelFontSize
        }
      };
      nodes.push(deviceNode);
      
      // 添加连接关系
      links.push({
        source: nodeId,
        target: centerServerId,
        lineStyle: {
          color: isActive ? themeColors.link : themeColors.linkOffline,
          width: 2,
          type: isActive ? 'solid' : 'dashed'
        },
        label: {
          show: true,
          formatter: isActive ? '已连接' : '未连接',
          fontSize: labelFontSize,
          color: isActive ? themeColors.online : themeColors.offline,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: [2, 4],
          borderRadius: 2
        }
      });
      
      // 添加MQTT服务器节点 - 如果不存在
      if (mapping.mqtt_server && !mqttServers[mapping.mqtt_server]) {
        const mqttId = `mqtt-${Object.keys(mqttServers).length}`;
        mqttServers[mapping.mqtt_server] = {
          id: mqttId,
          name: mapping.mqtt_server,
          symbol: 'image:///mqtt.svg',
          symbolSize: [standardNodeSize, standardNodeSize],
          category: 2,
          x: 350, // 增加水平间距
          y: (Object.keys(mqttServers).length + 1) * (totalHeight / (props.deviceCounts[2] + 1)) - totalHeight / 2 - 40, // 上移40px
          itemStyle: {
            color: themeColors.online // 默认MQTT服务器在线
          },
          label: {
            show: true,
            position: 'bottom',
            formatter: '{b}',
            color: '#333',
            fontSize: labelFontSize
          }
        };
      }
    });
    
    // 添加MQTT服务器节点到nodes数组
    Object.values(mqttServers).forEach((mqttNode, index) => {
      nodes.push(mqttNode);
      
      // 更新MQTT服务器节点标签位置
      mqttNode.label.position = 'bottom';
      
      // 调整Y位置
      mqttNode.y = (index + 1) * (totalHeight / (Object.keys(mqttServers).length + 1)) - totalHeight / 2 - 40; // 上移40px
      
      // 调整X位置
      mqttNode.x = 350; // 增加水平间距
      
      // 添加中心服务器与MQTT服务器的连接
      links.push({
        source: centerServerId,
        target: mqttNode.id,
        lineStyle: {
          color: themeColors.link,
          width: 2,
          type: 'solid'
        },
        label: {
          show: true,
          formatter: '已连接',
          fontSize: labelFontSize,
          color: themeColors.online,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: [2, 4],
          borderRadius: 2
        }
      });
    });
  } else {
    // 如果没有设备映射数据，使用默认配置
    const lowerDeviceSpacing = totalHeight / (props.deviceCounts[0] + 1);
    const mqttServerSpacing = totalHeight / (props.deviceCounts[2] + 1);
    
    // 添加下位机节点 - 左侧
    const lowerDevices: string[] = [];
    for (let i = 0; i < props.deviceCounts[0]; i++) {
      const nodeId = i.toString();
      const isOnline = nodeStatusMap.value[nodeId] !== false;
      const node: NodeData = {
        id: nodeId,
        name: `下位机${i + 1}`,
        symbol: 'image:///developer_board.svg',
        symbolSize: [standardNodeSize, standardNodeSize],
        category: 0,
        x: -350, // 增加水平间距
        y: (i + 1) * lowerDeviceSpacing - totalHeight / 2 - 40, // 上移40px
        itemStyle: {
          color: isOnline ? themeColors.online : themeColors.offline
        },
        label: {
          show: true,
          position: 'bottom',
          formatter: '{b}',
          color: '#333',
          fontSize: labelFontSize
        }
      };
      nodes.push(node);
      lowerDevices.push(nodeId);
    }
    
    // 添加MQTT服务器节点 - 右侧
    const mqttServers: string[] = [];
    for (let i = 0; i < props.deviceCounts[2]; i++) {
      const nodeId = (i + props.deviceCounts[0] + 1).toString();
      const isOnline = nodeStatusMap.value[nodeId] !== false;
      const node: NodeData = {
        id: nodeId,
        name: `MQTT${i + 1}`,
        symbol: 'image:///mqtt.svg',
        symbolSize: [standardNodeSize, standardNodeSize],
        category: 2,
        x: 350, // 增加水平间距
        y: (i + 1) * mqttServerSpacing - totalHeight / 2 - 40, // 上移40px
        itemStyle: {
          color: isOnline ? themeColors.online : themeColors.offline
        },
        label: {
          show: true,
          position: 'bottom',
          formatter: '{b}',
          color: '#333',
          fontSize: labelFontSize
        }
      };
      nodes.push(node);
      mqttServers.push(nodeId);
    }
    
    // 添加连接关系
    lowerDevices.forEach(deviceId => {
      const isConnected = nodeStatusMap.value[deviceId] !== false;
      links.push({
        source: deviceId,
        target: centerServerId,
        lineStyle: {
          color: isConnected ? themeColors.link : themeColors.linkOffline,
          width: 2,
          type: isConnected ? 'solid' : 'dashed'
        },
        label: {
          show: true,
          formatter: isConnected ? '已连接' : '未连接',
          fontSize: labelFontSize,
          color: isConnected ? themeColors.online : themeColors.offline,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: [2, 4],
          borderRadius: 2
        }
      });
    });

    mqttServers.forEach(mqttId => {
      const isConnected = nodeStatusMap.value[mqttId] !== false;
      links.push({
        source: centerServerId,
        target: mqttId,
        lineStyle: {
          color: isConnected ? themeColors.link : themeColors.linkOffline,
          width: 2,
          type: isConnected ? 'solid' : 'dashed'
        },
        label: {
          show: true,
          formatter: isConnected ? '已连接' : '未连接',
          fontSize: labelFontSize,
          color: isConnected ? themeColors.online : themeColors.offline,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: [2, 4],
          borderRadius: 2
        }
      });
    });
  }

  return { nodes, links };
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value || destroyed.value) return;
  
  loading.value = true;
  
  // 如果图表已存在，先销毁
  if (chart) {
    try {
      chart.dispose();
    } catch (e) {
      console.error('销毁图表出错:', e);
    }
    chart = null;
  }
  
  // 检查DOM尺寸和组件状态
  if (!chartRef.value || chartRef.value.clientWidth <= 0 || chartRef.value.clientHeight <= 0 || destroyed.value) {
    console.warn('图表容器尺寸异常或组件已销毁，延迟初始化', chartRef.value?.clientWidth, chartRef.value?.clientHeight);
    if (!destroyed.value) {
      setTimeout(initChart, 300);
    }
    return;
  }
  
  try {
    // 确保DOM元素存在并已挂载
    if (!chartRef.value) {
      loading.value = false;
      return;
    }
    
    chart = echarts.init(chartRef.value);
    const { nodes, links } = generateTopologyData();
    
    const option: EChartsOption = {
      tooltip: {
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            // 对于设备映射数据的节点，显示更详细的信息
            if (params.data.id.toString().startsWith('device-') || !isNaN(Number(params.data.id))) {
              const mappingId = params.data.id.toString().replace('device-', '');
              const mapping = deviceMappings.value.find(m => m.id?.toString() === mappingId || `device-${m.id}` === params.data.id);
              if (mapping) {
                const status = deviceMappingManager.isActive(mapping.id || 0) ? '在线' : '离线';
                const plugin = mapping.plugin_id || '未知插件';
                return `${params.data.name}<br/>设备路径: ${mapping.device_path}<br/>插件: ${plugin}<br/>MQTT服务器: ${mapping.mqtt_server}<br/>状态: ${status}`;
              }
            }
            
            const status = nodeStatusMap.value[params.data.id] === undefined ? 
              '状态未知' : (nodeStatusMap.value[params.data.id] ? '在线' : '离线');
            return `${params.data.name}<br/>状态: ${status}`;
          }
          return '';
        },
        textStyle: {
          fontSize: 14 * props.scale
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: [8, 12],
        extraCssText: 'box-shadow: 0 2px 6px rgba(0,0,0,0.1);'
      },
      animation: true,
      animationDuration: 1000,
      animationEasingUpdate: 'quinticInOut',
      grid: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      series: [{
        type: 'graph',
        layout: 'none', // 使用固定布局
        roam: 'move', // 允许自由平移和缩放
        zoom: 0.9, // 增大初始缩放
        center: [0, 0], // 居中放置
        focusNodeAdjacency: true,
        draggable: true, // 允许节点拖动
        scaleLimit: {
          min: 0.5,
          max: 3
        },
        label: {
          show: true
        },
        data: nodes,
        links: links,
        lineStyle: {
          opacity: 0.9,
          width: 2 * props.scale,
          curveness: 0.2 // 增加曲线程度
        },
        emphasis: {
          lineStyle: {
            width: 4 * props.scale
          },
          scale: props.scale + 0.1
        },
        edgeLabel: {
          fontSize: props.fontSize * props.scale,
          position: 'middle',
          formatter: '{c}',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: [2, 4],
          borderRadius: 2
        }
      }]
    };
  
    if (chart) {
      chart.setOption(option);
      
      // 使用更小的缩放比例确保完全显示
      chart.setOption({
        series: [{
          zoom: 0.95, // 增大初始缩放比例
          center: [0, 0], // 居中显示
          roam: 'move', // 允许自由平移
          scaleLimit: {  // 保持与初始设置一致
            min: 0.5,
            max: 3
          }
        }]
      });
    }
    
    loading.value = false;
  } catch (error) {
    console.error('初始化图表失败:', error);
    loading.value = false;
    setTimeout(initChart, 500);
  }
};

// 更新节点状态
const updateNodeStatus = (nodeId: string, isOnline: boolean) => {
  if (!chart) return;
  
  // 更新状态映射
  nodeStatusMap.value[nodeId] = isOnline;
  
  // 重新初始化图表以应用新状态
  if (chartRef.value) {
    initChart();
  }
};

// 刷新所有设备状态
const refreshDeviceStatus = async () => {
  try {
    // 如果图表未初始化或DOM不存在，先初始化
    if (!chart && chartRef.value) {
      await fetchDeviceMappings();
      return;
    }
    
    // 重新获取设备映射数据
    await fetchDeviceMappings();
    
    // 获取活跃连接列表
    const activeConnections = deviceMappingManager.getActiveConnections();
    
    // 更新所有设备状态
    deviceMappings.value.forEach(mapping => {
      if (mapping.id) {
        const isActive = activeConnections.includes(mapping.id);
        nodeStatusMap.value[mapping.id.toString()] = isActive;
      }
    });
    
    // 更新中心服务器状态 (通常在线)
    nodeStatusMap.value["center"] = true;
    
    // 重新初始化图表
    if (chartRef.value) {
      initChart();
    }
  } catch (error) {
    console.error('刷新设备状态失败:', error);
  }
};

// 处理窗口大小变化
const handleResize = () => {
  if (chart && chartRef.value) {
    try {
      // 设置延时以确保DOM已更新
      setTimeout(() => {
        if (chart) {
          chart.resize();
        }
      }, 100);
    } catch (error) {
      console.error('调整图表大小失败:', error);
    }
  }
};

// 创建ResizeObserver
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  // 使用setTimeout确保DOM已完全渲染并且布局已计算
  let initAttempts = 0;
  const maxAttempts = 5;

  const tryInitChart = () => {
    initAttempts++;
    // 检查DOM是否已经渲染
    if (chartRef.value && chartRef.value.clientWidth > 0 && chartRef.value.clientHeight > 0) {
      fetchDeviceMappings();
    } else if (initAttempts < maxAttempts) {
      console.warn(`容器尺寸为0，延迟初始化 (尝试 ${initAttempts}/${maxAttempts})`);
      setTimeout(tryInitChart, 500);
    } else {
      console.error('达到最大尝试次数，可能DOM结构有问题');
      // 尽管DOM异常，仍尝试初始化
      fetchDeviceMappings();
    }
  };

  setTimeout(tryInitChart, 300);
  
  window.addEventListener('resize', handleResize);
  
  // 创建并添加ResizeObserver
  try {
    resizeObserver = new ResizeObserver(() => {
      if (chart && chartRef.value) {
        handleResize();
      }
    });
    
    if (chartRef.value) {
      resizeObserver.observe(chartRef.value);
    } else {
      // DOM还未初始化
      const checkForRef = setInterval(() => {
        if (chartRef.value) {
          resizeObserver?.observe(chartRef.value);
          clearInterval(checkForRef);
        }
      }, 500);
      
      // 设置安全超时，避免无限等待
      setTimeout(() => {
        clearInterval(checkForRef);
      }, 10000);
    }
  } catch (error) {
    console.warn('ResizeObserver不受支持，使用备用调整大小方法', error);
  }
});

onUnmounted(() => {
  // 标记组件已销毁
  destroyed.value = true;
  
  if (resizeObserver) {
    try {
      resizeObserver.disconnect();
    } catch (e) {
      console.error('断开ResizeObserver连接出错:', e);
    }
    resizeObserver = null;
  }
  
  window.removeEventListener('resize', handleResize);
  
  // 安全地销毁图表
  if (chart) {
    try {
      chart.dispose();
    } catch (e) {
      console.error('销毁图表出错:', e);
    }
    chart = null;
  }
});

// 监听属性变化
watch(
  () => [props.deviceCounts, props.primaryColor, props.scale, props.fontSize, props.nodeSize],
  () => {
    if (!destroyed.value) {
      initChart();
    }
  },
  { deep: true }
);

defineExpose({
  updateNodeStatus,
  refreshDeviceStatus
});
</script>

<style scoped>
.relationship-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 400px;
  position: relative;
}

.status-info {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  font-size: v-bind('props.fontSize + "px"');
  z-index: 10;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.status-icon {
  width: v-bind('14 * props.scale + "px"');
  height: v-bind('14 * props.scale + "px"');
  border-radius: 50%;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
}

.status-icon.online {
  background-color: #52c41a;
}

.status-icon.offline {
  background-color: #ff4d4f;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: var(--primary-color, #1890ff);
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 