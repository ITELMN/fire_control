import apiClient from './config';
import { systemApi } from './system';
import { pluginsApi } from './plugins';
import { mqttApi } from './mqtt';
import { hardwareApi } from './hardware';
import { deviceApi } from './devices';
import { deviceMappingApi } from './device-mappings';


// 导出默认的API客户端实例
export { default as apiClient } from './config';

// 导出所有API服务
export const api = {
  system: systemApi,
  plugins: pluginsApi,
  mqtt: mqttApi,
  hardware: hardwareApi,
  device: deviceApi,
  deviceMapping: deviceMappingApi,
};

// 同时单独导出各个服务，方便直接引用
export { 
  systemApi, 
  pluginsApi, 
  mqttApi, 
  hardwareApi,
  deviceApi,
  deviceMappingApi
}; 