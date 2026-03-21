<template>
  <div class="search-input-container" :class="{ 'active': isActive }">
    <!-- 搜索图标按钮 -->
    <button class="search-icon-button" @click="toggleSearch" v-if="!isActive">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
      </svg>
    </button>

    <!-- 搜索输入框（悬浮状态） -->
    <div class="floating-search" v-if="isActive">
      <input
        type="text"
        v-model="query"
        placeholder="搜索用户名、UID、帖子编号或帖子标题..."
        @keyup.enter="handleSearch"
        @blur="onBlur"
        ref="searchInput"
        class="floating-input"
      />
      <button class="close-button" @click="closeSearch">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isActive = ref(false)
const query = ref('')
const searchInput = ref(null)

// 切换搜索框显示
const toggleSearch = () => {
  isActive.value = true
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
}

// 关闭搜索框
const closeSearch = () => {
  isActive.value = false
  query.value = ''
}

// 处理输入框失去焦点
const onBlur = (event) => {
  // 延迟关闭以避免点击按钮时立即关闭
  setTimeout(() => {
    // 检查是否点击了关闭按钮或其他搜索相关元素
    if (!event.relatedTarget || !event.relatedTarget.closest('.search-input-container')) {
      closeSearch()
    }
  }, 100)
}

// 处理搜索
const handleSearch = () => {
  if (query.value.trim() === '') return
  
  // 导航到搜索页面
  router.push({ 
    path: '/search',
    query: { q: query.value.trim() }
  })
  
  // 关闭搜索框
  closeSearch()
}
</script>

<style scoped>
.search-input-container {
  position: relative;
  display: inline-block;
}

.search-icon-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.search-icon-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.floating-search {
  position: absolute;
  top: 0;
  right: 0;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  padding: 5px;
  z-index: 1001;
  min-width: 300px;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 20px;
  min-width: 250px;
}

.close-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #333;
}
</style>