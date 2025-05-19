<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
    <Header />
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">插件管理</h1>
        <div class="flex items-center space-x-3">
          <button 
            :style="{ backgroundColor: 'var(--primary-color)', color: 'white' }"
            class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-md flex items-center"
            @click="fetchPlugins"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            刷新
          </button>
        </div>
      </div>

      <!-- 插件列表 -->
      <div class="mb-8 backdrop-blur-lg bg-white/70 rounded-xl shadow-lg border border-white/50 overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4" :style="{ backgroundColor: 'var(--primary-color)', color: 'white' }">
          <h2 class="text-lg font-semibold">插件列表</h2>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" :style="{ borderColor: 'var(--primary-color)' }"></div>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="error" class="bg-red-50 text-red-700 p-3 m-4 rounded-md">{{ error }}</div>
        
        <!-- 插件卡片列表 -->
        <div v-if="!loading && plugins.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <div 
            v-for="plugin in plugins" 
            :key="plugin.id"
            class="backdrop-blur-lg bg-white/70 p-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-white/50"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-800">{{ plugin.name }}</h3>
                <span class="text-xs text-gray-500">ID: {{ plugin.id }}</span>
              </div>
              <!-- 仅对于非GST插件显示状态 -->
              <div 
                v-if="plugin.id !== 1"
                class="text-sm px-2 py-1 rounded-full" 
                :class="plugin.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ plugin.active ? '活跃' : '未使用' }}
              </div>
            </div>
            <p class="text-gray-600 mb-4 min-h-[50px]">{{ plugin.description }}</p>
            
            <!-- 文件信息 -->
            <div class="text-xs text-gray-500 mb-3 space-y-1">
              <div v-if="plugin.config_file" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>配置: {{ plugin.config_file }}</span>
              </div>
              <div v-if="plugin.db_file" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span>数据库: {{ plugin.db_file }}</span>
              </div>
            </div>
            
            <div class="flex justify-between mt-auto pt-3 border-t border-gray-200">
              <button 
                :style="{ backgroundColor: 'var(--primary-color)', color: 'white' }"
                class="px-3 py-1.5 rounded-md text-sm hover:bg-opacity-90 transition-colors flex items-center"
                @click="configurePlugin(plugin.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                配置
              </button>
              
              <!-- 非GST插件显示切换按钮 -->
              <button 
                v-if="plugin.id !== 1"
                class="px-3 py-1.5 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center"
                @click="togglePluginActive(plugin.id, !plugin.active)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ plugin.active ? '停用' : '启用' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!loading && plugins.length === 0" class="text-center py-10 text-gray-600 italic">
          暂无插件数据
        </div>
      </div>
      
      <!-- 配置对话框 -->
      <div v-if="showConfigModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">插件配置</h3>
            <button 
              @click="closeConfigModal" 
              class="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="currentPlugin">
            <p class="mb-4">正在配置: {{ currentPlugin.name }} <span class="text-xs text-gray-500">(ID: {{ currentPlugin.id }})</span></p>
            
            <!-- 插件信息 -->
            <div class="mb-4 p-3 bg-gray-50 rounded-md">
              <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-gray-700">描述: {{ currentPlugin.description }}</span>
              </div>
              <div v-if="currentPlugin.config_file" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm text-gray-700">配置文件: {{ currentPlugin.config_file }}</span>
              </div>
              <div v-if="currentPlugin.db_file" class="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span class="text-sm text-gray-700">数据库文件: {{ currentPlugin.db_file }}</span>
              </div>
            </div>
            
            <!-- 配置错误提示 -->
            <div v-if="error" class="mb-4 p-3 bg-red-50 rounded-md text-red-600 text-sm">
              {{ error }}
            </div>
            
            <!-- 配置模式切换 -->
            <div v-if="false" class="mb-4 flex justify-end">
              <button 
                @click="toggleConfigMode" 
                class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" v-if="!rawConfigMode" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" v-if="rawConfigMode" />
                </svg>
                {{ rawConfigMode ? '使用表单模式' : '使用JSON编辑' }}
              </button>
            </div>
            
            <!-- GST插件专用配置表单 -->
            <div v-if="currentPlugin && currentPlugin.id === 1 && currentPlugin.name && currentPlugin.name.includes('GST')" class="space-y-4 mb-4">
              <h4 class="font-medium text-gray-700">海湾条约插件参数配置</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">设备ID (1-255)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="255" 
                    v-model="gstConfig.deviceId" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p class="text-xs text-gray-500 mt-1">允许范围: 1-255</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">功能码</label>
                  <select 
                    v-model="gstConfig.functionCode" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option :value="3">3</option>
                    <option :value="4">4</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">只能选择 3 或 4</p>
                </div>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                注意: 此配置只适用于海湾插件
              </div>
            </div>
            
            <!-- SCK插件专用配置表单 -->
            <div v-if="currentPlugin && currentPlugin.id === 2 && currentPlugin.name && currentPlugin.name.includes('SCK')" class="space-y-4">
              <h4 class="font-medium text-gray-700">四川赛科插件参数配置</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">设备地址 (0-255)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="255" 
                    v-model="sckConfig.addr" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">协议版本 (0-255)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="255" 
                    v-model="sckConfig.version" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <!-- 按钮组 -->
            <div class="flex justify-end space-x-3 mt-6">
              <button 
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors flex items-center"
                @click="closeConfigModal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                关闭
              </button>
              <button 
                :style="{ backgroundColor: 'var(--primary-color)' }"
                class="hover:bg-opacity-90 text-white px-4 py-2 rounded transition-colors flex items-center"
                @click="savePluginConfig"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                保存配置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import Header from '../components/Header.vue';
