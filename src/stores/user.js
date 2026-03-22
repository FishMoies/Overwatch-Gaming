import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 本地存储键名
const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  TEAMS: 'teams',
  POSTS: 'posts'
}

// 职责选项
const ROLE_OPTIONS = {
  HEAVY: 'heavy',      // 重装
  DAMAGE: 'damage',    // 输出
  SUPPORT: 'support',  // 支援
  FLEXIBLE: 'flexible' // 灵活
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref(null)
  const users = ref([])
  const teams = ref([])
  const posts = ref([])
  
  // 计算属性
  const isLoggedIn = computed(() => currentUser.value !== null)
  const currentUsername = computed(() => currentUser.value?.username || null)
  const currentUserId = computed(() => currentUser.value?.id || null)
  const currentUserTeamId = computed(() => currentUser.value?.teamId || null)
  
  // 从本地存储加载数据
  const loadFromStorage = () => {
    try {
      const usersJson = localStorage.getItem(STORAGE_KEYS.USERS)
      const teamsJson = localStorage.getItem(STORAGE_KEYS.TEAMS)
      const postsJson = localStorage.getItem(STORAGE_KEYS.POSTS)
      
      users.value = usersJson ? JSON.parse(usersJson) : []
      teams.value = teamsJson ? JSON.parse(teamsJson) : []
      posts.value = postsJson ? JSON.parse(postsJson) : []
      
      // 加载当前用户
      let sessionJson = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER)
      if (!sessionJson) {
        sessionJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
      }
      
      if (sessionJson) {
        const session = JSON.parse(sessionJson)
        // 检查会话是否过期（如果是长期保存的）
        if (session.rememberMe) {
          const loginTime = new Date(session.loginTime)
          const now = new Date()
          const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24)
          
          // 如果超过30天，清除会话
          if (daysDiff > 30) {
            logout()
            return
          }
        }
        currentUser.value = session
      }
    } catch (error) {
      console.error('从本地存储加载数据失败:', error)
    }
  }
  
  // 保存数据到本地存储
  const saveUsers = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users.value))
      return true
    } catch (error) {
      console.error('保存用户数据失败:', error)
      return false
    }
  }
  
  const saveTeams = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams.value))
      return true
    } catch (error) {
      console.error('保存战队数据失败:', error)
      return false
    }
  }
  
  const savePosts = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts.value))
      return true
    } catch (error) {
      console.error('保存帖子数据失败:', error)
      return false
    }
  }
  
  // 保存会话
  const saveSession = (session, rememberMe = false) => {
    try {
      if (rememberMe) {
        // 长期保存（30天）
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session))
      } else {
        // 会话级保存
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session))
      }
      return true
    } catch (error) {
      console.error('保存会话失败:', error)
      return false
    }
  }
  
  // 用户注册
  const registerUser = (userData) => {
    // 检查用户名是否已存在
    if (users.value.some(user => user.username === userData.username)) {
      return { success: false, message: '用户名已存在' }
    }
    
    // 检查邮箱是否已存在
    if (users.value.some(user => user.email === userData.email)) {
      return { success: false, message: '邮箱已被注册' }
    }
    
    // 创建新用户对象
    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: [ROLE_OPTIONS.FLEXIBLE],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 添加到用户列表
    users.value.push(newUser)
    
    // 保存到本地存储
    if (saveUsers()) {
      return { success: true, user: newUser }
    } else {
      return { success: false, message: '注册失败，请重试' }
    }
  }
  
  // 用户登录
  const login = (username, password, rememberMe = false) => {
    // 查找用户（支持用户名或邮箱登录）
    const user = users.value.find(u =>
      u.username === username || u.email === username
    )
    
    if (!user) {
      return { success: false, message: '用户不存在' }
    }
    
    if (user.password !== password) {
      return { success: false, message: '密码错误' }
    }
    
    // 创建会话对象
    const session = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: Array.isArray(user.role) ? user.role : [user.role || 'flexible'],
      loggedIn: true,
      loginTime: new Date().toISOString(),
      rememberMe: rememberMe,
      teamId: user.teamId || null
    }
    
    // 保存会话
    saveSession(session, rememberMe)
    currentUser.value = session
    
    return { success: true, user: session }
  }
  
  // 用户注销
  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      currentUser.value = null
      return true
    } catch (error) {
      console.error('注销失败:', error)
      return false
    }
  }
  
  // 获取用户信息
  const getUserById = (userId) => {
    const user = users.value.find(u => u.id === Number(userId))
    
    if (!user) {
      return null
    }
    
    // 返回用户信息（不包含密码）
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: Array.isArray(user.role) ? user.role : [user.role || 'flexible'],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      teamId: user.teamId || null
    }
  }
  
  // 更新用户信息
  const updateUser = (userId, updates) => {
    const userIndex = users.value.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' }
    }
    
    // 更新用户信息
    users.value[userIndex] = {
      ...users.value[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    // 保存更新
    if (saveUsers()) {
      // 如果当前用户更新了自己的信息，更新会话
      if (currentUser.value && currentUser.value.id === userId) {
        const updatedSession = {
          ...currentUser.value,
          ...updates
        }
        saveSession(updatedSession, currentUser.value.rememberMe)
        currentUser.value = updatedSession
      }
      
      return { success: true, user: users.value[userIndex] }
    } else {
      return { success: false, message: '更新失败' }
    }
  }
  
  // 获取当前用户
  const getCurrentUser = () => {
    return currentUser.value
  }
  
  // 检查是否已登录
  const isLoggedInFn = () => {
    return currentUser.value !== null
  }
  
  // 获取当前用户名
  const getCurrentUsername = () => {
    return currentUser.value?.username || null
  }
  
  // 初始化时加载数据
  loadFromStorage()
  
  return {
    // 状态
    currentUser,
    users,
    teams,
    posts,
    
    // 计算属性
    isLoggedIn,
    currentUsername,
    currentUserId,
    currentUserTeamId,
    
    // 方法
    loadFromStorage,
    registerUser,
    login,
    logout,
    getUserById,
    updateUser,
    getCurrentUser,
    isLoggedInFn,
    getCurrentUsername,
    saveSession,
    saveUsers,
    saveTeams,
    savePosts,
    createTeam: (teamName, creatorId) => {
      const creator = users.value.find(user => user.id === creatorId)
      if (!creator) {
        return { success: false, message: '用户不存在' }
      }
      
      if (creator.teamId) {
        return { success: false, message: '您已经加入了其他战队，请先退出' }
      }
      
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const fullTeamName = `${teamName}#${randomSuffix}`
      
      if (teams.value.some(team => team.name === fullTeamName)) {
        return { success: false, message: '战队名称已存在，请重试' }
      }
      
      const newTeam = {
        id: Date.now(),
        name: fullTeamName,
        displayName: teamName,
        creatorId: creatorId,
        createdAt: new Date().toISOString(),
        memberIds: [creatorId]
      }
      
      teams.value.push(newTeam)
      
      if (!saveTeams()) {
        return { success: false, message: '创建战队失败，请重试' }
      }
      
      creator.teamId = newTeam.id
      if (!saveUsers()) {
        const index = teams.value.findIndex(t => t.id === newTeam.id)
        teams.value.splice(index, 1)
        saveTeams()
        return { success: false, message: '更新用户信息失败' }
      }
      
      if (currentUser.value && currentUser.value.id === creatorId) {
        currentUser.value.teamId = newTeam.id
        saveSession(currentUser.value, currentUser.value.rememberMe)
      }
      
      return { success: true, team: newTeam }
    },
    joinTeam: (teamName, userId) => {
      const user = users.value.find(u => u.id === userId)
      if (!user) {
        return { success: false, message: '用户不存在' }
      }
      
      if (user.teamId) {
        return { success: false, message: '您已经加入了其他战队，请先退出' }
      }
      
      const team = teams.value.find(t => t.name === teamName)
      if (!team) {
        return { success: false, message: '战队不存在，请检查战队名称' }
      }
      
      if (team.memberIds.includes(userId)) {
        return { success: false, message: '您已经是该战队的成员' }
      }
      
      team.memberIds.push(userId)
      
      if (!saveTeams()) {
        return { success: false, message: '加入战队失败，请重试' }
      }
      
      user.teamId = team.id
      if (!saveUsers()) {
        const memberIndex = team.memberIds.indexOf(userId)
        team.memberIds.splice(memberIndex, 1)
        saveTeams()
        return { success: false, message: '更新用户信息失败' }
      }
      
      if (currentUser.value && currentUser.value.id === userId) {
        currentUser.value.teamId = team.id
        saveSession(currentUser.value, currentUser.value.rememberMe)
      }
      
      return { success: true, team }
    },
    createPost: (postData) => {
      if (!currentUser.value) {
        return { success: false, message: '请先登录' }
      }
      
      const newPost = {
        id: Date.now(),
        userId: currentUser.value.id,
        username: currentUser.value.username,
        title: postData.title,
        content: postData.content,
        category: postData.category || 'general',
        likes: 0,
        comments: [],
        context: postData.parentId ? `${postData.parentId}/#` : '#',
        parentId: postData.parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      posts.value.unshift(newPost)
      
      if (savePosts()) {
        return { success: true, post: newPost }
      } else {
        return { success: false, message: '发帖失败，请重试' }
      }
    },
    getPostById: (postId) => {
      const post = posts.value.find(p => p.id === Number(postId))
      
      if (!post) {
        return null
      }
      
      return JSON.parse(JSON.stringify(post))
    },
    getChildPosts: (postId) => {
      const numericPostId = Number(postId)
      return posts.value.filter(post => post.parentId === numericPostId)
    }
  }
})
