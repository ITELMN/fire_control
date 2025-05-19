# API 路由说明文档

## 概述

本文档描述了网关应用程序的 API 路由及其功能。所有 API 都基于 Echo 框架实现，支持 JSON 格式的请求和响应。

## 认证

API 使用基于 token 的认证机制。需要在请求头中包含 token：

```
Authorization: Bearer <token>
```

## 公共路由

### 用户登录
- **路径**: `/api/login`
- **方法**: POST
- **描述**: 用户登录并获取认证令牌
- **请求体**:
```json
{
    "username": "string",
    "password": "string"
}
```
- **响应**: 
  - 成功: 200 OK
```json
{
    "token": "string"  // 认证令牌
}
```
  - 失败: 401 Unauthorized (无效凭证)

## 受保护路由

所有受保护路由都需要在请求头中包含有效的认证令牌。

### 密码管理

#### 修改密码
- **路径**: `/api/change-password`
- **方法**: POST
- **描述**: 修改用户密码，成功后会返回新的 token，同时使所有已存在的 token 失效
- **请求体**:
```json
{
    "username": "string",    // 用户名
    "new_password": "string" // 新密码
}
```
- **响应**: 
  - 成功: 200 OK
```json
{
    "token": "string"  // 新的认证令牌
}
```
  - 失败: 
    - 400 Bad Request (请求格式错误)
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (用户不存在)

### 硬件信息

#### 获取硬件信息
- **路径**: `/api/hardware/info`
- **方法**: GET
- **描述**: 获取系统静态硬件信息，包括内核版本、设备型号和无线模块型号
- **响应**: 200 OK (返回硬件信息)
- **响应体**:
```json
{
    "kernel": "string",      // Linux内核版本号及编译时间
    "board": "string",       // 设备型号
    "cellular": "string",    // 无线模块型号（可选）
    "wifi": "string"         // WIFI模块型号（可选）
}
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal Server Error (读取硬件信息失败)

#### 获取温度信息
- **路径**: `/api/hardware/temperature`
- **方法**: GET
- **描述**: 获取系统实时温度信息，包括CPU温度和主板温度
- **响应**: 200 OK (返回温度信息)
- **响应体**:
```json
{
    "cpu_temp": number,      // CPU温度（摄氏度）
    "board_temp": number     // 主板温度（摄氏度）
}
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal Server Error (读取温度信息失败)

### 设备管理

#### 获取设备列表
- **路径**: `/api/devices`
- **方法**: GET
- **描述**: 获取所有设备的列表
- **响应**: 200 OK (返回设备对象数组)
- **响应体**:
```json
[
    {
        "path": "string",    // 设备路径
        "type": "string"     // 设备类型
    }
]
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal Server Error (获取设备列表失败)

#### 获取设备详情
- **路径**: `/api/devices/info/:device`
- **方法**: GET
- **描述**: 获取特定设备的详细信息
- **参数**:
  - `device`: 设备名称（如 "ttyS1"）
- **响应**: 
  - 成功: 200 OK (返回设备对象)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (设备不存在)
- **响应体**:
```json
{
    "path": "string",    // 设备路径
    "type": "string"     // 设备类型
}
```

#### 删除设备
- **路径**: `/api/devices/remove/:device`
- **方法**: DELETE
- **描述**: 从系统中移除设备
- **参数**:
  - `device`: 设备名称（如 "ttyS1"）
- **响应**: 
  - 成功: 204 No Content
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (设备不存在)

#### 扫描设备
- **路径**: `/api/devices/scan`
- **方法**: POST
- **描述**: 触发新的设备扫描
- **响应**: 
  - 成功: 200 OK (返回设备列表)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 500 Internal Server Error (扫描失败)

#### 获取所有设备状态
- **路径**: `/api/devices/status`
- **方法**: GET
- **描述**: 获取所有设备的通信状态信息
- **响应**: 200 OK (返回设备状态对象)
- **响应体**:
```json
{
    "/dev/ttyS1": {
        "device_path": "string",  // 设备路径
        "connected": boolean,     // 连接状态
        "modbus_rate": number,    // Modbus通信速率（字节/秒）
        "mqtt_rate": number       // MQTT通信速率（字节/秒）
    }
}
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal Server Error (获取状态失败)

