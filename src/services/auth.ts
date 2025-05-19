export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// 本地存储键
const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'auth_username';

class AuthService {
  private tokenInitialized: boolean = false;
  private authState: { isAuthenticated: boolean; token: string | null } = { 
    isAuthenticated: false,
    token: null
  };

  constructor() {
    // 初始化认证状态
    this.initAuthState();
    console.log('AuthService 初始化完成');
  }
  
  /**
   * 初始化认证状态
   */
  private initAuthState(): void {
    if (this.tokenInitialized) return;
    
    this.tokenInitialized = true;
    const token = this.getToken();
    
    if (!token) {
      this.authState.isAuthenticated = false;
      this.authState.token = null;
    } else {
      this.authState.token = token;
      this.authState.isAuthenticated = true;
      console.log('检测到现有token，已启用认证状态');
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // 使用axios而不是直接使用apiClient来避免循环依赖
      const axios = (await import('axios')).default;
      
      // 创建一个临时axios实例
      const tempClient = axios.create({
        baseURL: 'http://192.168.1.230:8080/api',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      // 尝试通过API登录，使用固定的admin用户名和用户输入的密码
      console.log(`正在尝试登录，用户名: admin, 服务器: ${tempClient.defaults.baseURL}`);
      
      // 创建登录请求数据，按照指定格式 - 固定username为admin
      const loginData = {
        username: 'admin',
        password: credentials.password
      };
      
      // 发送带有raw JSON的登录请求
      const response = await tempClient.post('/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data?.token) {
        const token = response.data.token;
        console.log('登录成功: 获取到API token');
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USERNAME_KEY, 'admin'); // 固定存储admin
        this.authState.token = token;
        this.authState.isAuthenticated = true;
        return response.data;
      }
      
      throw new Error('API响应中没有token');
    } catch (error: any) {
      console.warn('API登录失败:', error.message);
      // 登录失败，确保重定向到登录页面
      this.redirectToLogin();
      throw error;
    }
  }

  /**
   * 修改密码
   */
  async changePassword(username: string, newPassword: string): Promise<AuthResponse> {
    try {
      // 使用axios而不是直接使用apiClient来避免循环依赖
      const axios = (await import('axios')).default;
      
      // 创建一个临时axios实例
      const tempClient = axios.create({
        baseURL: 'http://192.168.1.230:8080/api',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      // 如果有token，添加到请求头
      const token = this.getToken();
      if (token) {
        tempClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await tempClient.post('/change-password', { 
        username, 
        new_password: newPassword 
      });
      
      if (response.data?.token) {
        const token = response.data.token;
        localStorage.setItem(TOKEN_KEY, token);
        this.authState.token = token;
        this.authState.isAuthenticated = true;
        return response.data;
      }
      
      throw new Error('修改密码响应中没有token');
    } catch (error) {
      console.warn('修改密码失败');
      this.redirectToLogin();
      throw error;
    }
  }

  /**
   * 用户登出
   */
  logout(): void {
    console.log('执行登出操作');
    localStorage.removeItem(TOKEN_KEY);
    this.authState.token = null;
    this.authState.isAuthenticated = false;
    this.redirectToLogin();
  }

  /**
   * 用户注册 - 实际项目中应该调用后端API
   */
  async register(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('注册请求', credentials);
      // 实际项目中应该调用后端API
      const axios = (await import('axios')).default;
      const tempClient = axios.create({
        baseURL: 'http://192.168.1.230:8080/api',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      const response = await tempClient.post('/register', credentials);
      
      if (response.data?.token) {
        const token = response.data.token;
        localStorage.setItem(TOKEN_KEY, token);
        this.authState.token = token;
        this.authState.isAuthenticated = true;
        return response.data;
      }
      
      throw new Error('注册响应中没有token');
    } catch (error) {
      console.error('注册失败:', error);
      this.redirectToLogin();
      throw error;
    }
  }

  /**
   * 获取token
   */
  getToken(): string | null {
    // 优先使用内存中的状态，减少localStorage访问
    if (this.tokenInitialized && this.authState.token) {
      return this.authState.token;
    }
    
    const token = localStorage.getItem(TOKEN_KEY);
    
    // 更新内存状态
    if (token && this.tokenInitialized) {
      this.authState.token = token;
      this.authState.isAuthenticated = true;
    }
    
    return token;
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    if (!this.tokenInitialized) {
      this.initAuthState();
    }
    
    if (!this.authState.isAuthenticated) {
      // 未认证时重定向到登录页面
      this.redirectToLogin();
    }
    
    return this.authState.isAuthenticated;
  }
  
  /**
   * 刷新认证状态
   * 用于在可能的状态不一致情况下重新检查
   */
  refreshAuthState(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      this.authState.token = token;
      this.authState.isAuthenticated = true;
    } else {
      this.authState.token = null;
      this.authState.isAuthenticated = false;
      // 未认证时重定向到登录页面
      this.redirectToLogin();
    }
    
    return this.authState.isAuthenticated;
  }
  
  /**
   * 重定向到登录页面
   * 在未认证或连接失败时调用
   */
  private redirectToLogin(): void {
    // 检查当前是否已经在登录页面
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      console.log('未认证或连接失败，重定向到登录页面');
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }
}

// 创建单例实例
export const authService = new AuthService(); 