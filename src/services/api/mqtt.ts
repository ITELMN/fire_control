import apiClient from './config';

interface MqttConfig {
  id?: number;
  server: string;
  port: number;
  topic: string;
  client_id: string;
  username?: string;
  password?: string;
  qos: number;
}

export const mqttApi = {
  /**
   * 获取所有MQTT配置
   */
  getAllConfigs: async () => {
    const response = await apiClient.get('/api/mqtt/configs');
    return response.data;
  },

  /**
   * 添加新的MQTT配置
   */
  addConfig: async (config: MqttConfig) => {
    const response = await apiClient.post('/api/mqtt/configs', config);
    return response.data;
  },

  /**
   * 更新现有MQTT配置
   */
  updateConfig: async (id: number, config: MqttConfig) => {
    const response = await apiClient.put(`/api/mqtt/configs/${id}`, config);
    return response.data;
  },

  /**
   * 删除MQTT配置
   */
  deleteConfig: async (id: number) => {
    const response = await apiClient.delete(`/api/mqtt/configs/${id}`);
    return response.data;
  }
}; 