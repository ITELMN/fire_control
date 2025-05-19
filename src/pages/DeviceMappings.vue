<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
    <Header />
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">建立连接</h1>
        <div class="flex items-center space-x-3">
          <button 
            v-if="selectedMappings.length > 0"
            @click="handleBatchDelete" 
            :style="{ backgroundColor: 'var(--danger-color)' }"
            class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-colors shadow-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            批量删除 ({{ selectedMappings.length }})
          </button>
          <button 
            @click="openCreateModal" 
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            创建连接
          </button>
          <button 
            :style="{ backgroundColor: 'var(--primary-color)' }"
            class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-colors shadow-md flex items-center"
            @click="fetchMappings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            刷新
          </button>
        </div>
      </div>
      
      <!-- 映射列表 -->
      <div class="mb-8 backdrop-blur-lg bg-white/70 rounded-xl shadow-lg border border-white/50 overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4" :style="{ backgroundColor: 'var(--primary-color)', color: 'white' }">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">连接列表</h2>
            <div class="flex items-center space-x-2" v-if="mappings.length > 0">
              <input 
                id="select-all"
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
              />
              <label for="select-all" class="text-sm text-white">全选</label>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" :style="{ borderColor: 'var(--primary-color)' }"></div>
        </div>
        
        <div v-else-if="mappings.length === 0" class="text-center py-10 text-gray-600 italic">
          未创建任何设备连接，请点击"创建连接"按钮
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead :style="{ backgroundColor: 'var(--primary-color-light)', color: 'white' }">
              <tr>
                <th scope="col" class="px-3 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">选择</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">设备路径</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">插件ID</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">MQTT服务器</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">连接状态</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="mapping in mappings" :key="mapping.id" class="hover:bg-gray-50">
                <td class="px-3 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    :checked="isSelected(mapping)" 
                    @change="toggleSelect(mapping)"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    {{ mapping.device_path }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    {{ mapping.plugin_id }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {{ mapping.mqtt_server }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <span :class="isActive(mapping.id) ? 'bg-green-500' : 'bg-gray-300'" class="inline-block w-2 h-2 rounded-full mr-2"></span>
                    {{ isActive(mapping.id) ? '已连接' : '未连接' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    v-if="!isActive(mapping.id)"
                    @click="executeMapping(mapping)" 
                    :style="{ backgroundColor: 'var(--success-color)' }"
                    class="hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-sm transition-colors inline-flex items-center"
                    :disabled="executing === mapping.id"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    连接
                  </button>
                  <button 
                    v-else
                    @click="stopMapping(mapping)" 
                    :style="{ backgroundColor: 'var(--danger-color)' }"
                    class="hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-sm transition-colors inline-flex items-center"
                    :disabled="stopping === mapping.id"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    断开
                  </button>
                  <button 
                    @click="editMapping(mapping)" 
                    :style="{ backgroundColor: 'var(--warning-color)' }"
                    class="hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-sm transition-colors inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    编辑
                  </button>
                  <button 
                    @click="confirmDeleteMapping(mapping)" 
                    :style="{ backgroundColor: 'var(--danger-color)' }"
                    class="hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-sm transition-colors inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 创建/编辑映射模态框 -->
      <div v-if="showMappingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ isEditing ? '编辑连接' : '创建连接' }}</h3>
            <button @click="showMappingModal = false" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveMapping" class="space-y-4">
            <div>
              <label for="device_path" class="block text-sm font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                设备路径
              </label>
              <input
                id="device_path"
                v-model="mappingForm.device_path"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label for="plugin_id" class="block text-sm font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                插件ID
              </label>
              <input
                id="plugin_id"
                v-model="mappingForm.plugin_id"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label for="mqtt_server" class="block text-sm font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                MQTT服务器
              </label>
              <input
                id="mqtt_server"
                v-model="mappingForm.mqtt_server"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showMappingModal = false"
                class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                取消
              </button>
              <button
                type="submit"
                :style="{ backgroundColor: 'var(--primary-color)' }"
                class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                :disabled="saving"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" v-if="!saving">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <svg class="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" v-else>
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 删除确认模态框 -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div class="flex items-center mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="text-lg font-bold">确认删除映射</h3>
          </div>
          <p class="mb-6">确定要删除设备 "{{ mappingToDelete?.device_path }}" 的映射吗？此操作无法撤销。</p>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showDeleteModal = false" 
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              取消
            </button>
            <button 
              type="button" 
              @click="deleteMapping" 
              :style="{ backgroundColor: 'var(--danger-color)' }"
              class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              :disabled="deleting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" v-if="!deleting">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg class="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" v-else>
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="deleting">删除中...</span>
              <span v-else>删除</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 批量删除确认模态框 -->
      <div v-if="showBatchDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div class="flex items-center mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="text-lg font-bold">确认批量删除</h3>
          </div>
          <p class="mb-6">确定要删除选中的 {{ selectedMappings.length }} 个映射吗？此操作无法撤销。</p>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showBatchDeleteModal = false" 
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              取消
            </button>
            <button 
              type="button" 
              @click="batchDeleteMappings" 
              :style="{ backgroundColor: 'var(--danger-color)' }"
              class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              :disabled="batchDeleting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" v-if="!batchDeleting">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg class="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" v-else>
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="batchDeleting">删除中...</span>
              <span v-else>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Header from '../components/Header.vue';
import { deviceMappingApi, type DeviceMapping } from '../services/api/device-mappings';
import { deviceMappingManager } from '../services/device-mapping-manager';

// 映射列表
const mappings = ref<DeviceMapping[]>([]);

// 选择状态
const selectedMappings = ref<DeviceMapping[]>([]);

// 加载状态
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const batchDeleting = ref(false);
const executing = ref<number | null>(null);
const stopping = ref<number | null>(null);

// 模态框状态
const showMappingModal = ref(false);
const showDeleteModal = ref(false);
const showBatchDeleteModal = ref(false);
const isEditing = ref(false);
const mappingToDelete = ref<DeviceMapping | null>(null);

// 表单数据
const mappingForm = ref<DeviceMapping>({
  device_path: '',
  plugin_id: '',
  mqtt_server: ''
});

// 计算全选状态
const isAllSelected = computed(() => {
  return mappings.value.length > 0 && selectedMappings.value.length === mappings.value.length;
});

// 获取映射列表
const fetchMappings = async () => {
  loading.value = true;
  try {
    mappings.value = await deviceMappingApi.getMappings();
    
    // 获取通信速率信息，用于验证连接是否成功
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://192.168.1.230:8080/api/devices/rates', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const ratesData = await response.json();
        console.log('获取到通信速率数据:', ratesData);
        
        // 如果有通信数据，说明有设备已连接
        if (ratesData.total_mqtt_communication && ratesData.total_mqtt_communication.rate > 0) {
          console.log('检测到活跃的设备连接，通信速率:', ratesData.total_mqtt_communication.rate);
        }
      }
    } catch (ratesError) {
      console.warn('获取通信速率失败，但不影响映射列表展示:', ratesError);
    }
  } catch (error) {
    console.error('获取映射列表失败:', error);
    // 失败时提供用户反馈
    alert('获取映射列表失败，请检查网络连接或联系管理员');
  } finally {
    loading.value = false;
  }
};

// 打开创建模态框
const openCreateModal = () => {
  isEditing.value = false;
  mappingForm.value = {
    device_path: '',
    plugin_id: '',
    mqtt_server: ''
  };
  showMappingModal.value = true;
};

// 编辑映射
const editMapping = (mapping: DeviceMapping) => {
  isEditing.value = true;
  mappingForm.value = { ...mapping };
  showMappingModal.value = true;
};

// 保存映射
const saveMapping = async () => {
  saving.value = true;
  try {
    if (isEditing.value && mappingForm.value.id) {
      // 更新现有映射
      const updatedMapping = await deviceMappingApi.updateMapping(
        mappingForm.value.id, 
        mappingForm.value
      );
      // 更新列表中的映射
      const index = mappings.value.findIndex(m => m.id === mappingForm.value.id);
      if (index !== -1) {
        mappings.value[index] = updatedMapping;
      }
    } else {
      // 创建新映射
      const newMapping = await deviceMappingApi.createMapping({
        device_path: mappingForm.value.device_path,
        plugin_id: mappingForm.value.plugin_id,
        mqtt_server: mappingForm.value.mqtt_server
      });
      // 添加到列表
      mappings.value.push(newMapping);
    }
    showMappingModal.value = false;
  } catch (error) {
    console.error('保存映射失败:', error);
    alert('保存映射失败，请重试');
  } finally {
    saving.value = false;
  }
};

// 执行映射（连接设备）
const executeMapping = async (mapping: DeviceMapping) => {
  if (!mapping.id) return;
  
  try {
    executing.value = mapping.id;
    
    // 构建请求数据
    const connectionData = {
      device_path: mapping.device_path,
      plugin_id: mapping.plugin_id,
      mqtt_server: mapping.mqtt_server
    };
    
    console.log('正在连接设备，发送数据:', connectionData);
    
    // 尝试两种方式连接设备
    try {
      // 方式1: 使用设备映射管理器
      await deviceMappingManager.executeMapping(mapping.id, connectionData);
    } catch (innerError) {
      console.warn('使用设备映射管理器连接失败，尝试直接发送请求:', innerError);
      
      // 方式2: 直接发送POST请求到API
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://192.168.1.230:8080/api/device-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(connectionData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
      }
      
      const result = await response.json();
      console.log('直接API请求成功:', result);
      
      // 标记设备为已连接
      deviceMappingManager.isActive(mapping.id);
    }
    
    // 刷新映射列表
    await fetchMappings();
  } catch (error) {
    console.error('连接设备失败:', error);
    alert('连接设备失败，请重试\n' + (error instanceof Error ? error.message : String(error)));
  } finally {
    executing.value = null;
  }
};

// 停止映射（断开连接）
const stopMapping = async (mapping: DeviceMapping) => {
  if (!mapping.id) return;
  
  try {
    stopping.value = mapping.id;
    await deviceMappingManager.stopMapping(mapping.id);
    // 刷新映射列表
    await fetchMappings();
  } catch (error) {
    console.error('断开设备连接失败:', error);
    alert('断开设备连接失败，请重试');
  } finally {
    stopping.value = null;
  }
};

// 确认删除映射
const confirmDeleteMapping = (mapping: DeviceMapping) => {
  mappingToDelete.value = mapping;
  showDeleteModal.value = true;
};

// 删除映射
const deleteMapping = async () => {
  if (!mappingToDelete.value || !mappingToDelete.value.id) return;
  
  deleting.value = true;
  try {
    await deviceMappingApi.deleteMapping(mappingToDelete.value.id);
    // 从列表中移除
    mappings.value = mappings.value.filter(m => m.id !== mappingToDelete.value?.id);
    // 如果被删除的映射在选中列表中，也要移除
    selectedMappings.value = selectedMappings.value.filter(m => m.id !== mappingToDelete.value?.id);
    showDeleteModal.value = false;
  } catch (error) {
    console.error('删除映射失败:', error);
    alert('删除映射失败，请重试');
  } finally {
    deleting.value = false;
  }
};

// 检查映射是否正在执行
const isActive = (mappingId?: number): boolean => {
  if (!mappingId) return false;
  return deviceMappingManager.isActive(mappingId);
};

// 选择相关功能
const isSelected = (mapping: DeviceMapping) => {
  return selectedMappings.value.some(m => m.id === mapping.id);
};

const toggleSelect = (mapping: DeviceMapping) => {
  if (isSelected(mapping)) {
    selectedMappings.value = selectedMappings.value.filter(m => m.id !== mapping.id);
  } else {
    selectedMappings.value.push(mapping);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedMappings.value = [];
  } else {
    selectedMappings.value = [...mappings.value];
  }
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedMappings.value.length === 0) return;
  showBatchDeleteModal.value = true;
};

const batchDeleteMappings = async () => {
  if (selectedMappings.value.length === 0) return;
  
  batchDeleting.value = true;
  try {
    // 使用Promise.all并行删除所有选中的映射
    await Promise.all(
      selectedMappings.value
        .filter(mapping => mapping.id) // 确保有id
        .map(mapping => deviceMappingApi.deleteMapping(mapping.id!))
    );
    
    // 从列表中移除所有删除的映射
    const deletedIds = selectedMappings.value.map(m => m.id);
    mappings.value = mappings.value.filter(m => !deletedIds.includes(m.id));
    
    // 清空选中列表
    selectedMappings.value = [];
    showBatchDeleteModal.value = false;
  } catch (error) {
    console.error('批量删除映射失败:', error);
    alert('批量删除映射失败，请重试');
  } finally {
    batchDeleting.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchMappings();
  
  // 定期刷新映射状态
  setInterval(() => {
    if (!showMappingModal.value && !showDeleteModal.value && !showBatchDeleteModal.value) {
      fetchMappings();
    }
  }, 30000); // 从10秒增加到30秒刷新一次，减少请求频率
});
</script> 