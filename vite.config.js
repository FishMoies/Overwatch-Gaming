// Vite配置文件
// Vite是一个现代化的前端构建工具，提供快速的开发服务器和优化的生产构建

// 导入Node.js URL处理模块
import { fileURLToPath, URL } from 'node:url'

// 导入Vite相关模块
import { defineConfig } from 'vite'  // Vite配置函数
import vue from '@vitejs/plugin-vue'  // Vue.js插件
import vueDevTools from 'vite-plugin-vue-devtools'  // Vue DevTools插件

// 导出Vite配置
export default defineConfig({
  // 公共基础路径
  // './' 表示应用部署在相对路径下（适用于GitHub Pages等静态托管）
  base: './', // ⭐ 关键就是这一行 - 确保资源路径正确

  // 插件配置
  plugins: [
    vue(),  // Vue.js插件，支持单文件组件(.vue)
    vueDevTools(),  // Vue DevTools插件，提供开发调试工具
  ],
  
  // 解析配置
  resolve: {
    // 路径别名配置
    alias: {
      // 将 '@' 别名映射到 './src' 目录
      // 这样在代码中可以使用 '@/' 来引用src目录下的文件
      // 例如：import App from '@/App.vue'
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})