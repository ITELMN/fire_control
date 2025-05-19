import { ref, onMounted } from 'vue';
import axios from 'axios';

// 全局API请求缓存
type RequestCache = {
  data: any;
  timestamp: number;
  inProgress: boolean;
  callbacks: Array<(data: any) => void>;
};

const API_CACHE: Record<string, RequestCache> = {};
const CACHE_TTL = 5000; // 增加缓存时间至5000毫秒，减少API请求频率

// 全局API请求方法
export async function fetchApiData(url: string): Promise<any> {
  const currentTime = Date.now();
  
  // 检查缓存
  if (API_CACHE[url]) {
    const cache = API_CACHE[url];
    
    // 如果缓存新鲜且有数据，直接返回
    if (currentTime - cache.timestamp < CACHE_TTL && cache.data) {
      return cache.data;
    }
    
    // 如果有请求正在进行中，等待该请求完成
    if (cache.inProgress) {
      return new Promise((resolve) => {
        cache.callbacks.push(resolve);
      });
    }
  }
  
  // 创建新缓存条目或更新现有条目
  API_CACHE[url] = API_CACHE[url] || {
    data: null,
    timestamp: 0,
    inProgress: false,
    callbacks: []
  };
  
  // 标记请求进行中
  API_CACHE[url].inProgress = true;
  
  try {
    // 从localStorage获取token
    const token = localStorage.getItem('auth_token');
    
    // 发起请求
    const response = await fetch(url, {
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
    
    // 更新缓存
    API_CACHE[url].data = data;
    API_CACHE[url].timestamp = currentTime;
    
    // 处理等待中的回调
    API_CACHE[url].callbacks.forEach(callback => callback(data));
    API_CACHE[url].callbacks = [];
    
    return data;
  } catch (error) {
    console.error(`全局API请求失败 (${url}):`, error);
    throw error;
  } finally {
    // 标记请求结束
    API_CACHE[url].inProgress = false;
  }
}

// 通信数据类型
export interface CommunicationData {
  timestamp: number;
  value: number;
}

// API 数据类型
interface DeviceRatesResponse {
  total_mqtt_communication: {
    rate: number;
    messages: number;
  };
  total_plugin_communication: {
    rate: number;
    messages: number;
  };
}

// 基础通信服务
abstract class BaseCommunicationService {
  protected intervalId: number | null = null;
  
  // 最新的通信速率
  public currentRate = ref<number>(0);
  
  // 历史数据，限制为100个点
  public historyData = ref<CommunicationData[]>([]);
  
  // 是否已连接
  public isConnected = ref<boolean>(true);
  
  // 是否有错误
  public hasError = ref<boolean>(false);

  constructor() {
    // 初始化空数据
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
      this.historyData.value.push({
        timestamp: now - (50 - i) * 1000,
        value: 0
      });
    }
  }

  // 添加数据点
  protected addDataPoint(value: number): void {
    // Ensure the value is a valid number
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      console.warn('Invalid value provided to addDataPoint:', value);
      return;
    }
    
    this.currentRate.value = numericValue;
    
    // 添加到历史数据
    this.historyData.value.push({
      timestamp: Date.now(),
      value: numericValue
    });
    
    // 限制历史数据量
    if (this.historyData.value.length > 100) {
      this.historyData.value.shift();
    }
  }

  // 停止数据更新
  public stopUpdates(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  // 开始获取真实数据 - 抽象方法，需要被子类实现
  public abstract startRealDataFetching(updateInterval?: number): void;
}

// 通用速率通信服务
export class RatesCommunicationService extends BaseCommunicationService {
  private static instances: Map<string, RatesCommunicationService> = new Map();
  private apiUrl: string;
  private rateProperty: string;
  private requestInProgress: boolean = false;
  
  // 获取或创建实例
  public static getInstance(apiUrl: string, rateProperty: string): RatesCommunicationService {
    const key = `${apiUrl}:${rateProperty}`;
    if (!RatesCommunicationService.instances.has(key)) {
      RatesCommunicationService.instances.set(key, new RatesCommunicationService(apiUrl, rateProperty));
    }
    return RatesCommunicationService.instances.get(key)!;
  }
  
  // 私有构造函数
  private constructor(apiUrl: string, rateProperty: string) {
    super();
    this.apiUrl = apiUrl;
    this.rateProperty = rateProperty;
    console.log(`Creating RatesCommunicationService for ${apiUrl} with property ${rateProperty}`);
    // 移除自动启动逻辑，避免创建实例时就开始频繁请求
    // 通过显式调用startRealDataFetching启动
  }
  
  // 开始获取真实数据
  public startRealDataFetching(updateInterval: number = 3000): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isConnected.value = true;
    
    // 立即获取一次数据
    this.fetchData();
    
    this.intervalId = window.setInterval(() => {
      this.fetchData();
    }, updateInterval);
    
    console.log(`Started data fetching for ${this.apiUrl} with interval ${updateInterval}ms`);
  }
  
  // 从嵌套对象中获取属性值
  private getNestedPropertyValue(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
  
  // 获取API数据
  private async fetchData(): Promise<void> {
    // 如果已经有请求在进行中，则跳过本次请求
    if (this.requestInProgress) {
      return;
    }
    
    this.requestInProgress = true;
    
    try {
      // 使用全局请求方法获取数据
      const responseData = await fetchApiData(this.apiUrl);
      
      this.isConnected.value = true;
      this.hasError.value = false;
      
      // 尝试从响应中提取指定的属性（支持嵌套对象的点表示法，如 "total_mqtt_communication.rate"）
      const rateValue = this.getNestedPropertyValue(responseData, this.rateProperty);
      
      if (rateValue !== undefined) {
        const numericValue = Number(rateValue);
        
        // 确保是有效的数字
        if (!isNaN(numericValue)) {
          this.addDataPoint(numericValue);
        } else {
          console.warn(`属性 ${this.rateProperty} 的值不是有效的数字:`, rateValue);
          this.hasError.value = true;
        }
      } else {
        console.warn(`属性 ${this.rateProperty} 在响应数据中不存在:`, responseData);
        this.hasError.value = true;
      }
    } catch (error) {
      console.error(`获取通信速率数据失败 (${this.apiUrl}):`, error);
      this.isConnected.value = false;
      this.hasError.value = true;
      
      // 在错误情况下添加零值以保持图表的连续性
      this.addDataPoint(0);
    } finally {
      this.requestInProgress = false;
    }
  }
}

// MQTT通信服务
export class MqttCommunicationService extends BaseCommunicationService {
  private static instance: MqttCommunicationService;
  
  // 单例模式
  public static getInstance(): MqttCommunicationService {
    if (!MqttCommunicationService.instance) {
      MqttCommunicationService.instance = new MqttCommunicationService();
    }
    return MqttCommunicationService.instance;
  }
  
  // 私有构造函数
  private constructor() {
    super();
    // 移除自动启动逻辑
  }
  
  // 开始获取真实数据
  public startRealDataFetching(updateInterval: number = 3000): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isConnected.value = true;
    
    // 立即获取一次数据
    this.fetchData();
    
    this.intervalId = window.setInterval(() => {
      this.fetchData();
    }, updateInterval);
  }
  
  // 获取API数据
  private async fetchData(): Promise<void> {
    try {
      // 使用全局请求方法获取数据
      const data = await fetchApiData('http://192.168.1.230:8080/api/devices/rates');
      
      this.hasError.value = false;
      
      if (data && data.total_mqtt_communication && typeof data.total_mqtt_communication.rate === 'number') {
        this.addDataPoint(data.total_mqtt_communication.rate);
      } else {
        console.warn('MQTT通信数据格式不正确或缺少速率值:', data);
        this.hasError.value = true;
      }
    } catch (error) {
      console.error('获取MQTT数据失败:', error);
      this.hasError.value = true;
    }
  }
}

