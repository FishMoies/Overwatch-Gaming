<template>
  <div class="search-input-container" :class="{ active: isActive }">
    
    <!-- 搜索按钮 -->
    <button v-if="!isActive" class="search-icon-button" @click="openSearch">
      🔍
    </button>

    <!-- 搜索条 -->
    <div v-if="isActive" class="floating-search">
      <input
        ref="searchInput"
        v-model="query"
        class="floating-input"
        placeholder="搜索用户 / UID / 帖子..."
        @keyup.enter="handleSearch"
        @blur="onBlur"
      />

      <button class="close-button" @click="closeSearch">✕</button>
    </div>

    <!-- 实时搜索结果 -->
    <div class="search-hint" v-if="isActive && query.trim()">
      <div class="hint-content">
        <!-- 当有查询输入时 -->
        <div>
          <!-- 显示搜索结果 -->
          <div v-if="searchResults.length > 0">
            <div class="hint-title">搜索结果 ({{ searchResults.length }})</div>
            <div class="search-results">
              <!-- 用户结果 -->
              <div v-if="userResults.length > 0" class="result-section">
                <div class="result-section-title">用户</div>
                <div
                  v-for="user in userResults"
                  :key="'user-' + user.id"
                  class="result-item"
                  @click="goToUser(user.id)"
                >
                  <div class="result-avatar">
                    <img :src="user.avatar || '/Head.png'" :alt="user.username" />
                  </div>
                  <div class="result-info">
                    <div class="result-name">{{ user.username }}</div>
                    <div class="result-email">{{ user.email }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 帖子结果 -->
              <div v-if="postResults.length > 0" class="result-section">
                <div class="result-section-title">帖子</div>
                <div
                  v-for="post in postResults"
                  :key="'post-' + post.id"
                  class="result-item"
                  @click="goToPost(post.id)"
                >
                  <div class="result-icon">📝</div>
                  <div class="result-info">
                    <div class="result-name">{{ post.title }}</div>
                    <div class="result-meta">作者: {{ post.username }} · {{ formatDate(post.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无结果 -->
          <div v-else-if="query.trim() && !searchTimeout" class="no-results">
            未找到匹配的用户或帖子
          </div>
          
          <!-- 搜索中 -->
          <div v-else class="no-results">
            搜索中...
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../services/user'
import postService from '../services/post'

const router = useRouter()

const isActive = ref(false)
const query = ref('')
const searchInput = ref(null)
const searchResults = ref([])
const searchTimeout = ref(null)

// 计算属性：分离用户和帖子结果
const userResults = computed(() => {
  return searchResults.value.filter(item => item.type === 'user')
})

const postResults = computed(() => {
  return searchResults.value.filter(item => item.type === 'post')
})

// 实时搜索函数
const performSearch = async () => {
  const q = query.value.trim()
  
  if (!q) {
    searchResults.value = []
    return
  }

  try {
    // 并行搜索用户和帖子
    const [users, posts] = await Promise.all([
      userService.searchUsers(q),
      postService.searchPosts(q)
    ])

    // 合并结果并添加类型标识
    const userResultsWithType = users.map(user => ({
      ...user,
      type: 'user'
    }))

    const postResultsWithType = posts.map(post => ({
      ...post,
      type: 'post'
    }))

    // 合并并限制总结果数量
    searchResults.value = [
      ...userResultsWithType.slice(0, 5), // 最多5个用户
      ...postResultsWithType.slice(0, 5)  // 最多5个帖子
    ]
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  }
}

// 监听查询变化，使用防抖
watch(query, (newQuery) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (newQuery.trim()) {
    searchTimeout.value = setTimeout(() => {
      performSearch()
    }, 300) // 300ms防抖
  } else {
    searchResults.value = []
  }
})

const openSearch = () => {
  isActive.value = true

  nextTick(() => {
    searchInput.value?.focus()
  })
}

const closeSearch = () => {
  isActive.value = false
  query.value = ''
  searchResults.value = []
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
}

const handleSearch = () => {
  const q = query.value.trim()
  if (!q) return

  router.push({
    path: '/search',
    query: { q }
  })

  closeSearch()
}

// 跳转到用户页面
const goToUser = (userId) => {
  router.push(`/user/${userId}`)
  closeSearch()
}

// 跳转到帖子页面
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
  closeSearch()
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const onBlur = (e) => {
  setTimeout(() => {
    if (!e.relatedTarget || !e.relatedTarget.closest('.search-input-container')) {
      closeSearch()
    }
  }, 120)
}

const handleKey = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }

  if (e.key === 'Escape') {
    closeSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<style scoped>
/* 容器 */
.search-input-container {
  position: relative;
  height: 40px;
}

/* 搜索按钮 */
.search-icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

/* 搜索条（核心） */
.floating-search {
  position: absolute;
  right: 0;
  top: 0;

  height: 40px;
  width: 280px;

  display: flex;
  align-items: center;

  background: #fff;
  border-radius: 20px;

  padding: 0 6px;

  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  animation: slideIn 0.2s ease;
}

/* 输入框 */
.floating-input {
  flex: 1;

  height: 30px;
  border-radius: 14px;

  padding: 0 10px;

  border: none;
  outline: none;

  background: #f5f5f5;
  font-size: 14px;
}

/* 关闭按钮 */
.close-button {
  width: 26px;
  height: 26px;
  border: none;
  background: #eee;
  border-radius: 50%;
  cursor: pointer;
}

/* 下拉提示（关键修复） */
.search-hint {
  position: absolute;
  top: 48px;
  right: 0;

  width: 280px;
  max-width: calc(100vw - 20px);

  background: white;
  border-radius: 10px;

  box-shadow: 0 6px 20px rgba(0,0,0,0.12);

  padding: 10px;

  animation: fadeIn 0.2s ease;
}

.hint-title {
  font-weight: bold;
  margin-bottom: 6px;
}

.hint-content ul {
  padding-left: 16px;
  margin: 0;
}

.hint-content li {
  font-size: 13px;
  margin-bottom: 4px;
}

/* 搜索结果样式 */
.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.result-section {
  margin-bottom: 12px;
}

.result-section:last-child {
  margin-bottom: 0;
}

.result-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #eee;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.result-item:hover {
  background-color: #f5f5f5;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  flex-shrink: 0;
}

.result-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
  font-size: 16px;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-email {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

/* 手机适配 */
@media (max-width: 480px) {
  .floating-search {
    position: fixed;
    left: 12px;
    right: 12px;
    width: auto;
  }

  .search-hint {
    left: 12px;
    right: 12px;
    width: auto;
  }
}
</style>