#### 获取单个设备状态
- **路径**: `/api/devices/status/:device`
- **方法**: GET
- **描述**: 获取指定设备的通信状态信息
- **参数**:
  - `device`: 设备名称（如 "ttyS1"）
- **响应**: 
  - 成功: 200 OK (返回设备状态对象)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (设备不存在)
    - 500 Internal Server Error (获取状态失败)
- **响应体**:
```json
{
    "device_path": "string",  // 设备路径
    "connected": boolean,     // 连接状态
    "modbus_rate": number,    // Modbus通信速率（字节/秒）
    "mqtt_rate": number       // MQTT通信速率（字节/秒）
}
```

#### 获取总通信速率
- **路径**: `/api/devices/rates`
- **方法**: GET
- **描述**: 获取所有设备的总通信速率和消息数
- **响应**: 200 OK (返回总通信速率对象)
- **响应体**:
```json
{
    "total_plugin_communication": {
        "rate": number,     // 所有设备的总插件通信速率（字节/秒）
        "messages": number  // 所有设备的总插件消息数
    },
    "total_mqtt_communication": {
        "rate": number,     // 所有设备的总MQTT通信速率（字节/秒）
        "messages": number  // 所有设备的总MQTT消息数
    }
}
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal Server Error (获取速率失败)

### MQTT 配置管理

#### 获取 MQTT 配置列表
- **路径**: `/api/mqtt/configs`
- **方法**: GET
- **描述**: 获取所有 MQTT 配置
- **响应**: 200 OK (返回 MQTT 配置数组)
- **响应体**:
```json
[
    {
        "id": number,           // 配置ID
        "server": "string",     // MQTT服务器地址
        "port": number,         // MQTT服务器端口
        "topic": "string",      // MQTT主题
        "client_id": "string",  // MQTT客户端ID
        "username": "string",   // 用户名（可选）
        "password": "string",   // 密码（可选）
        "qos": number,          // QoS级别
        "created_at": "string", // 创建时间
        "updated_at": "string"  // 更新时间
    }
]
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal Server Error (获取配置失败)

#### 获取单个 MQTT 配置
- **路径**: `/api/mqtt/configs/:id`
- **方法**: GET
- **描述**: 获取指定 ID 的 MQTT 配置
- **响应**: 
  - 成功: 200 OK (返回 MQTT 配置对象)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (配置不存在)

#### 创建 MQTT 配置
- **路径**: `/api/mqtt/configs`
- **方法**: POST
- **描述**: 创建新的 MQTT 配置
- **请求体**:
```json
{
    "server": "string",     // MQTT服务器地址
    "port": number,         // MQTT服务器端口
    "topic": "string",      // MQTT主题
    "client_id": "string",  // MQTT客户端ID
    "username": "string",   // 用户名（可选）
    "password": "string",   // 密码（可选）
    "qos": number          // QoS级别
}
```
- **响应**: 
  - 成功: 201 Created (返回创建的配置对象)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 400 Bad Request (无效的配置数据)
    - 500 Internal Server Error (创建失败)

#### 更新 MQTT 配置
- **路径**: `/api/mqtt/configs/:id`
- **方法**: PUT
- **描述**: 更新指定 ID 的 MQTT 配置
- **请求体**:
```json
{
    "server": "string",     // MQTT服务器地址
    "port": number,         // MQTT服务器端口
    "topic": "string",      // MQTT主题
    "client_id": "string",  // MQTT客户端ID
    "username": "string",   // 用户名（可选）
    "password": "string",   // 密码（可选）
    "qos": number          // QoS级别
}
```
- **响应**: 
  - 成功: 200 OK
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 400 Bad Request (无效的配置数据)
    - 404 Not Found (配置不存在)
    - 500 Internal Server Error (更新失败)

#### 删除 MQTT 配置
- **路径**: `/api/mqtt/configs/:id`
- **方法**: DELETE
- **描述**: 删除指定 ID 的 MQTT 配置
- **响应**: 
  - 成功: 204 No Content
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (配置不存在)
    - 500 Internal Server Error (删除失败)

### 设备映射管理

