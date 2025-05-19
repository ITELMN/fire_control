import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { authService } from '../services/auth';

// 不再清除token，保持持久化的登录状态
console.log('路由初始化: 保持现有认证状态');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: to => {
      // 检查认证状态，已登录则跳转到仪表盘，否则跳转到登录页
      return authService.isAuthenticated() ? '/dashboard' : '/login';
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/Plugins',
    name: 'Plugins',
    component: () => import('../pages/Plugins.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/Hardware',
    name: 'Hardware',
    component: () => import('../pages/Hardware.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mqtt',
    name: 'MQTT',
    component: () => import('../pages/mqtt.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/device-mappings',
    name: 'DeviceMappings',
    component: () => import('../pages/DeviceMappings.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 防止路由守卫中的循环重定向和递归问题
let pendingNavigation = false;
const MAX_AUTH_RETRIES = 3;
let authCheckCount = 0;

// 上次重定向时间戳
let lastRedirectTime = 0;
// 重定向时间间隔(毫秒)
const REDIRECT_INTERVAL = 2000;

router.beforeEach((
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const currentTime = Date.now();
  const timeSinceLastRedirect = currentTime - lastRedirectTime;
  
  // 防止频繁重定向 - 如果两次重定向间隔太短，直接通过
  if (timeSinceLastRedirect < REDIRECT_INTERVAL && from.path !== to.path) {
    console.warn(`重定向过于频繁(${timeSinceLastRedirect}ms)，暂时允许导航到: ${to.path}`);
    next();
    return;
  }
  
  // 强制中断导航循环
  if (authCheckCount > MAX_AUTH_RETRIES) {
    console.error('检测到路由守卫中的可能循环，强制中断');
    authCheckCount = 0;
    pendingNavigation = false;
    next();
    return;
  }

  // 如果已经在处理导航，避免重入
  if (pendingNavigation) {
    authCheckCount++;
    console.log(`重复导航请求 #${authCheckCount}, 从 ${from.path} 到 ${to.path}`);
    next();
    return;
  }

  // 标记为正在处理导航
  pendingNavigation = true;
  
  try {
    // 检查用户认证状态
    const isAuthenticated = authService.isAuthenticated();
    
    console.log(`路由守卫: 前往 ${to.path}, 认证状态: ${isAuthenticated ? '已登录' : '未登录'}`);
    
    // 如果路由需要认证但用户未登录
    if (to.meta.requiresAuth && !isAuthenticated) {
      console.log('需要认证，重定向到登录页');
      lastRedirectTime = currentTime;
      pendingNavigation = false;
      authCheckCount = 0;
      next('/login');
      return;
    }
    
    // 如果是访客页面(如登录页)但用户已登录
    if (to.meta.guestOnly && isAuthenticated) {
      console.log('用户已登录，重定向到仪表盘');
      lastRedirectTime = currentTime;
      pendingNavigation = false;
      authCheckCount = 0;
      next('/dashboard');
      return;
    }
    
    // 正常导航流程
    pendingNavigation = false;
    authCheckCount = 0;
    next();
  } catch (error) {
    // 发生错误时确保标志被重置
    console.error('路由守卫错误:', error);
    pendingNavigation = false;
    authCheckCount = 0;
    
    // 出现错误时重定向到登录页
    next('/login');
  }
});

export default router;