import { pluginsApi, type Plugin } from '../services/api/plugins';
import { authService } from '../services/auth';

// 状态
const plugins = ref<Plugin[]>([]);
const loading = ref(false);
const error = ref('');
const showConfigModal = ref(false);
const currentPlugin = ref<Plugin | null>(null);
const rawConfigMode = ref(false); // 是否使用原始配置模式
const rawConfigContent = ref(''); // 原始配置文件内容

// 特定插件配置
const gstConfig = reactive({
  deviceId: 0,
  functionCode: 0
});

const sckConfig = reactive({
  addr: 0,
  version: 0
});

// 获取插件列表
const fetchPlugins = async () => {
  loading.value = true;
  error.value = '';
  
  // 确保有有效的token
  if (!authService.isAuthenticated()) {
    console.log('检测到未认证状态');
    // 用户未认证，将自动重定向到登录页面
  }
  
  try {
    plugins.value = await pluginsApi.getAll();
  } catch (err: any) {
    console.error('获取插件失败:', err);
    error.value = err.response?.data?.message || '获取插件失败，请稍后再试';
    
    // 如果是401错误，将自动重定向到登录页面
    if (err.response?.status === 401) {
      console.log('收到401错误，重定向到登录页');
      // 401错误会被API拦截器处理，自动重定向到登录页
    }
  } finally {
    loading.value = false;
  }
};