// Modbus通信服务
export class ModbusCommunicationService extends BaseCommunicationService {
  private static instance: ModbusCommunicationService;
  
  // 单例模式
  public static getInstance(): ModbusCommunicationService {
    if (!ModbusCommunicationService.instance) {
      ModbusCommunicationService.instance = new ModbusCommunicationService();
    }
    return ModbusCommunicationService.instance;
  }
  
  // 私有构造函数
  private constructor() {
    super();
    // 移除自动启动逻辑
  }
  
  // 开始获取真实数据
  public startRealDataFetching(updateInterval: number = 3000): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isConnected.value = true;
    
    // 立即获取一次数据
    this.fetchData();
    
    this.intervalId = window.setInterval(() => {
      this.fetchData();
    }, updateInterval);
  }
  
  // 获取API数据
  private async fetchData(): Promise<void> {
    try {
      // 使用全局请求方法获取数据
      const data = await fetchApiData('http://192.168.1.230:8080/api/devices/rates');
      
      this.hasError.value = false;
      
      if (data && data.total_plugin_communication && typeof data.total_plugin_communication.rate === 'number') {
        this.addDataPoint(data.total_plugin_communication.rate);
      } else {
        console.warn('插件通信数据格式不正确或缺少速率值:', data);
        this.hasError.value = true;
      }
    } catch (error) {
      console.error('获取插件通信数据失败:', error);
      this.hasError.value = true;
    }
  }
}

// 创建服务实例
export const mqttService = MqttCommunicationService.getInstance();
export const modbusService = ModbusCommunicationService.getInstance();

// 创建通用速率服务实例
export const createRateService = (apiUrl: string, rateProperty: string) => {
  return RatesCommunicationService.getInstance(apiUrl, rateProperty);
};

// 预定义的实例，可以直接使用
export const apiRatesMqttService = RatesCommunicationService.getInstance(
  'http://192.168.1.230:8080/api/devices/rates', 
  'total_mqtt_communication.rate'
);

export const apiRatesModbusService = RatesCommunicationService.getInstance(
  'http://192.168.1.230:8080/api/devices/rates', 
  'total_plugin_communication.rate'
); 