import apiClient from './config';

export interface SystemStatus {
  upper_computer: boolean;
  lower_computer: boolean;
  mqtt_server: boolean;
}

export const systemApi = {
  /**
   * 系统登录并获取Token
   */
  login: async (credentials: { username: string; password: string }): Promise<string> => {
    try {
      const response = await apiClient.post('/login', credentials);
      // 保存token到本地存储
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data.token;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /**
   * 获取系统连接状态
   */
  getStatus: async (): Promise<SystemStatus> => {
    try {
      const response = await apiClient.get('/status');
      console.log('系统状态响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取系统状态失败:', error);
      // 如果获取状态失败，返回所有系统离线状态
      return {
        upper_computer: false,
        lower_computer: false,
        mqtt_server: false
      };
    }
  },

  /**
   * 修改用户密码
   */
  changePassword: async (username: string, newPassword: string): Promise<string> => {
    try {
      const response = await apiClient.post('/change-password', {
        username,
        new_password: newPassword
      });
      
      // 更新本地存储的token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data.token;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }
}; 