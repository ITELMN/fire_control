import apiClient from './config';

export interface DeviceMapping {
  id?: number;           // 映射ID
  device_path: string;   // 设备路径
  plugin_id: string;     // 插件ID
  mqtt_server: string;   // MQTT服务器地址
  created_at?: string;   // 创建时间
  updated_at?: string;   // 更新时间
}

// 添加缓存系统以减少频繁请求
let mappingsCache: {
  data: DeviceMapping[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// 缓存有效期（毫秒）
const CACHE_TTL = 5000;

export const deviceMappingApi = {
  /**
   * 获取设备映射列表
   */
  getMappings: async (): Promise<DeviceMapping[]> => {
    // 检查缓存是否有效
    const now = Date.now();
    if (mappingsCache.data && now - mappingsCache.timestamp < CACHE_TTL) {
      return mappingsCache.data;
    }
    
    try {
      const response = await apiClient.get('/api/device-mappings');
      console.log('API响应 - 获取映射列表:', response.data);
      
      let mappingsList: DeviceMapping[] = [];
      
      // 确保返回数组，即使后端返回空或格式不正确
      if (Array.isArray(response.data)) {
        mappingsList = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // 如果是对象而不是数组，尝试提取数据
        if (Array.isArray(response.data.data)) {
          mappingsList = response.data.data;
        } else {
          console.warn('API返回数据格式不是数组:', response.data);
          mappingsList = [];
        }
      } else {
        console.warn('API返回数据格式异常:', response.data);
        mappingsList = [];
      }
      
      // 更新缓存
      mappingsCache = {
        data: mappingsList,
        timestamp: now
      };
      
      return mappingsList;
    } catch (error) {
      console.error('获取映射列表API错误:', error);
      throw error;
    }
  },

  /**
   * 获取单个设备映射
   */
  getMapping: async (id: number): Promise<DeviceMapping> => {
    // 尝试从缓存中获取
    if (mappingsCache.data) {
      const cachedMapping = mappingsCache.data.find(m => m.id === id);
      if (cachedMapping) {
        return cachedMapping;
      }
    }
    
    try {
      const response = await apiClient.get(`/api/device-mappings/${id}`);
      console.log(`API响应 - 获取映射 #${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`获取映射 #${id} API错误:`, error);
      throw error;
    }
  },

  /**
   * 创建设备映射
   */
  createMapping: async (mapping: Omit<DeviceMapping, 'id'>): Promise<DeviceMapping> => {
    try {
      const response = await apiClient.post('/api/device-mappings', mapping);
      
      // 创建后更新缓存
      mappingsCache = {
        data: null,
        timestamp: 0
      };
      
      return response.data;
    } catch (error) {
      console.error('创建映射API错误:', error);
      throw error;
    }
  },

  /**
   * 更新设备映射
   */
  updateMapping: async (id: number, mapping: Partial<DeviceMapping>): Promise<DeviceMapping> => {
    try {
      const response = await apiClient.put(`/api/device-mappings/${id}`, mapping);
      
      // 更新后刷新缓存
      mappingsCache = {
        data: null,
        timestamp: 0
      };
      
      return response.data;
    } catch (error) {
      console.error(`更新映射 #${id} API错误:`, error);
      throw error;
    }
  },

  /**
   * 删除设备映射
   */
  deleteMapping: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/device-mappings/${id}`);
      
      // 删除后刷新缓存
      mappingsCache = {
        data: null,
        timestamp: 0
      };
      
    } catch (error) {
      console.error(`删除映射 #${id} API错误:`, error);
      throw error;
    }
  }
}; 