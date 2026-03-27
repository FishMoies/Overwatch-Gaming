<template>
  <!-- 搜索输入组件容器，根据isActive状态添加'active'类 -->
  <div class="search-input-container" :class="{ 'active': isActive }">
    <!-- 搜索图标按钮：非激活状态时显示 -->
    <button class="search-icon-button" @click="toggleSearch" v-if="!isActive">
      <!-- 搜索图标SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <!-- 搜索图标路径 -->
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
      </svg>
    </button>

    <!-- 搜索输入框（悬浮状态）：激活状态时显示 -->
    <div class="floating-search" v-if="isActive">
      <!-- 搜索输入框 -->
      <input
        type="text"
        v-model="query"  <!-- 双向绑定搜索查询 -->
        placeholder="搜索用户名、UID、帖子编号或帖子标题..."  <!-- 占位文本 -->
        @keyup.enter="handleSearch"  <!-- 回车键触发搜索 -->
        @blur="onBlur"  <!-- 失去焦点事件处理 -->
        ref="searchInput"  <!-- 模板引用，用于获取DOM元素 -->
        class="floating-input"
      />
      <!-- 关闭按钮 -->
      <button class="close-button" @click="closeSearch">
        <!-- 关闭图标SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <!-- 关闭图标路径（X形状） -->
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
// 导入Vue Composition API
import { ref, nextTick } from 'vue'
// 导入Vue Router相关函数
import { useRouter } from 'vue-router'

// 使用Vue Router获取路由器实例
const router = useRouter()
// 响应式变量：搜索框是否激活（显示）
const isActive = ref(false)
// 响应式变量：搜索查询文本
const query = ref('')
// 模板引用：搜索输入框DOM元素
const searchInput = ref(null)

// 切换搜索框显示函数
const toggleSearch = () => {
  // 激活搜索框
  isActive.value = true
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    // 如果输入框引用存在，则聚焦到输入框
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
}

// 关闭搜索框函数
const closeSearch = () => {
  // 关闭搜索框
  isActive.value = false
  // 清空搜索查询
  query.value = ''
}

// 处理输入框失去焦点事件
const onBlur = (event) => {
  // 延迟关闭以避免点击按钮时立即关闭
  // 使用setTimeout延迟100毫秒执行
  setTimeout(() => {
    // 检查失去焦点时点击的元素是否在搜索组件内部
    // event.relatedTarget: 接收焦点的元素
    // closest('.search-input-container'): 查找最近的搜索容器父元素
    if (!event.relatedTarget || !event.relatedTarget.closest('.search-input-container')) {
      // 如果点击的元素不在搜索组件内部，则关闭搜索框
      closeSearch()
    }
  }, 100)
}

// 处理搜索函数（回车键触发）
const handleSearch = () => {
  // 如果搜索查询为空或只有空格，则直接返回
  if (query.value.trim() === '') return
  
  // 导航到搜索页面，并传递搜索查询参数
  router.push({
    path: '/search',  // 搜索页面路径
    query: { q: query.value.trim() }  // 查询参数：q=搜索词
  })
  
  // 关闭搜索框
  closeSearch()
}
</script>

<style scoped>
/* 搜索输入组件容器样式 */
.search-input-container {
  position: relative;      /* 相对定位，为子元素绝对定位提供参考 */
  display: inline-block;   /* 行内块级显示 */
}

/* 搜索图标按钮样式 */
.search-icon-button {
  background: none;        /* 透明背景 */
  border: none;            /* 无边框 */
  color: white;            /* 白色图标 */
  cursor: pointer;         /* 鼠标指针为手形 */
  padding: 8px;            /* 内边距：8px */
  display: flex;           /* 使用Flexbox布局 */
  align-items: center;     /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  border-radius: 50%;      /* 圆形按钮 */
  transition: background-color 0.3s; /* 背景颜色过渡效果：0.3秒 */
}

/* 搜索图标按钮悬停效果 */
.search-icon-button:hover {
  background-color: rgba(255, 255, 255, 0.1); /* 半透明白色背景 */
}

/* 悬浮搜索框样式（激活状态时显示） */
.floating-search {
  position: absolute;      /* 绝对定位，相对于父容器 */
  top: 0;                  /* 顶部对齐 */
  right: 0;                /* 右侧对齐 */
  background-color: white; /* 白色背景 */
  border-radius: 25px;     /* 大圆角（25px） */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 阴影效果 */
  display: flex;           /* 使用Flexbox布局 */
  align-items: center;     /* 垂直居中对齐 */
  padding: 5px;            /* 内边距：5px */
  z-index: 1001;           /* 高z-index，确保在其他元素上方 */
  min-width: 300px;        /* 最小宽度：300px */
  animation: slideIn 0.2s ease-out; /* 滑入动画：0.2秒缓出效果 */
}

/* 滑入动画关键帧 */
@keyframes slideIn {
  from {
    opacity: 0;                    /* 起始状态：完全透明 */
    transform: translateY(-10px);  /* 起始位置：向上偏移10px */
  }
  to {
    opacity: 1;                    /* 结束状态：完全不透明 */
    transform: translateY(0);      /* 结束位置：回到原始位置 */
  }
}

/* 悬浮输入框样式 */
.floating-input {
  flex: 1;                /* 弹性布局：占据剩余空间 */
  border: none;           /* 无边框 */
  outline: none;          /* 去除焦点轮廓 */
  padding: 10px 15px;     /* 内边距：上下10px，左右15px */
  font-size: 14px;        /* 字体大小：14px */
  border-radius: 20px;    /* 圆角：20px */
  min-width: 250px;       /* 最小宽度：250px */
}

/* 关闭按钮样式 */
.close-button {
  background: none;        /* 透明背景 */
  border: none;            /* 无边框 */
  color: #666;             /* 灰色图标 */
  cursor: pointer;         /* 鼠标指针为手形 */
  padding: 8px;            /* 内边距：8px */
  display: flex;           /* 使用Flexbox布局 */
  align-items: center;     /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  border-radius: 50%;      /* 圆形按钮 */
  transition: background-color 0.3s; /* 背景颜色过渡效果：0.3秒 */
}

/* 关闭按钮悬停效果 */
.close-button:hover {
  background-color: #f0f0f0; /* 浅灰色背景 */
  color: #333;               /* 深灰色图标 */
}
</style>