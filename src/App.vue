<script setup>
// 导入Vue Composition API和相关依赖
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
// 导入Vue Router相关函数
import { useRoute, useRouter } from 'vue-router'
// 导入自定义组件
import NavBar from './components/NavBar.vue'
// 导入认证服务
import auth from './services/auth.js'
// 导入fullpage.js库，用于创建全屏滚动效果
import fullpage from 'fullpage.js'

// 使用Vue Router的钩子获取当前路由和路由器实例
const route = useRoute()
const router = useRouter()
// 响应式变量：用户登录状态
const isLoggedIn = ref(false)
// fullpage.js实例变量
let fpInstance = null

// 检查登录状态函数
const checkLoginStatus = () => {
  // 调用认证服务检查用户是否已登录
  isLoggedIn.value = auth.isLoggedIn()
}

// 导航函数：跳转到指定路由
const navigateTo = (routeName) => {
  // 使用Vue Router进行编程式导航
  router.push({ name: routeName })
}

// 初始化fullpage.js函数
const initFullpage = () => {
  // 如果已有fullpage实例，先销毁它
  if (fpInstance) {
    fpInstance.destroy('all')
  }

  // 创建新的fullpage.js实例
  fpInstance = new fullpage('#fullpage', {
    autoScrolling: true,      // 启用自动滚动
    navigation: true,         // 显示导航点
    scrollingSpeed: 700,      // 滚动速度（毫秒）
    paddingTop: '60px',       // 顶部内边距（为导航栏留出空间）
    css3: true,               // 使用CSS3变换
    fitToSection: false,      // 不自动调整到章节
    fixedElements: '.navbar', // 固定元素选择器（导航栏）
    afterLoad: function(origin, destination, direction) {
      // 可以在这里添加滚动后的逻辑
      // 例如：更新当前章节状态、触发动画等
    }
  })
}

// 销毁fullpage.js函数
const destroyFullpage = () => {
  // 如果存在fullpage实例，销毁它并置空
  if (fpInstance) {
    fpInstance.destroy('all')
    fpInstance = null
  }
}

// 监听路由路径变化，根据路由决定是否启用fullpage.js
watch(() => route.path, (newPath) => {
  // 每次路由变化时检查登录状态
  checkLoginStatus()
  
  // 判断是否为首页或关于页面（需要使用fullpage.js的页面）
  if (newPath === '/' || newPath === '/about') {
    // 首页或关于页面，需要初始化fullpage.js
    // 使用nextTick确保DOM已更新
    nextTick(() => {
      initFullpage()
    })
  } else {
    // 其他页面，销毁fullpage.js以释放资源
    destroyFullpage()
  }
})

// 组件挂载时的生命周期钩子
onMounted(() => {
  // 初始检查登录状态
  checkLoginStatus()
  // 监听storage事件，用于跨标签页同步登录状态
  window.addEventListener('storage', checkLoginStatus)

  // 初始加载时，如果是首页则初始化fullpage.js
  if (route.path === '/' || route.path === '/about') {
    // 使用nextTick确保DOM已完全渲染
    nextTick(() => {
      initFullpage()
    })
  }
})

// 组件卸载时的生命周期钩子
onUnmounted(() => {
  // 移除storage事件监听器
  window.removeEventListener('storage', checkLoginStatus)
  // 销毁fullpage.js实例
  destroyFullpage()
})
</script>

<template>
  <!-- 应用根容器 -->
  <div class="app-container">
    <!-- 导航栏组件 -->
    <NavBar />
    
    <!-- 路由出口：Vue Router渲染匹配的页面组件 -->
    <router-view v-slot="{ Component }">
      <!-- 页面切换过渡动画 -->
      <Transition name="fade" mode="out-in">
        <!-- 动态组件：渲染当前路由对应的组件 -->
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<style scoped>
/* 自定义字体声明：导入SmileySans Oblique字体 */
@font-face {
  font-family: 'SmileySans Oblique';
  src: url('/SmileySans-Oblique.ttf') format('truetype');
}

/* 应用根容器样式 */
.app-container{
  width:100%;          /* 宽度占满父容器 */
  height:100vh;        /* 高度占满视口高度 */
  position:relative;   /* 相对定位，为子元素定位提供参考 */
}

/* 页面切换过渡动画样式 */
/* 进入和离开时的活动状态 */
.fade-enter-active,
.fade-leave-active{
  transition:opacity .5s;  /* 透明度过渡效果，持续0.5秒 */
}

/* 进入开始状态和离开结束状态 */
.fade-enter-from,
.fade-leave-to{
  opacity:0;  /* 完全透明 */
}

</style>