#### 获取设备映射列表
- **路径**: `/api/device-mappings`
- **方法**: GET
- **描述**: 获取所有设备映射配置
- **响应**: 200 OK (返回设备映射数组)
- **响应体**:
```json
[
    {
        "id": number,           // 映射ID
        "device_path": "string", // 设备路径
        "plugin_id": "string",   // 插件ID
        "mqtt_server": "string", // MQTT服务器地址
        "created_at": "string",  // 创建时间
        "updated_at": "string"   // 更新时间
    }
]
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal Server Error (获取映射失败)

#### 获取单个设备映射
- **路径**: `/api/device-mappings/:id`
- **方法**: GET
- **描述**: 获取指定 ID 的设备映射
- **响应**: 
  - 成功: 200 OK (返回设备映射对象)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (映射不存在)

#### 创建设备映射
- **路径**: `/api/device-mappings`
- **方法**: POST
- **描述**: 创建新的设备映射
- **请求体**:
```json
{
    "device_path": "string",  // 设备路径
    "plugin_id": "string",    // 插件ID
    "mqtt_server": "string"   // MQTT服务器地址
}
```
- **响应**: 
  - 成功: 201 Created (返回创建的映射对象)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 400 Bad Request (无效的映射数据)
    - 500 Internal Server Error (创建失败)

#### 更新设备映射
- **路径**: `/api/device-mappings/:id`
- **方法**: PUT
- **描述**: 更新指定 ID 的设备映射
- **请求体**:
```json
{
    "device_path": "string",  // 设备路径
    "plugin_id": "string",    // 插件ID
    "mqtt_server": "string"   // MQTT服务器地址
}
```
- **响应**: 
  - 成功: 200 OK
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 400 Bad Request (无效的映射数据)
    - 404 Not Found (映射不存在)
    - 500 Internal Server Error (更新失败)

#### 删除设备映射
- **路径**: `/api/device-mappings/:id`
- **方法**: DELETE
- **描述**: 删除指定 ID 的设备映射
- **响应**: 
  - 成功: 204 No Content
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (映射不存在)
    - 500 Internal Server Error (删除失败)

### 插件配置管理

#### 获取插件列表
- **路径**: `/api/plugins`
- **方法**: GET
- **描述**: 获取所有插件信息
- **响应**: 200 OK (返回插件数组)
- **响应体**:
```json
[
    {
        "id": number,           // 插件ID
        "name": "string",       // 插件名称
        "description": "string", // 插件描述
        "config_file": "string", // 配置文件路径
        "db_file": "string"     // 数据库文件路径
    }
]
```
- **错误响应**:
  - 401 Unauthorized (无效的认证令牌)
  - 500 Internal ServerError (获取插件失败)

#### 获取单个插件
- **路径**: `/api/plugins/id`
- **方法**: GET
- **描述**: 获取指定ID的插件信息
- **参数**:
  - `id`: 插件ID
- **响应**: 
  - 成功: 200 OK (返回插件对象)
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 404 Not Found (插件不存在)
    - 500 Internal ServerError (获取插件失败)

#### 更新海湾条约插件配置
- **路径**: `/api/plugins/id/gst`
- **方法**: PUT
- **描述**: 更新海湾条约插件的配置参数
- **参数**:
  - `id`: 插件ID
- **请求体**:
```json
{
    "device_id": number,      // 设备ID (0-255)
    "function_code": number   // 功能码 (0-255)
}
```
- **响应**: 
  - 成功: 204 No Content
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 400 Bad Request (无效的请求参数)
    - 404 Not Found (插件不存在)
    - 500 Internal ServerError (更新失败)

#### 更新四川赛科插件配置
- **路径**: `/api/plugins/id/sck`
- **方法**: PUT
- **描述**: 更新四川赛科插件的配置参数
- **参数**:
  - `id`: 插件ID
- **请求体**:
```json
{
    "addr": number,     // 设备地址 (0-255)
    "version": number   // 协议版本 (0-255)
}
```
- **响应**: 
  - 成功: 204 No Content
  - 失败: 
    - 401 Unauthorized (无效的认证令牌)
    - 400 Bad Request (无效的请求参数)
    - 404 Not Found (插件不存在)
    - 500 Internal ServerError (更新失败)

## 错误处理

所有 API 在发生错误时会返回适当的 HTTP 状态码和错误信息。错误响应格式如下：

```json
{
    "message": "string"      // 错误描述
}
```

## 状态码说明

- 200 OK: 请求成功
- 201 Created: 资源创建成功
- 204 No Content: 请求成功但无返回内容
- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 未授权或认证失败
- 404 Not Found: 资源不存在
- 500 Internal Server Error: 服务器内部错误 