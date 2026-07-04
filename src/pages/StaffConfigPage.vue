<template>
  <div class="staff-config-page">
    <!-- 顶部导航栏 -->
    <div class="config-header">
      <div class="header-left">
        <h1>📋 站务配置</h1>
        <span class="header-subtitle">管理站务公示页面的人员任命</span>
      </div>
      <div class="header-right">
        <button class="btn btn-refresh" @click="loadData" :disabled="loading">
          {{ loading ? '加载中...' : '🔄 刷新' }}
        </button>
        <button class="btn btn-close" @click="goBack">✕ 返回</button>
      </div>
    </div>

    <!-- SID 岗位定义卡片 -->
    <div class="section-card">
      <div class="section-card-header">
        <h2>📌 岗位定义（SID）</h2>
        <span class="badge-info">{{ positions.length }} 个岗位</span>
      </div>
      <div class="positions-grid">
        <div v-for="pos in positions" :key="pos.sid" class="position-card">
          <div class="pos-sid">#{{ pos.sid }}</div>
          <div class="pos-name">{{ pos.name }}</div>
          <div class="pos-desc">{{ pos.description }}</div>
        </div>
      </div>
    </div>

    <!-- 任命管理 -->
    <div class="section-card">
      <div class="section-card-header">
        <h2>👥 人员任命</h2>
        <button class="btn btn-small btn-primary" @click="openAddModal">+ 新增任命</button>
      </div>

      <!-- Tabs: 常驻 / 特设 -->
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'permanent' }"
          @click="activeTab = 'permanent'"
        >
          常驻站务（{{ assignments.filter(a => a.staff_type === 'permanent').length }}）
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'rotating' }"
          @click="activeTab = 'rotating'"
        >
          特设站务（{{ assignments.filter(a => a.staff_type === 'rotating').length }}）
        </button>
      </div>

      <!-- 数据表 -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>排序</th>
              <th>UID</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>SID</th>
              <th>岗位名称</th>
              <th>任期</th>
              <th>联系方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in filteredAssignments" :key="item.id">
              <td>
                <span class="sort-controls">
                  <button
                    class="btn-icon"
                    @click="moveItem(idx, -1)"
                    :disabled="idx === 0"
                    title="上移"
                  >↑</button>
                  <button
                    class="btn-icon"
                    @click="moveItem(idx, 1)"
                    :disabled="idx === filteredAssignments.length - 1"
                    title="下移"
                  >↓</button>
                </span>
              </td>
              <td class="cell-mono">{{ item.uid }}</td>
              <td>{{ item.username || '-' }}</td>
              <td>{{ item.nickname || '-' }}</td>
              <td class="cell-mono">#{{ item.sid }}</td>
              <td>{{ item.positionName || '-' }}</td>
              <td>{{ item.term || '-' }}</td>
              <td>{{ item.contact || '-' }}</td>
              <td class="actions-cell">
                <button class="btn btn-sm btn-edit" @click="openEditModal(item)">编辑</button>
                <button class="btn btn-sm btn-delete" @click="confirmDelete(item)">删除</button>
              </td>
            </tr>
            <tr v-if="filteredAssignments.length === 0">
              <td colspan="9" class="empty-row">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 编辑/新增模态框 -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingItem ? '编辑任命' : '新增任命' }}</h3>
          <button class="btn btn-close-modal" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择用户（输入用户名或UID搜索）</label>
            <div class="user-search">
              <input
                v-model="userSearchQuery"
                type="text"
                placeholder="输入用户名或UID..."
                class="form-input"
                @input="searchUsers"
              />
              <div v-if="userSearchResults.length > 0" class="user-search-results">
                <div
                  v-for="u in userSearchResults"
                  :key="u.uid"
                  class="user-search-item"
                  :class="{ selected: selectedUser && selectedUser.uid === u.uid }"
                  @click="selectUser(u)"
                >
                  <img :src="u.avatar || '/default-avatar.png'" class="user-avatar-sm" />
                  <span class="user-name">{{ u.displayName }}</span>
                  <span class="user-uid">({{ u.uid }})</span>
                </div>
              </div>
            </div>
            <div v-if="selectedUser" class="selected-user">
              <img :src="selectedUser.avatar || '/default-avatar.png'" class="user-avatar-sm" />
              <span>{{ selectedUser.displayName }}</span>
              <span class="user-uid">({{ selectedUser.uid }})</span>
              <button class="btn btn-sm btn-remove" @click="selectedUser = null">✕ 清除</button>
            </div>
          </div>
          <div class="form-group">
            <label>岗位编号（SID）</label>
            <select v-model="formData.sid" class="form-select">
              <option value="" disabled>请选择岗位</option>
              <option v-for="pos in positions" :key="pos.sid" :value="pos.sid">
                #{{ pos.sid }} - {{ pos.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>任命类型</label>
            <select v-model="formData.staff_type" class="form-select">
              <option value="permanent">常驻站务</option>
              <option value="rotating">特设站务</option>
            </select>
          </div>
          <div class="form-group">
            <label>任期描述（仅特设站务）</label>
            <input v-model="formData.term" type="text" placeholder="如: 2026年7月-2026年12月" class="form-input" />
          </div>
          <div class="form-group">
            <label>联系方式（可选）</label>
            <input v-model="formData.contact" type="text" placeholder="邮箱或其他联系方式" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeModal">取消</button>
          <button class="btn btn-save" @click="saveAssignment" :disabled="saving">
            {{ saving ? '保存中...' : '💾 保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div class="modal-overlay" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h3>⚠️ 确认删除</h3>
        </div>
        <div class="modal-body">
          <p>确定要删除 <strong>{{ deletingItem?.username || deletingItem?.uid }}</strong> 的任命吗？</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-danger" @click="doDelete" :disabled="saving">
            {{ saving ? '删除中...' : '🗑 确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { staffApi } from '../services/api/index.js'

const router = useRouter()

// 状态
const loading = ref(false)
const saving = ref(false)
const positions = ref([])
const assignments = ref([])
const activeTab = ref('permanent')

// 用户搜索
const allUsers = ref([])
const userSearchQuery = ref('')
const userSearchResults = ref([])
const selectedUser = ref(null)

// Modal
const showModal = ref(false)
const editingItem = ref(null)
const formData = ref({
  sid: '',
  staff_type: 'permanent',
  term: '',
  contact: ''
})

// 删除确认
const showDeleteConfirm = ref(false)
const deletingItem = ref(null)

// 计算属性
const filteredAssignments = computed(() => {
  return assignments.value.filter(a => a.staff_type === activeTab.value)
})

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const [posRes, assignRes, usersRes] = await Promise.all([
      staffApi.getPositions(),
      staffApi.getAdminData(),
      fetch('/api/auth/users').then(r => r.json())
    ])
    if (posRes.success) positions.value = posRes.positions
    if (assignRes.success) assignments.value = assignRes.data
    if (usersRes.success) allUsers.value = usersRes.users
  } catch (e) {
    console.error('加载数据失败:', e)
    alert('加载数据失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

// 用户搜索
function searchUsers() {
  const q = userSearchQuery.value.trim().toLowerCase()
  if (!q) {
    userSearchResults.value = []
    return
  }
  userSearchResults.value = allUsers.value.filter(u => {
    const name = (u.username || '').toLowerCase()
    const nick = (u.nickname || '').toLowerCase()
    const uid = (u.uid || '').toLowerCase()
    return name.includes(q) || nick.includes(q) || uid.includes(q)
  }).slice(0, 10)
}

function selectUser(user) {
  selectedUser.value = user
  userSearchQuery.value = ''
  userSearchResults.value = []
}

// 排序操作
function moveItem(idx, direction) {
  const list = filteredAssignments.value
  if (idx + direction < 0 || idx + direction >= list.length) return

  // 在完整列表中找到对应的实际 assignment
  const item = list[idx]
  const swapItem = list[idx + direction]

  // 交换 sort_order
  const tempOrder = item.sort_order
  item.sort_order = swapItem.sort_order
  swapItem.sort_order = tempOrder

  // 重新排序数组
  const fullList = assignments.value
  const itemFull = fullList.find(a => a.id === item.id)
  const swapFull = fullList.find(a => a.id === swapItem.id)
  if (itemFull && swapFull) {
    const temp = itemFull.sort_order
    itemFull.sort_order = swapFull.sort_order
    swapFull.sort_order = temp
  }

  // 提交新排序
  staffApi.reorder([
    { id: item.id, sort_order: item.sort_order },
    { id: swapItem.id, sort_order: swapItem.sort_order }
  ])
}

// Modal
function openAddModal() {
  editingItem.value = null
  selectedUser.value = null
  userSearchQuery.value = ''
  userSearchResults.value = []
  formData.value = { sid: '', staff_type: 'permanent', term: '', contact: '' }
  showModal.value = true
}

function openEditModal(item) {
  editingItem.value = item
  selectedUser.value = { uid: item.uid, username: item.username, nickname: item.nickname, displayName: item.nickname || item.username, avatar: item.avatar }
  userSearchQuery.value = ''
  userSearchResults.value = []
  formData.value = {
    sid: item.sid,
    staff_type: item.staff_type,
    term: item.term || '',
    contact: item.contact || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingItem.value = null
}

async function saveAssignment() {
  if (!selectedUser.value) {
    alert('请选择用户')
    return
  }
  if (!formData.value.sid) {
    alert('请选择岗位')
    return
  }

  saving.value = true
  try {
    const data = {
      uid: selectedUser.value.uid,
      sid: formData.value.sid,
      staff_type: formData.value.staff_type,
      term: formData.value.term,
      contact: formData.value.contact
    }

    let res
    if (editingItem.value) {
      res = await staffApi.updateAssignment(editingItem.value.id, data)
    } else {
      res = await staffApi.createAssignment(data)
    }

    if (res.success) {
      closeModal()
      await loadData()
    } else {
      alert('操作失败: ' + (res.message || '未知错误'))
    }
  } catch (e) {
    alert('操作失败: ' + e.message)
  } finally {
    saving.value = false
  }
}

// 删除
function confirmDelete(item) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingItem.value) return
  saving.value = true
  try {
    const res = await staffApi.deleteAssignment(deletingItem.value.id)
    if (res.success) {
      showDeleteConfirm.value = false
      deletingItem.value = null
      await loadData()
    } else {
      alert('删除失败: ' + (res.message || '未知错误'))
    }
  } catch (e) {
    alert('删除失败: ' + e.message)
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/adminpower')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 全局布局 */
.staff-config-page {
  min-height: 100vh;
  background: #0f0f1a;
  color: #e0e0e0;
  font-family: 'Segoe UI', sans-serif;
  padding-bottom: 40px;
}

/* 顶部导航 */
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #1a1a2e;
  border-bottom: 1px solid #2a2a4a;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  margin: 0;
  font-size: 20px;
  color: #fff;
}

.header-subtitle {
  color: #888;
  font-size: 13px;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* 区块卡片 */
.section-card {
  background: #1a1a2e;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  margin: 16px 24px;
  padding: 16px 20px;
}

.section-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-card-header h2 {
  margin: 0;
  font-size: 16px;
  color: #fff;
}

.badge-info {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: #252545;
  color: #4facfe;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 岗位卡片 */
.positions-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.position-card {
  background: #0f0f1a;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  padding: 12px 16px;
  flex: 1;
  min-width: 200px;
}

.pos-sid {
  font-family: 'Consolas', monospace;
  font-size: 13px;
  color: #4facfe;
  font-weight: 600;
  margin-bottom: 4px;
}

.pos-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.pos-desc {
  font-size: 12px;
  color: #888;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  border-bottom: 1px solid #2a2a4a;
  padding-bottom: 8px;
}

.tab-btn {
  padding: 6px 16px;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 13px;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #ccc;
  background: #252545;
}

.tab-btn.active {
  color: #4facfe;
  background: #252545;
  font-weight: 600;
}

/* 数据表 */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.data-table thead th {
  background: #252545;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  color: #ccc;
  border-bottom: 1px solid #333;
  white-space: nowrap;
}

.data-table tbody td {
  padding: 6px 10px;
  border-bottom: 1px solid #222;
}

.data-table tbody tr:hover {
  background: #222240;
}

.cell-mono {
  font-family: 'Consolas', monospace;
  font-size: 11px;
  color: #aaa;
}

.empty-row {
  text-align: center;
  padding: 30px;
  color: #666;
}

/* 排序控件 */
.sort-controls {
  display: flex;
  gap: 2px;
}

.btn-icon {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #333;
  background: #1a1a2e;
  color: #888;
  cursor: pointer;
  border-radius: 3px;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover:not(:disabled) {
  background: #2a2a4a;
  color: #fff;
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 按钮通用 */
.btn {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #2a5a8a;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #3a7aaa;
}

.btn-refresh {
  background: #2a6a2a;
  color: #fff;
}

.btn-refresh:hover:not(:disabled) {
  background: #3a8a3a;
}

.btn-close {
  background: #5a2a2a;
  color: #fff;
}

.btn-close:hover {
  background: #7a3a3a;
}

.btn-small {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-sm {
  padding: 3px 8px;
  font-size: 11px;
}

.btn-edit {
  background: #2a5a8a;
  color: #fff;
}

.btn-edit:hover {
  background: #3a7aaa;
}

.btn-delete {
  background: #5a2a2a;
  color: #fff;
}

.btn-delete:hover {
  background: #7a3a3a;
}

.btn-remove {
  background: #3a2a2a;
  color: #f88;
  margin-left: 8px;
}

.btn-danger {
  background: #7a2a2a;
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: #9a3a3a;
}

.actions-cell {
  display: flex;
  gap: 4px;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #1a1a2e;
  border: 1px solid #2a2a4a;
  border-radius: 10px;
  width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-sm {
  width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #2a2a4a;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
}

.btn-close-modal {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  background: #3a2a2a;
  color: #f88;
  border-color: #7a3a3a;
}

.modal-body {
  padding: 18px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid #2a2a4a;
}

.btn-cancel {
  background: #333;
  color: #ccc;
}

.btn-cancel:hover {
  background: #444;
}

.btn-save {
  background: #2a6a2a;
  color: #fff;
}

.btn-save:hover:not(:disabled) {
  background: #3a8a3a;
}

/* 表单 */
.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #aaa;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 10px;
  background: #0a0a18;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 13px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4facfe;
}

.form-select {
  cursor: pointer;
}

/* 用户搜索 */
.user-search {
  position: relative;
}

.user-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a2e;
  border: 1px solid #2a2a4a;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.user-search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-search-item:hover {
  background: #252545;
}

.user-search-item.selected {
  background: #2a3a5a;
}

.user-avatar-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: #e0e0e0;
}

.user-uid {
  font-size: 11px;
  color: #888;
  font-family: 'Consolas', monospace;
}

.selected-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 10px;
  background: #0f1a2e;
  border: 1px solid #2a4a6a;
  border-radius: 4px;
}
</style>