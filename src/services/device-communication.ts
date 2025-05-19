import { deviceMappingApi } from './api/device-mappings';
import type { DeviceMapping } from './api/device-mappings';
import apiClient from './api/config';

/**
 * 设备通信服务
 * 负责执行设备映射，建立设备与插件之间的通信
 */
class DeviceCommunicationService {
  private activeConnections: Map<number, boolean> = new Map();

  /**
   * 执行设备映射
   * @param mappingId 映射ID
   * @param connectionData 可选的连接数据，如果提供则直接使用而不从API获取
   * @returns 执行结果
   */
  async executeMapping(mappingId: number, connectionData?: any): Promise<boolean> {
    try {
      console.log(`开始连接设备 #${mappingId}`);
      
      // 检查是否已经有活跃连接
      if (this.activeConnections.get(mappingId)) {
        console.log(`设备 #${mappingId} 已经在连接中`);
        return true;
      }
      
      // 标记为活跃连接
      this.activeConnections.set(mappingId, true);
      
      // 准备POST数据
      let postData;
      
      if (connectionData) {
        // 如果提供了连接数据，直接使用
        postData = {
          device_path: connectionData.device_path,
          plugin_id: connectionData.plugin_id,
          mqtt_server: connectionData.mqtt_server
        };
      } else {
        // 否则，获取映射详情
        const mapping = await deviceMappingApi.getMapping(mappingId);
        postData = {
        device_path: mapping.device_path,
        plugin_id: mapping.plugin_id,
        mqtt_server: mapping.mqtt_server
      };
      }
      
      console.log(`发送设备连接请求:`, postData);
      
      // 直接发送POST请求到连接API
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://192.168.1.230:8080/api/device-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(postData)
      });

      const responseData = await response.json();
      console.log(`设备连接结果:`, responseData);
      
      if (!response.ok) {
        throw new Error(`连接失败: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`连接设备 #${mappingId} 失败:`, error);
      // 移除活跃连接标记
      this.activeConnections.set(mappingId, false);
      return false;
    }
  }
  
  /**
   * 停止设备映射执行
   * @param mappingId 映射ID
   * @returns 停止结果
   */
  async stopMapping(mappingId: number): Promise<boolean> {
    try {
      console.log(`停止映射 #${mappingId}`);
      
      // 检查是否有活跃连接
      if (!this.activeConnections.get(mappingId)) {
        console.log(`设备 #${mappingId} 未在连接中`);
        return true;
      }
      
      try {
        // 获取映射详情
        const mapping = await deviceMappingApi.getMapping(mappingId);
        
        // 尝试向服务器发送请求通知停止连接
        const token = localStorage.getItem('auth_token');
        await fetch(`http://192.168.1.230:8080/api/device-mappings/${mappingId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
      } catch (error) {
        console.warn(`发送停止请求失败，但仍会清除本地连接状态:`, error);
      }
      
      // 移除活跃连接标记
      this.activeConnections.set(mappingId, false);
      
      console.log(`设备 #${mappingId} 已断开连接`);
      
      return true;
    } catch (error) {
      console.error(`断开设备 #${mappingId} 连接失败:`, error);
      return false;
    }
  }
  
  /**
   * 检查映射是否正在执行
   * @param mappingId 映射ID
   * @returns 是否正在执行
   */
  isActive(mappingId: number): boolean {
    return this.activeConnections.get(mappingId) || false;
  }
  
  /**
   * 获取所有活跃的映射ID
   * @returns 活跃映射ID数组
   */
  getActiveConnections(): number[] {
    const activeIds: number[] = [];
    this.activeConnections.forEach((active, id) => {
      if (active) activeIds.push(id);
    });
    return activeIds;
  }
}

// 创建单例实例
export const deviceCommunicationService = new DeviceCommunicationService(); 