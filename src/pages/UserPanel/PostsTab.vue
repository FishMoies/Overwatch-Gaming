<template>
  <div class="posts-tab">
    <div class="posts-header">
      <h2 class="posts-title">{{ isOwner ? '我的帖子' : `${displayName || username}的帖子` }}</h2>
      <div class="posts-actions">
        <button v-if="isOwner" class="create-btn" @click="$emit('create-post')">
          <span>📝</span>
          <span>发布新帖子</span>
        </button>
        <div class="posts-stats">
          <span>共 {{ posts.length }} 篇帖子</span>
          <span>获赞 {{ totalLikes }} 次</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="state-message">
      <div class="spinner"></div>
      <p>加载帖子中...</p>
    </div>

    <div v-else-if="posts.length === 0" class="state-message">
    <p class="empty-text">{{ isOwner ? '您还没有发布过任何帖子' : `${displayName || username}还没有发布过任何帖子` }}</p>
      <button v-if="isOwner" class="create-btn-empty" @click="$emit('create-post')">
        <span>发布第一篇帖子</span>
      </button>
    </div>

    <div v-else class="posts-waterfall">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
        :class="categoryClass(post.category)"
      >
        <div class="post-header">
          <span class="post-category">{{ categoryName(post.category) }}</span>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <div class="post-content" v-html="renderPreview(post.content, 150)"></div>
        <div class="post-footer">
          <div class="post-stats">
            <span class="stat">❤️ {{ post.likes }}</span>
            <span class="stat">💬 {{ post.comments?.length || 0 }}</span>
          </div>
          <div class="post-actions">
            <button class="view-btn" @click="$emit('view-post', post.pid || post.id)">查看详情</button>
            <button v-if="isOwner" class="del-btn" @click="$emit('delete-post', post.pid || post.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  posts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false },
  username: { type: String, default: '' },
  displayName: { type: String, default: '' },
  totalLikes: { type: Number, default: 0 }
})

const emit = defineEmits(['create-post', 'view-post', 'delete-post'])

const CATEGORY_MAP = {
  'general': '一般讨论',
  'team': '战队招募',
  'strategy': '战术攻略',
  'highlight': '精彩集锦',
  'question': '问题求助',
  'announcement': '公告通知'
}

function categoryName(cat) {
  return CATEGORY_MAP[cat] || '其他'
}

function categoryClass(cat) {
  return 'post-category-' + cat
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return ''
  }
}

function renderPreview(html, max = 150) {
  if (!html) return ''
  if (!html.includes('<') || !html.includes('>')) {
    return html.length > max ? html.substring(0, max) + '...' : html
  }
  let safe = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
    .replace(/ on\w+=\w+/gi, '')
    .replace(/<(?!\/?(p|strong|b|em|i|u|s|strike|h[1-6]|ul|ol|li|blockquote|hr|br)(\s[^>]*)?>)[^>]+>/gi, '')
  const text = safe.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return safe
  let result = ''
  let inTag = false
  let tagBuf = ''
  let count = 0
  let i = 0
  while (i < safe.length && count < max) {
    const ch = safe[i]
    if (ch === '<') { inTag = true; tagBuf = ch; i++; continue }
    if (ch === '>') { inTag = false; tagBuf += ch; result += tagBuf; tagBuf = ''; i++; continue }
    if (inTag) { tagBuf += ch } else { result += ch; count++ }
    i++
  }
  if (i < safe.length) result += '...'
  if (inTag && tagBuf) result += tagBuf + '>'
  return result
}
</script>

<style scoped>
.posts-tab {
  padding: 24px 0;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.posts-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-link);
  margin: 0;
}

.posts-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  background: transparent;
  color: var(--color-text-primary);
  border: 2px solid var(--color-text-primary);
  border-radius: 10px;
  font-family: 'MapleMono CN Regular', monospace;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-brand-bg);
  background: var(--color-surface-hover);
}

.posts-stats {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.state-message {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-text-link);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-text {
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.create-btn-empty {
  padding: 10px 24px;
  background: transparent;
  color: var(--color-text-primary);
  border: 2px solid var(--color-text-primary);
  border-radius: 10px;
  font-family: 'MapleMono CN Regular', monospace;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.create-btn-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-brand-bg);
  background: var(--color-surface-hover);
}

.posts-waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.post-card {
  background: var(--color-surface);
  border-radius: 14px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  border-left: 4px solid var(--color-text-link);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-text-link);
}

.post-category-general { border-left-color: var(--color-text-tertiary); }
.post-category-team { border-left-color: var(--color-success); }
.post-category-strategy { border-left-color: #17a2b8; }
.post-category-highlight { border-left-color: var(--color-warning); }
.post-category-question { border-left-color: #fd7e14; }
.post-category-announcement { border-left-color: var(--color-error); }

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-category {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--color-surface-hover);
  color: var(--color-text-link);
}

.post-date {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.post-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  line-height: 1.4;
}

.post-content {
  font-family: var(--content-font);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.post-stats {
  display: flex;
  gap: 12px;
}

.stat {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.post-actions {
  display: flex;
  gap: 8px;
}

.view-btn, .del-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-family: 'SmileySans Oblique', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn {
  background: var(--color-brand);
  color: var(--color-text-inverse);
}

.view-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-brand-bg);
}

.del-btn {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1.5px solid var(--color-error);
}

.del-btn:hover {
  background: var(--color-error);
  color: var(--color-text-inverse);
}
</style>
