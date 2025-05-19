import apiClient from './config';

export interface Device {
  path: string;    // 设备路径
  type: string;    // 设备类型
}

export interface DeviceStatus {
  device_path: string;  // 设备路径
  connected: boolean;   // 连接状态
  modbus_rate: number;  // Modbus通信速率（字节/秒）
  mqtt_rate: number;    // MQTT通信速率（字节/秒）
}

export interface CommunicationRates {
  total_plugin_communication: {
    rate: number;     // 所有设备的总插件通信速率（字节/秒）
    messages: number; // 所有设备的总插件消息数
  };
  total_mqtt_communication: {
    rate: number;     // 所有设备的总MQTT通信速率（字节/秒）
    messages: number; // 所有设备的总MQTT消息数
  };
}

export const deviceApi = {
  /**
   * 获取设备列表
   */
  getDevices: async (): Promise<Device[]> => {
    const response = await apiClient.get('/devices');
    return response.data;
  },

  /**
   * 获取设备详情
   */
  getDeviceInfo: async (deviceName: string): Promise<Device> => {
    const response = await apiClient.get(`/devices/info/${deviceName}`);
    return response.data;
  },

  /**
   * 删除设备
   */
  removeDevice: async (deviceName: string): Promise<void> => {
    await apiClient.delete(`/devices/remove/${deviceName}`);
  },

  /**
   * 扫描设备
   */
  scanDevices: async (): Promise<Device[]> => {
    const response = await apiClient.post('/devices/scan');
    return response.data;
  },

  /**
   * 获取所有设备状态
   */
  getAllDevicesStatus: async (): Promise<Record<string, DeviceStatus>> => {
    const response = await apiClient.get('/devices/status');
    return response.data;
  },

  /**
   * 获取单个设备状态
   */
  getDeviceStatus: async (deviceName: string): Promise<DeviceStatus> => {
    const response = await apiClient.get(`/devices/status/${deviceName}`);
    return response.data;
  },

  /**
   * 获取总通信速率
   */
  getCommunicationRates: async (): Promise<CommunicationRates> => {
    const response = await apiClient.get('/devices/rates');
    return response.data;
  }
}; 