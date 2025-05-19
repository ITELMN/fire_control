// 导出所有组件
import GaugeChart from '../components/GaugeChart.vue';
import LineChart from '../components/LineChart.vue';
import CommunicationChart from '../components/CommunicationChart.vue';
import RelationshipChart from '../components/RelationshipChart.vue';

// 导出单个组件
export { GaugeChart, LineChart, CommunicationChart, RelationshipChart };

// 默认导出所有组件
export default {
  GaugeChart,
  LineChart,
  CommunicationChart,
  RelationshipChart
}; 