// 切换插件活跃状态
const togglePluginActive = async (id: number, active: boolean) => {
  // 确保有有效的token
  if (!authService.isAuthenticated()) {
    // 用户未认证，将自动重定向到登录页面
    return;
  }
  
  try {
    console.log(`尝试切换插件 ${id} 状态为: ${active ? '活跃' : '未使用'}`);
    
    // 立即更新UI状态，提供即时反馈
    const plugin = plugins.value.find(p => p.id === id);
    if (!plugin) {
      error.value = '找不到指定插件';
      return;
    }
    
    // 先临时存储当前状态，以便出错时恢复
    const previousState = plugin.active;
    
    // 更新UI状态
    plugin.active = active;
    
    // 判断是否为GST插件 (ID 1)
    if (id === 1 && plugin.name && plugin.name.includes('GST')) {
      try {
        // 使用直接API端点更新GST插件状态
        console.log('使用直接API端点更新GST插件状态');
        await pluginsApi.toggleGstStatusDirect(active);
        console.log('GST插件状态已通过特定端点更新');
        
        // 成功后刷新插件列表以确保状态同步
        await fetchPlugins();
      } catch (gstErr) {
        console.error('GST插件状态更新失败:', gstErr);
        // 恢复UI状态
        plugin.active = previousState;
        error.value = '无法更新插件状态，请稍后再试。';
        
        // 自动清除错误信息
        setTimeout(() => {
          error.value = '';
        }, 3000);
      }
    } else {
      // 其他插件使用标准API方法
      try {
        // 使用API方法切换插件状态
        await pluginsApi.togglePluginStatus(id, active);
        console.log('插件状态切换成功');
        
        // 成功后刷新插件列表以确保状态同步
        await fetchPlugins();
      } catch (apiErr: any) {
        console.error('API调用失败，尝试使用备用方法:', apiErr);
        
        // 如果标准API调用失败，尝试直接通过配置文件更新
        try {
          // 根据插件ID确定配置文件名
          const configFileName = id === 2 ? 'sck_config.json' : `plugin_${id}_config.json`;
          
          // 获取当前配置
          const config = await pluginsApi.getConfigFile(configFileName);
          
          // 更新激活状态
          config.active = active;
          
          // 保存配置
          await pluginsApi.updateConfigFile(configFileName, config);
          console.log('通过直接配置文件更新成功');
          
          // 成功后刷新插件列表
          await fetchPlugins();
        } catch (backupErr: any) {
          // 如果备用方法也失败，恢复UI状态并显示错误
          console.error('备用方法也失败:', backupErr);
          plugin.active = previousState;
          error.value = '无法更新插件状态，服务器可能不支持此操作。';
          
          // 尝试在UI上保持一致性，即使服务器操作失败
          setTimeout(() => {
            error.value = '';
          }, 3000);
        }
      }
    }
  } catch (err: any) {
    console.error('切换插件状态出现错误:', err);
    error.value = err.message || '操作失败，请稍后再试';
    
    // 如果出现错误，回滚UI状态
    const plugin = plugins.value.find(p => p.id === id);
    if (plugin) {
      plugin.active = !active;
    }
    
    // 自动清除错误信息
    setTimeout(() => {
      error.value = '';
    }, 3000);
  }
};

