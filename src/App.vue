<template>
  <div class="min-h-screen bg-gray-50">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Apply theme color to the entire application
function applyThemeColor(color: string) {
  // 设置主色调
  document.documentElement.style.setProperty('--primary-color', color)
  
  // 根据主色调计算深色和浅色变种
  const darkColor = adjustColorBrightness(color, -20)
  const lightColor = adjustColorBrightness(color, 20)
  const hoverColor = adjustColorBrightness(color, -30)
  
  // 设置相关色调
  document.documentElement.style.setProperty('--primary-color-dark', darkColor)
  document.documentElement.style.setProperty('--primary-color-light', lightColor)
  document.documentElement.style.setProperty('--primary-color-hover', hoverColor)
  
  // 设置RGB值，用于rgba()函数
  setRgbVariables(color, '--primary-color-rgb')
  setRgbVariables(darkColor, '--primary-color-dark-rgb')
  setRgbVariables(lightColor, '--primary-color-light-rgb')
  
  // 根据主色调设置次要色调和状态颜色
  const secondaryHue = getComplementaryHue(hexToHSL(color).h)
  const secondaryColor = hslToHex(secondaryHue, 70, 25)
  const secondaryColorDark = hslToHex(secondaryHue, 70, 20)
  const secondaryColorLight = hslToHex(secondaryHue, 60, 40)
  
  document.documentElement.style.setProperty('--secondary-color', secondaryColor)
  document.documentElement.style.setProperty('--secondary-color-dark', secondaryColorDark)
  document.documentElement.style.setProperty('--secondary-color-light', secondaryColorLight)
  
  // 设置次要颜色的RGB值
  setRgbVariables(secondaryColor, '--secondary-color-rgb')
  setRgbVariables(secondaryColorDark, '--secondary-color-dark-rgb')
  setRgbVariables(secondaryColorLight, '--secondary-color-light-rgb')
  
  // 应用于图表颜色
  document.documentElement.style.setProperty('--chart-color-1', color)
  document.documentElement.style.setProperty('--chart-color-2', secondaryColor)
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  // Simple color brightness adjustment algorithm
  let r = parseInt(hex.substring(1, 3), 16)
  let g = parseInt(hex.substring(3, 5), 16)
  let b = parseInt(hex.substring(5, 7), 16)

  r = Math.max(0, Math.min(255, r + percent))
  g = Math.max(0, Math.min(255, g + percent))
  b = Math.max(0, Math.min(255, b + percent))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 转换HEX颜色到HSL
function hexToHSL(hex: string): { h: number, s: number, l: number } {
  let r = parseInt(hex.substring(1, 3), 16) / 255
  let g = parseInt(hex.substring(3, 5), 16) / 255
  let b = parseInt(hex.substring(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

// 转换HSL颜色到HEX
function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100
  
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// 获取互补色相
function getComplementaryHue(hue: number): number {
  return (hue + 180) % 360
}

// 设置RGB变量，用于rgba()函数
function setRgbVariables(hexColor: string, variableName: string) {
  const r = parseInt(hexColor.substring(1, 3), 16)
  const g = parseInt(hexColor.substring(3, 5), 16)
  const b = parseInt(hexColor.substring(5, 7), 16)
  document.documentElement.style.setProperty(variableName, `${r}, ${g}, ${b}`)
}

// Make theme functions globally available for other components
// TypeScript window interface extension
declare global {
  interface Window {
    applyThemeColor: (color: string) => void;
  }
}

// Assign the function to the window object
window.applyThemeColor = applyThemeColor

onMounted(() => {
  console.log('App component mounted')
  console.log('Current route:', router.currentRoute.value)
  
  // Load saved theme color from localStorage if it exists
  const savedThemeColor = localStorage.getItem('themeColor')
  if (savedThemeColor) {
    applyThemeColor(savedThemeColor)
  }
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

:root {

  /* 主色调 - 消防红色系 */
  --primary-color: #0D47A1;
  --primary-color-dark: #271d6b;
  --primary-color-light: #0D47A1;
  --primary-color-hover: #033c92;
  
  /* 次要色调 - 安全色系 */
  --secondary-color: #0f766e;
  --secondary-color-dark: #115e59;
  --secondary-color-light: #14b8a6;
  
  /* 警告色调 */
  --warning-color: #f59e0b;
  --danger-color: #b91c1c;
  --success-color: #059669;
  
  /* 中性色调 */
  --text-color: #374151;
  --text-light: #6b7280;
  --bg-color: #f9fafb;
  --border-color: #e5e7eb;
  --card-bg: #ffffff;
  
  /* 交互色调 */
  --hover-bg: #f3f4f6;
  --active-bg: #e5e7eb;
  
  /* 设备状态颜色 */
  --device-online: #10b981;
  --device-offline: #ef4444;
  --device-warning: #f59e0b;
  
  /* 图表颜色 */
  --chart-color-1: #dc2626;
  --chart-color-2: #0e7490;
  --chart-color-3: #4f46e5;
  --chart-color-4: #f59e0b;
}

body {
  font-family: 'Inter', 'Helvetica', 'Arial', sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: background-color 0.3s ease;
}

.page-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  overflow-x: hidden;
}

/* 通用卡片样式 */
.card {
  background: var(--card-bg);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color-dark);
}

.btn-primary:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
  border: 1px solid var(--secondary-color-dark);
}

.btn-secondary:hover {
  background-color: var(--secondary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 0.75rem;
  font-weight: 600;
  border-bottom: 2px solid var(--border-color);
  background-color: var(--bg-color);
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

tr:hover {
  background-color: var(--hover-bg);
}

/* 状态指示器 */
.status-indicator {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-success {
  background-color: rgba(5, 150, 105, 0.1);
  color: var(--success-color);
}

.status-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.status-danger {
  background-color: rgba(220, 38, 38, 0.1);
  color: var(--danger-color);
}

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 通用动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>


