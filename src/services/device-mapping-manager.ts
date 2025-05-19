import { deviceMappingApi } from './api/device-mappings';
import type { DeviceMapping } from './api/device-mappings';
import { deviceCommunicationService } from './device-communication';

/**
 * 设备映射管理服务
 * 负责管理设备映射的连接状态
 */
class DeviceMappingManager {
  constructor() {
    // 初始化
    console.log('设备映射管理服务已初始化');
  }

  /**
   * 立即连接指定映射
   */
  async executeMapping(mappingId: number, connectionData?: any): Promise<void> {
    try {
      console.log(`连接设备 #${mappingId}`, connectionData);
      
      // 使用设备通信服务执行映射
      const success = await deviceCommunicationService.executeMapping(mappingId, connectionData);
      
      if (success) {
        console.log(`设备 #${mappingId} 连接成功`);
      } else {
        console.error(`设备 #${mappingId} 连接失败`);
        throw new Error(`设备连接失败`);
      }
    } catch (error) {
      console.error(`连接设备 #${mappingId} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 断开指定映射的连接
   */
  async stopMapping(mappingId: number): Promise<void> {
    try {
      console.log(`断开设备 #${mappingId} 连接`);
      
      // 使用设备通信服务停止映射
      const success = await deviceCommunicationService.stopMapping(mappingId);
      
      if (success) {
        console.log(`设备 #${mappingId} 断开连接成功`);
      } else {
        console.error(`设备 #${mappingId} 断开连接失败`);
        throw new Error(`断开连接失败`);
      }
    } catch (error) {
      console.error(`断开设备 #${mappingId} 连接失败:`, error);
      throw error;
    }
  }
  
  /**
   * 检查映射是否已连接
   */
  isActive(mappingId: number): boolean {
    return deviceCommunicationService.isActive(mappingId);
  }
  
  /**
   * 获取所有已连接的设备ID
   */
  getActiveConnections(): number[] {
    return deviceCommunicationService.getActiveConnections();
  }
}

// 创建单例实例
export const deviceMappingManager = new DeviceMappingManager(); 