// 配置插件
const configurePlugin = async (id: number) => {
  // 确保有有效的token
  if (!authService.isAuthenticated()) {
    // 用户未认证，将自动重定向到登录页面
    return;
  }
  
  // 重置错误信息
  error.value = '';
  
  try {
    // 获取插件详情
    console.log(`获取插件信息: ID=${id}`);
    const plugin = await pluginsApi.getById(id);
    currentPlugin.value = plugin;
    console.log(`插件详情:`, plugin);
    
    // 如果插件有配置文件，获取配置文件内容
    if (plugin.config_file) {
      try {
        console.log(`正在获取配置文件: ${plugin.config_file}`);
        
        // 判断是否为GST插件 (ID 1)
        if (id === 1 && plugin.name && plugin.name.includes('GST')) {
          try {
            // 使用特定端点获取GST插件配置
            console.log('使用直接API端点获取GST插件配置');
            const configData = await pluginsApi.getGstConfigDirect();
            console.log('GST插件配置通过特定端点获取成功:', configData);
            
            // 保存原始配置内容
            rawConfigContent.value = JSON.stringify(configData, null, 2);
            
            // 设置GST配置，确保设备ID在1-255范围内，功能码只能为3或4
            gstConfig.deviceId = configData.device_id || 1;
            if (gstConfig.deviceId < 1) gstConfig.deviceId = 1;
            if (gstConfig.deviceId > 255) gstConfig.deviceId = 255;
            
            gstConfig.functionCode = configData.function_code || 3;
            if (gstConfig.functionCode !== 3 && gstConfig.functionCode !== 4) {
              gstConfig.functionCode = 3;
            }
          } catch (gstErr) {
            console.error('通过特定端点获取GST配置失败:', gstErr);
            
            // 使用默认配置
            gstConfig.deviceId = 1;
            gstConfig.functionCode = 3;
            
            throw gstErr; // 让后续代码继续尝试其他方法
          }
        } else {
          try {
            // 尝试使用配置文件API获取配置
            const configData = await pluginsApi.getConfigFile(plugin.config_file);
            console.log(`配置获取成功:`, configData);
            
            // 保存原始配置内容，用于直接编辑模式
            rawConfigContent.value = JSON.stringify(configData, null, 2);
            
            // 根据插件类型处理配置
            if (plugin.name && plugin.name.includes('GST')) {
              gstConfig.deviceId = configData.device_id || 0;
              gstConfig.functionCode = configData.function_code || 0;
              console.log('设置GST配置:', gstConfig);
            } else if (plugin.name && plugin.name.includes('SCK')) {
              sckConfig.addr = configData.addr || 0;
              sckConfig.version = configData.version || 0;
              console.log('设置SCK配置:', sckConfig);
            }
          } catch (directErr) {
            console.error('通过配置文件API获取失败，尝试插件配置API:', directErr);
            
            // 如果直接通过配置文件API获取失败，尝试通过插件配置API
            const configData = await pluginsApi.getPluginConfig(id, plugin.config_file);
            console.log(`通过插件配置API获取成功:`, configData);
            
            // 保存原始配置内容
            rawConfigContent.value = JSON.stringify(configData, null, 2);
            
            // 处理配置
            if (plugin.name && plugin.name.includes('GST')) {
              gstConfig.deviceId = configData.device_id || 0;
              gstConfig.functionCode = configData.function_code || 0;
            } else if (plugin.name && plugin.name.includes('SCK')) {
              sckConfig.addr = configData.addr || 0;
              sckConfig.version = configData.version || 0;
            }
          }
        }
      } catch (configErr: any) {
        console.error(`获取插件配置文件内容失败:`, configErr);
        error.value = configErr.message || `无法加载配置文件 ${plugin.config_file}`;
        
        // 使用默认配置
        console.log('使用默认配置作为备选');
        if (plugin.name && plugin.name.includes('GST')) {
          rawConfigContent.value = JSON.stringify({
            device_id: 0,
            function_code: 0,
            active: plugin.active || false
          }, null, 2);
          gstConfig.deviceId = 0;
          gstConfig.functionCode = 0;
        } else if (plugin.name && plugin.name.includes('SCK')) {
          rawConfigContent.value = JSON.stringify({
            addr: 0,
            version: 0,
            active: plugin.active || false
          }, null, 2);
          sckConfig.addr = 0;
          sckConfig.version = 0;
        }
        
        // 延迟清除错误信息，让用户看清楚
        setTimeout(() => {
          error.value = '';
        }, 3000);
      }
    } else {
      console.warn('插件没有配置文件信息');
      error.value = '当前插件没有可配置的参数。';
      
      // 延迟清除错误信息
      setTimeout(() => {
        error.value = '';
      }, 3000);
    }
    
    showConfigModal.value = true;
  } catch (err: any) {
    console.error('获取插件详情失败:', err);
    error.value = err.message || '获取插件详情失败，请稍后再试';
    
    // 如果是401错误，API拦截器会处理
    if (err.response?.status === 401) {
      // 将自动重定向到登录页面
    }
    
    // 自动清除错误信息
    setTimeout(() => {
      error.value = '';
    }, 3000);
  }
};

