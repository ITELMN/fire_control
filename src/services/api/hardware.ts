import apiClient from './config';

export interface HardwareInfo {
  kernel: string;      // Linux内核版本号及编译时间
  board: string;       // 设备型号
  cellular?: string;   // 无线模块型号（可选）
  wifi?: string;       // WIFI模块型号（可选）
}

export interface TemperatureInfo {
  cpu_temp: number;    // CPU温度（摄氏度）
  board_temp: number;  // 主板温度（摄氏度）
}

export const hardwareApi = {
  /**
   * 获取硬件信息
   */
  getInfo: async (): Promise<HardwareInfo> => {
    const response = await apiClient.get('/api/hardware/info');
    return response.data;
  },

  /**
   * 获取温度信息
   */
  getTemperature: async (): Promise<TemperatureInfo> => {
    const response = await apiClient.get('/api/hardware/temperature');
    return response.data;
  }
}; 