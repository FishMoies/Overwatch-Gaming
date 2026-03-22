<template>
  <div class="search-page">
    <div class="search-container">
      <div class="search-header">
        <h1>搜索</h1>
        <div class="search-input-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索用户名、UID、帖子编号或帖子标题..."
            @keyup.enter="performSearch"
            class="search-input"
            ref="searchInput"
          />
          <button @click="performSearch" class="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="search-tabs">
        <button
          :class="['tab-button', { active: activeTab === 'posts' }]"
          @click="activeTab = 'posts'"
        >
          帖子
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'users' }]"
          @click="activeTab = 'users'"
        >
          用户
        </button>
      </div>

      <div class="search-results">
        <div v-if="loading" class="loading">搜索中...</div>
        
        <div v-else-if="searchQuery.trim() === ''" class="empty-state">
          <p>请输入搜索关键词</p>
        </div>
        
        <div v-else-if="activeTab === 'posts' && posts.length === 0" class="empty-state">
          <p>未找到相关帖子</p>
        </div>
        
        <div v-else-if="activeTab === 'users' && users.length === 0" class="empty-state">
          <p>未找到相关用户</p>
        </div>
        
        <div v-else>
          <!-- 帖子搜索结果 -->
          <div v-if="activeTab === 'posts'" class="posts-results">
            <div v-for="post in posts" :key="post.id" class="post-card" @click="viewPostDetail(post.id)">
              <div class="post-header">
                <span class="post-id">#{{ post.id }}</span>
                <span class="post-title">{{ post.title }}</span>
              </div>
              <div class="post-content">{{ post.content.substring(0, 100) }}...</div>
              <div class="post-footer">
                <span class="post-author">作者: {{ post.author }}</span>
                <span class="post-date">{{ post.date }}</span>
                <button class="view-detail-button" @click.stop="viewPostDetail(post.id)">
                  查看详情
                </button>
              </div>
            </div>
          </div>
          
          <!-- 用户搜索结果 -->
          <div v-if="activeTab === 'users'" class="users-results">
            <div v-for="user in users" :key="user.id" class="user-card">
              <div class="user-avatar">
                <div class="avatar-placeholder">{{ user.name.charAt(0) }}</div>
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-uid">UID: {{ user.id }}</div>
                <div class="user-bio">{{ user.bio || '暂无简介' }}</div>
              </div>
              <button class="view-profile-button" @click="viewProfile(user.id)">
                查看资料
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import auth from '../utils/auth.js'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const activeTab = ref('posts')
const loading = ref(false)
const posts = ref([])
const users = ref([])
const searchInput = ref(null)

// 从路由参数获取搜索词
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q
    performSearch()
  }
  
  // 聚焦搜索输入框
  if (searchInput.value) {
    searchInput.value.focus()
  }
})

// 监听搜索词变化
watch(searchQuery, (newQuery) => {
  if (newQuery.trim() !== '') {
    updateUrl()
  }
})

// 更新URL
const updateUrl = () => {
  const query = { ...route.query, q: searchQuery.value }
  router.replace({ query })
}

// 执行搜索
const performSearch = () => {
  if (searchQuery.value.trim() === '') return
  
  loading.value = true
  updateUrl()
  
  // 使用setTimeout模拟网络延迟，但使用真实数据
  setTimeout(() => {
    const query = searchQuery.value.toLowerCase().trim()
    
    if (activeTab.value === 'posts') {
      // 搜索帖子 - 过滤掉回复和评论（parentId为null或undefined的才是主帖子）
      const allPosts = auth.getAllPosts()
      posts.value = allPosts.filter(post => {
        // 只显示主帖子（parentId为null或undefined）
        const isMainPost = post.parentId === null || post.parentId === undefined
        
        return isMainPost && (
          post.id.toString().includes(query) ||
          post.title.toLowerCase().includes(query) ||
          post.username.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
        )
      }).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.username,
        date: new Date(post.createdAt).toLocaleDateString('zh-CN')
      }))
    } else {
      // 搜索用户
      const allUsers = auth.getAllUsers()
      users.value = allUsers.filter(user => {
        return (
          user.id.toString().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query))
        )
      }).map(user => ({
        id: user.id,
        name: user.username,
        bio: '守望先锋玩家'
      }))
    }
    
    loading.value = false
  }, 300)
}

// 查看用户资料
const viewProfile = (uid) => {
  router.push({ name: 'UserProfile', params: { uid } })
}

// 查看帖子详情
const viewPostDetail = (postId) => {
  router.push({ name: 'PostDetail', params: { id: postId } })
}

// 监听标签切换
watch(activeTab, () => {
  if (searchQuery.value.trim() !== '') {
    performSearch()
  }
})
</script>

<style scoped>
.search-page {
  padding: 80px 20px 40px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.search-header {
  margin-bottom: 30px;
}

.search-header h1 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 2em;
}

.search-input-wrapper {
  position: relative;
  display: flex;
}

.search-input {
  flex: 1;
  padding: 12px 50px 12px 20px;
  border: 2px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #667eea;
}

.search-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #5a67d8;
}

.search-tabs {
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  color: #666;
  transition: color 0.3s;
}

.tab-button.active {
  color: #667eea;
  font-weight: bold;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #667eea;
}

.tab-button:hover:not(.active) {
  color: #333;
}

.search-results {
  min-height: 300px;
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.posts-results, .users-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  background-color: white;
}

.post-card:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-3px);
  border-color: #667eea;
  background-color: #f9fafc;
}

.post-card:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.2);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.post-id {
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
  color: #666;
}

.post-title {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.post-content {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #999;
}

.view-detail-button {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-detail-button:hover {
  background-color: #5a67d8;
}

.user-card {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s;
}

.user-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  margin-right: 16px;
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: bold;
  font-size: 18px;
  color: #333;
  margin-bottom: 4px;
}

.user-uid {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.user-bio {
  font-size: 14px;
  color: #999;
}

.view-profile-button {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-profile-button:hover {
  background-color: #5a67d8;
}
</style>