// 保存插件配置
const savePluginConfig = async () => {
  if (!currentPlugin.value) return;
  
  // 确保有有效的token
  if (!authService.isAuthenticated()) {
    // 用户未认证，将自动重定向到登录页面
    return;
  }
  
  try {
    const pluginId = currentPlugin.value.id;
    const configFileName = currentPlugin.value.config_file;
    
    if (!configFileName) {
      error.value = '无法保存配置：插件没有配置文件信息';
      return;
    }
    
    let configData: Record<string, any> = {};
    
    // 检查是否使用原始编辑模式
    if (rawConfigMode.value) {
      try {
        // 解析JSON内容
        configData = JSON.parse(rawConfigContent.value);
      } catch (parseErr) {
        error.value = '配置内容不是有效的JSON格式';
        console.error('JSON解析错误:', parseErr);
        return;
      }
    } else {
      // 根据插件类型构建配置数据
      if (currentPlugin.value.name && currentPlugin.value.name.includes('GST')) {
        // 验证GST插件参数有效性
        let deviceId = gstConfig.deviceId;
        let functionCode = gstConfig.functionCode;
        
        // 确保设备ID在1-255范围内
        if (deviceId < 1) deviceId = 1;
        if (deviceId > 255) deviceId = 255;
        
        // 确保功能码只能为3或4
        if (functionCode !== 3 && functionCode !== 4) {
          functionCode = 3;
        }
        
        configData = {
          device_id: deviceId,
          function_code: functionCode
        };
      } else if (currentPlugin.value.name && currentPlugin.value.name.includes('SCK')) {
        configData = {
          addr: sckConfig.addr,
          version: sckConfig.version
        };
      }
    }
    
    // 保存配置文件
    console.log(`准备保存插件配置:`, configData);
    
    // 保留当前插件的激活状态
    const plugin = plugins.value.find(p => p.id === pluginId);
    if (plugin) {
      configData.active = plugin.active;
    }
    
    // 判断是否为GST插件 (ID 1)
    if (pluginId === 1 && currentPlugin.value.name && currentPlugin.value.name.includes('GST')) {
      // 使用直接端点更新GST插件配置 - 根据错误信息，这个是可以正常工作的
      console.log('使用直接API更新GST插件配置');
      await pluginsApi.updateGstConfigDirect({
        device_id: configData.device_id,
        function_code: configData.function_code,
        active: true  // 自动激活GST插件
      });
      console.log('GST插件配置已通过特定端点更新，并自动激活');
      
      // 关闭对话框
      closeConfigModal();
      
      // 刷新插件列表
      await fetchPlugins();
    } else {
      // 其他插件，尝试常规更新方法
      try {
        // 尝试使用更新后的API更新配置
        await pluginsApi.updateConfigFile(configFileName, configData);
        console.log('配置更新成功');
        
        // 关闭对话框
        closeConfigModal();
        
        // 刷新插件列表
        await fetchPlugins();
      } catch (saveErr: any) {
        console.error('保存配置失败，尝试备用方法:', saveErr);
        
        // 如果通过配置文件API失败，尝试使用插件配置API
        try {
          await pluginsApi.updatePluginConfig(pluginId, configData, configFileName);
          console.log('通过备用API保存成功');
          
          // 关闭对话框
          closeConfigModal();
          
          // 刷新插件列表
          await fetchPlugins();
        } catch (backupErr: any) {
          console.error('备用保存方法也失败:', backupErr);
          error.value = '无法保存配置，服务器可能不支持此操作。';
          
          // 延迟一会儿显示错误信息，让用户看清楚
          setTimeout(() => {
            error.value = '';
          }, 3000);
        }
      }
    }
  } catch (err: any) {
    console.error('保存插件配置失败:', err);
    error.value = err.message || '保存配置失败，请稍后再试';
    
    // 如果是401错误，API拦截器会处理
    if (err.response?.status === 401) {
      // 将自动重定向到登录页面
    }
    
    // 自动清除错误信息
    setTimeout(() => {
      error.value = '';
    }, 3000);
  }
};

// 切换配置编辑模式
const toggleConfigMode = () => {
  // GST插件不支持切换到原始模式
  if (currentPlugin.value && currentPlugin.value.id === 1) {
    return;
  }
  
  rawConfigMode.value = !rawConfigMode.value;
  console.log('切换配置编辑模式:', rawConfigMode.value ? '原始JSON' : '表单模式');
};

// 关闭配置对话框
const closeConfigModal = () => {
  showConfigModal.value = false;
  currentPlugin.value = null;
  rawConfigMode.value = false;
  rawConfigContent.value = '';
  // 重置特定配置
  gstConfig.deviceId = 1;  // 默认值为1，符合1-255范围
  gstConfig.functionCode = 3;  // 默认值为3，只能是3或4
  sckConfig.addr = 0;
  sckConfig.version = 0;
};

// 组件挂载时获取插件列表
onMounted(() => {
  fetchPlugins();
});
</script>
