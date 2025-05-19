<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
    <Header />
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">MQTT 配置管理</h1>
        <div class="flex items-center space-x-3">
          <button 
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-md flex items-center"
            @click="showAddForm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加配置
          </button>
          <button 
            :style="{ backgroundColor: 'var(--primary-color)', color: 'white' }"
            class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-md flex items-center"
            @click="fetchMqttConfigs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            刷新
          </button>
        </div>
      </div>
      
      <!-- MQTT配置列表 -->
      <div class="mb-8 backdrop-blur-lg bg-white/70 rounded-xl shadow-lg border border-white/50 overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4" :style="{ backgroundColor: 'var(--primary-color)', color: 'white' }">
          <h2 class="text-lg font-semibold">MQTT配置列表</h2>
        </div>
        
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" :style="{ borderColor: 'var(--primary-color)' }"></div>
        </div>
        <div v-if="error" class="bg-red-50 text-red-700 p-3 rounded-md mb-5">{{ error }}</div>
        
        <div v-if="!loading && mqttConfigs.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead :style="{ backgroundColor: 'var(--primary-color-light)', color: 'white' }">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">服务器</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">端口</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">主题</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">客户端ID</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">QoS</th>
                <th scope="col" class="px-6 py-3 text-left text-black text-xs font-medium uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="config in mqttConfigs" :key="config.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{{ config.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    {{ config.server }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ config.port }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {{ config.topic }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    {{ config.client_id }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ config.qos }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    :style="{ backgroundColor: 'var(--warning-color)' }"
                    class="hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-sm transition-colors inline-flex items-center"
                    @click="editConfig(config)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    编辑
                  </button>
                  <button 
                    :style="{ backgroundColor: 'var(--danger-color)' }"
                    class="hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-sm transition-colors inline-flex items-center"
                    @click="confirmDelete(config)"
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
        <div v-else-if="!loading && mqttConfigs.length === 0" class="text-center py-10 text-gray-600 italic">
          暂无MQTT配置
        </div>
      </div>
      
      <!-- MQTT配置表单 -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">{{ formTitle }}</h2>
            <button 
              @click="cancelForm" 
              class="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="mb-4">
              <label for="server" class="block font-semibold mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                服务器地址
              </label>
              <input 
                type="text" 
                id="server" 
                v-model="form.server" 
                required 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="port" class="block font-semibold mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                端口
              </label>
              <input 
                type="number" 
                id="port" 
                v-model="form.port" 
                required 
                min="1" 
                max="65535" 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="topic" class="block font-semibold mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                主题
              </label>
              <input 
                type="text" 
                id="topic" 
                v-model="form.topic" 
                required 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="client_id" class="block font-semibold mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                客户端ID
              </label>
              <input 
                type="text" 
                id="client_id" 
                v-model="form.client_id" 
                required 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="username" class="block font-semibold mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                用户名（可选）
              </label>
              <input 
                type="text" 
                id="username" 
                v-model="form.username" 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="password" class="block font-semibold mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                密码（可选）
              </label>
              <input 
                type="password" 
                id="password" 
                v-model="form.password" 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="qos" class="block font-semibold mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                QoS等级
              </label>
              <select 
                id="qos" 
                v-model="form.qos" 
                required 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0 - 最多一次</option>
                <option value="1">1 - 至少一次</option>
                <option value="2">2 - 只有一次</option>
              </select>
            </div>
            
            <div class="flex justify-end mt-6 space-x-3">
              <button 
                type="button" 
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                @click="cancelForm"
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
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ submitButtonText }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 删除确认对话框 -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div class="flex items-center mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="text-lg font-bold">确认删除</h3>
          </div>
          <p class="mb-5">您确定要删除ID为 {{ configToDelete?.id }} 的MQTT配置吗？此操作无法撤销。</p>
          <div class="flex justify-end space-x-3">
            <button 
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              @click="cancelDelete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              取消
            </button>
            <button 
              :style="{ backgroundColor: 'var(--danger-color)' }"
              class="hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              @click="deleteConfig"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mqttApi } from '../services/api/mqtt';
import Header from '../components/Header.vue';

export default {
  name: 'MqttManager',
  components: {
    Header
  },
  data() {
    return {
      mqttConfigs: [],
      loading: true,
      error: null,
      showForm: false,
      formMode: 'add', // 'add' or 'edit'
      form: {
        server: '',
        port: 1883,
        topic: '',
        client_id: '',
        username: '',
        password: '',
        qos: 1
      },
      editingId: null,
      showDeleteConfirm: false,
      configToDelete: null
    }
  },
  computed: {
    formTitle() {
      return this.formMode === 'add' ? '添加MQTT配置' : '编辑MQTT配置'
    },
    submitButtonText() {
      return this.formMode === 'add' ? '添加' : '更新'
    }
  },
  mounted() {
    this.fetchMqttConfigs()
  },
  methods: {
    // 获取MQTT配置列表
    async fetchMqttConfigs() {
      this.loading = true
      this.error = null
      
      try {
        const data = await mqttApi.getAllConfigs()
        this.mqttConfigs = data
      } catch (error) {
        console.error('获取MQTT配置失败:', error)
        this.error = `获取MQTT配置失败: ${error.message}`
      } finally {
        this.loading = false
      }
    },
    
    // 显示添加表单
    showAddForm() {
      this.formMode = 'add'
      this.resetForm()
      this.showForm = true
    },
    
    // 显示编辑表单
    editConfig(config) {
      this.formMode = 'edit'
      this.editingId = config.id
      this.form = {
        server: config.server,
        port: config.port,
        topic: config.topic,
        client_id: config.client_id,
        username: config.username || '',
        password: config.password || '',
        qos: config.qos
      }
      this.showForm = true
    },
    
    // 重置表单
    resetForm() {
      this.form = {
        server: '',
        port: 1883,
        topic: '',
        client_id: '',
        username: '',
        password: '',
        qos: 1
      }
      this.editingId = null
    },
    
    // 取消表单
    cancelForm() {
      this.showForm = false
      this.resetForm()
    },
    
    // 提交表单
    async submitForm() {
      try {
        // 确保QoS是数字类型
        const formData = { 
          ...this.form,
          port: Number(this.form.port),
          qos: Number(this.form.qos)
        }
        
        if (this.formMode === 'add') {
          await mqttApi.addConfig(formData)
        } else {
          await mqttApi.updateConfig(this.editingId, formData)
        }
        
        // 成功后刷新列表并关闭表单
        this.fetchMqttConfigs()
        this.showForm = false
        this.resetForm()
      } catch (error) {
        console.error('保存MQTT配置失败:', error)
        this.error = `保存MQTT配置失败: ${error.message}`
      }
    },
    
    // 确认删除
    confirmDelete(config) {
      this.configToDelete = config
      this.showDeleteConfirm = true
    },
    
    // 取消删除
    cancelDelete() {
      this.showDeleteConfirm = false
      this.configToDelete = null
    },
    
    // 执行删除
    async deleteConfig() {
      if (!this.configToDelete) return
      
      try {
        await mqttApi.deleteConfig(this.configToDelete.id)
        
        // 删除成功后刷新列表
        this.fetchMqttConfigs()
        this.showDeleteConfirm = false
        this.configToDelete = null
      } catch (error) {
        console.error('删除MQTT配置失败:', error)
        this.error = `删除MQTT配置失败: ${error.message}`
      }
    }
  }
}
</script> 