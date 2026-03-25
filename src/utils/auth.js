// 本地存储键名
const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  TEAMS: 'teams',
  POSTS: 'posts'
};

// 职责选项
const ROLE_OPTIONS = {
  HEAVY: 'heavy',      // 重装
  DAMAGE: 'damage',    // 输出
  SUPPORT: 'support',  // 支援
  FLEXIBLE: 'flexible' // 灵活
};

// 所有有效职责
const ALL_VALID_ROLES = Object.values(ROLE_OPTIONS);

// 验证角色数组是否有效
const validateRoles = (roles) => {
  if (!Array.isArray(roles)) {
    return { valid: false, message: '职责必须是数组' };
  }
  
  if (roles.length === 0) {
    return { valid: false, message: '至少选择一个职责' };
  }
  
  // 检查是否包含无效角色
  for (const role of roles) {
    if (!ALL_VALID_ROLES.includes(role)) {
      return { valid: false, message: `无效的职责选项: ${role}` };
    }
  }
  
  // 检查灵活与其他职责的互斥性
  const hasFlexible = roles.includes(ROLE_OPTIONS.FLEXIBLE);
  const hasOtherRoles = roles.some(role => role !== ROLE_OPTIONS.FLEXIBLE);
  
  if (hasFlexible && hasOtherRoles) {
    return { valid: false, message: '灵活选项不能与其他职责同时选择' };
  }
  
  // 检查非灵活职责数量
  if (!hasFlexible && roles.length > 2) {
    return { valid: false, message: '最多只能选择2个职责' };
  }
  
  return { valid: true };
};

// 用户管理工具
export const auth = {
  // 获取所有用户
  getAllUsers() {
    try {
      const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('读取用户数据失败:', error);
      return [];
    }
  },

  // 保存所有用户
  saveAllUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('保存用户数据失败:', error);
      return false;
    }
  },

  // 注册新用户
  registerUser(userData) {
    const users = this.getAllUsers();
    
    // 检查用户名是否已存在
    if (users.some(user => user.username === userData.username)) {
      return { success: false, message: '用户名已存在' };
    }
    
    // 检查邮箱是否已存在
    if (users.some(user => user.email === userData.email)) {
      return { success: false, message: '邮箱已被注册' };
    }
    
    // 创建新用户对象
    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: [ROLE_OPTIONS.FLEXIBLE], // 默认职责为灵活（使用数组）
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 添加到用户列表
    users.push(newUser);
    
    // 保存到本地存储
    if (this.saveAllUsers(users)) {
      return { success: true, user: newUser };
    } else {
      return { success: false, message: '注册失败，请重试' };
    }
  },

  // 用户登录
  login(username, password, rememberMe = false) {
    const users = this.getAllUsers();
    
    // 查找用户（支持用户名或邮箱登录）
    const user = users.find(u =>
      u.username === username || u.email === username
    );
    
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    if (user.password !== password) {
      return { success: false, message: '密码错误' };
    }
    
    // 创建会话对象
    const session = {
      id: user.id,
      username: user.username,
      email: user.email,
      // 确保role是数组（处理旧数据可能是字符串的情况）
      role: Array.isArray(user.role) ? user.role : [user.role || 'flexible'],
      loggedIn: true,
      loginTime: new Date().toISOString(),
      rememberMe: rememberMe
    };
    
    // 保存会话
    this.saveSession(session, rememberMe);
    
    return { success: true, user: session };
  },

  // 保存会话
  saveSession(session, rememberMe = false) {
    try {
      if (rememberMe) {
        // 长期保存（30天）
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
      } else {
        // 会话级保存
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
      }
      return true;
    } catch (error) {
      console.error('保存会话失败:', error);
      return false;
    }
  },

  // 获取当前用户
  getCurrentUser() {
    try {
      // 先检查 sessionStorage
      let sessionJson = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      
      // 如果没有，检查 localStorage
      if (!sessionJson) {
        sessionJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      }
      
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        // 检查会话是否过期（如果是长期保存的）
        if (session.rememberMe) {
          const loginTime = new Date(session.loginTime);
          const now = new Date();
          const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
          
          // 如果超过30天，清除会话
          if (daysDiff > 30) {
            this.logout();
            return null;
          }
        }
        return session;
      }
      return null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  },

  // 检查是否已登录
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  // 获取当前用户名
  getCurrentUsername() {
    const user = this.getCurrentUser();
    return user ? user.username : null;
  },

  // 根据用户ID获取用户信息
  getUserById(userId) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === Number(userId));
    
    if (!user) {
      return null;
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
    };
  },

  // 注销
  logout() {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return true;
    } catch (error) {
      console.error('注销失败:', error);
      return false;
    }
  },

  // 更新用户信息
  updateUser(userId, updates) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' };
    }
    
    // 更新用户信息
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // 保存更新
    if (this.saveAllUsers(users)) {
      // 如果当前用户更新了自己的信息，更新会话
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedSession = {
          ...currentUser,
          ...updates
        };
        this.saveSession(updatedSession, currentUser.rememberMe);
      }
      
      return { success: true, user: users[userIndex] };
    } else {
      return { success: false, message: '更新失败' };
    }
  },

  // 删除用户（仅用于测试）
  deleteUser(userId) {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return { success: false, message: '用户不存在' };
    }
    
    if (this.saveAllUsers(filteredUsers)) {
      // 如果删除的是当前登录用户，则注销
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.logout();
      }
      
      return { success: true };
    } else {
      return { success: false, message: '删除失败' };
    }
  },

  // 验证密码强度
  validatePassword(password) {
    if (password.length < 6) {
      return { valid: false, message: '密码长度至少为6位' };
    }
    
    // 可以添加更多密码强度规则
    // if (!/[A-Z]/.test(password)) {
    //   return { valid: false, message: '密码必须包含大写字母' };
    // }
    // if (!/[0-9]/.test(password)) {
    //   return { valid: false, message: '密码必须包含数字' };
    // }
    
    return { valid: true };
  },

  // 获取所有战队
  getAllTeams() {
    try {
      const teamsJson = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return teamsJson ? JSON.parse(teamsJson) : [];
    } catch (error) {
      console.error('读取战队数据失败:', error);
      return [];
    }
  },

  // 保存所有战队
  saveAllTeams(teams) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
      return true;
    } catch (error) {
      console.error('保存战队数据失败:', error);
      return false;
    }
  },

  // 创建战队
  createTeam(teamName, creatorId) {
    const teams = this.getAllTeams();
    const users = this.getAllUsers();
    
    // 检查用户是否存在
    const creator = users.find(user => user.id === creatorId);
    if (!creator) {
      return { success: false, message: '用户不存在' };
    }
    
    // 检查用户是否已经加入其他战队
    if (creator.teamId) {
      return { success: false, message: '您已经加入了其他战队，请先退出' };
    }
    
    // 生成随机四位数标识符
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    const fullTeamName = `${teamName}#${randomSuffix}`;
    
    // 检查战队名称是否已存在
    if (teams.some(team => team.name === fullTeamName)) {
      return { success: false, message: '战队名称已存在，请重试' };
    }
    
    // 创建新战队对象
    const newTeam = {
      id: Date.now(),
      name: fullTeamName,
      displayName: teamName,
      creatorId: creatorId,
      createdAt: new Date().toISOString(),
      memberIds: [creatorId]
    };
    
    // 添加到战队列表
    teams.push(newTeam);
    
    // 保存战队
    if (!this.saveAllTeams(teams)) {
      return { success: false, message: '创建战队失败，请重试' };
    }
    
    // 更新用户的 teamId
    creator.teamId = newTeam.id;
    if (!this.saveAllUsers(users)) {
      // 回滚：移除刚创建的战队
      const index = teams.findIndex(t => t.id === newTeam.id);
      teams.splice(index, 1);
      this.saveAllTeams(teams);
      return { success: false, message: '更新用户信息失败' };
    }
    
    // 更新当前用户会话中的 teamId
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === creatorId) {
      currentUser.teamId = newTeam.id;
      this.saveSession(currentUser, currentUser.rememberMe);
    }
    
    return { success: true, team: newTeam };
  },

  // 加入战队
  joinTeam(teamName, userId) {
    const teams = this.getAllTeams();
    const users = this.getAllUsers();
    
    // 检查用户是否存在
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    // 检查用户是否已经加入其他战队
    if (user.teamId) {
      return { success: false, message: '您已经加入了其他战队，请先退出' };
    }
    
    // 查找战队（精确匹配完整名称）
    const team = teams.find(t => t.name === teamName);
    if (!team) {
      return { success: false, message: '战队不存在，请检查战队名称' };
    }
    
    // 检查用户是否已经是战队成员
    if (team.memberIds.includes(userId)) {
      return { success: false, message: '您已经是该战队的成员' };
    }
    
    // 添加用户到战队成员列表
    team.memberIds.push(userId);
    
    // 保存战队
    if (!this.saveAllTeams(teams)) {
      return { success: false, message: '加入战队失败，请重试' };
    }
    
    // 更新用户的 teamId
    user.teamId = team.id;
    if (!this.saveAllUsers(users)) {
      // 回滚：从战队成员中移除用户
      const memberIndex = team.memberIds.indexOf(userId);
      team.memberIds.splice(memberIndex, 1);
      this.saveAllTeams(teams);
      return { success: false, message: '更新用户信息失败' };
    }
    
    // 更新当前用户会话中的 teamId
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.teamId = team.id;
      this.saveSession(currentUser, currentUser.rememberMe);
    }
    
    return { success: true, team };
  },

  // 退出战队
  leaveTeam(userId) {
    const teams = this.getAllTeams();
    const users = this.getAllUsers();
    
    // 检查用户是否存在
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    // 检查用户是否加入了战队
    if (!user.teamId) {
      return { success: false, message: '您尚未加入任何战队' };
    }
    
    // 查找战队
    const team = teams.find(t => t.id === user.teamId);
    if (!team) {
      // 战队不存在，清除用户的 teamId
      user.teamId = null;
      this.saveAllUsers(users);
      return { success: false, message: '战队不存在，已自动清除关联' };
    }
    
    // 从战队成员中移除用户
    const memberIndex = team.memberIds.indexOf(userId);
    if (memberIndex === -1) {
      user.teamId = null;
      this.saveAllUsers(users);
      return { success: false, message: '您不是该战队的成员，已清除关联' };
    }
    
    team.memberIds.splice(memberIndex, 1);
    
    // 如果战队没有成员了，删除战队
    let teamDeleted = false;
    if (team.memberIds.length === 0) {
      const teamIndex = teams.findIndex(t => t.id === team.id);
      teams.splice(teamIndex, 1);
      teamDeleted = true;
    }
    
    // 保存战队
    if (!this.saveAllTeams(teams)) {
      return { success: false, message: '退出战队失败，请重试' };
    }
    
    // 更新用户的 teamId
    user.teamId = null;
    if (!this.saveAllUsers(users)) {
      // 回滚：重新添加用户到战队
      if (teamDeleted) {
        teams.push(team);
      } else {
        team.memberIds.push(userId);
      }
      this.saveAllTeams(teams);
      return { success: false, message: '更新用户信息失败' };
    }
    
    // 更新当前用户会话中的 teamId
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.teamId = null;
      this.saveSession(currentUser, currentUser.rememberMe);
    }
    
    return { success: true, teamDeleted };
  },

  // 获取用户所在的战队信息
  getUserTeam(userId) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.teamId) {
      return null;
    }
    
    const teams = this.getAllTeams();
    return teams.find(t => t.id === user.teamId) || null;
  },

  // 获取战队成员列表
  getTeamMembers(teamId) {
    const teams = this.getAllTeams();
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      return [];
    }
    
    const users = this.getAllUsers();
    return users.filter(user => team.memberIds.includes(user.id));
  },

  // 更新用户职责（支持单个角色或角色数组）
  updateUserRole(userId, roleOrRoles) {
    // 处理单个角色或角色数组
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' };
    }
    
    // 验证职责
    const validation = validateRoles(roles);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    // 更新用户职责（存储为数组）
    users[userIndex].role = roles;
    users[userIndex].updatedAt = new Date().toISOString();
    
    if (this.saveAllUsers(users)) {
      // 如果当前用户更新了自己的职责，更新会话
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.role = roles;
        this.saveSession(currentUser, currentUser.rememberMe);
      }
      
      return { success: true, user: users[userIndex] };
    } else {
      return { success: false, message: '更新职责失败' };
    }
  },

  // 更新用户职责（别名，用于明确支持多选）
  updateUserRoles(userId, roles) {
    return this.updateUserRole(userId, roles);
  },

  // 获取所有帖子
  getAllPosts() {
    try {
      const postsJson = localStorage.getItem(STORAGE_KEYS.POSTS);
      return postsJson ? JSON.parse(postsJson) : [];
    } catch (error) {
      console.error('读取帖子数据失败:', error);
      return [];
    }
  },

  // 保存所有帖子
  saveAllPosts(posts) {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return true;
    } catch (error) {
      console.error('保存帖子数据失败:', error);
      return false;
    }
  },

  // 创建新帖子
  createPost(postData) {
    const posts = this.getAllPosts();
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, message: '请先登录' };
    }
    
    // 创建新帖子对象
    const newPost = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      title: postData.title,
      content: postData.content,
      category: postData.category || 'general',
      likes: 0,
      comments: [],
      context: postData.parentId ? `${postData.parentId}/#` : '#', // 添加上下文属性
      parentId: postData.parentId || null, // 父帖子ID，如果是子帖子
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 添加到帖子列表
    posts.unshift(newPost); // 添加到开头，最新的帖子在前
    
    // 保存到本地存储
    if (this.saveAllPosts(posts)) {
      return { success: true, post: newPost };
    } else {
      return { success: false, message: '发帖失败，请重试' };
    }
  },

  // 获取用户的所有帖子（包括回复和评论）
  getUserPosts(userId) {
    const posts = this.getAllPosts();
    return posts.filter(post => post.userId === userId);
  },

  // 获取用户的主帖子（不包括回复和评论）
  getUserMainPosts(userId) {
    const posts = this.getAllPosts();
    return posts.filter(post => post.userId === userId && (post.parentId === null || post.parentId === undefined));
  },

  // 获取当前用户的帖子（包括回复和评论）
  getCurrentUserPosts() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    return this.getUserPosts(currentUser.id);
  },

  // 获取当前用户的主帖子（不包括回复和评论）
  getCurrentUserMainPosts() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    return this.getUserMainPosts(currentUser.id);
  },

  // 获取帖子的所有子帖子（评论）
  getChildPosts(postId) {
    const posts = this.getAllPosts();
    const numericPostId = Number(postId);
    return posts.filter(post => post.parentId === numericPostId);
  },

  // 获取帖子及其所有子帖子
  getPostWithChildren(postId) {
    const post = this.getPostById(postId);
    if (!post) {
      return null;
    }
    
    const childPosts = this.getChildPosts(postId);
    return {
      ...post,
      childPosts: childPosts
    };
  },

  // 根据帖子ID获取帖子详情
  getPostById(postId) {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === Number(postId));
    
    if (!post) {
      return null;
    }
    
    // 返回帖子详情（深拷贝避免修改原始数据）
    return JSON.parse(JSON.stringify(post));
  },

  // 删除帖子
  deletePost(postId) {
    const posts = this.getAllPosts();
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, message: '请先登录' };
    }
    
    const numericPostId = Number(postId);
    const postIndex = posts.findIndex(post => post.id === numericPostId);
    
    if (postIndex === -1) {
      return { success: false, message: '帖子不存在' };
    }
    
    // 检查权限：只有帖子作者可以删除
    if (posts[postIndex].userId !== currentUser.id) {
      return { success: false, message: '无权删除此帖子' };
    }
    
    // 删除帖子
    posts.splice(postIndex, 1);
    
    if (this.saveAllPosts(posts)) {
      return { success: true };
    } else {
      return { success: false, message: '删除失败' };
    }
  },

  // 点赞帖子
  likePost(postId) {
    const posts = this.getAllPosts();
    const numericPostId = Number(postId);
    const postIndex = posts.findIndex(post => post.id === numericPostId);
    
    if (postIndex === -1) {
      return { success: false, message: '帖子不存在' };
    }
    
    posts[postIndex].likes += 1;
    posts[postIndex].updatedAt = new Date().toISOString();
    
    if (this.saveAllPosts(posts)) {
      return { success: true, likes: posts[postIndex].likes };
    } else {
      return { success: false, message: '点赞失败' };
    }
  },

  // 添加评论（创建子帖子）
  addComment(postId, commentText) {
    const posts = this.getAllPosts();
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, message: '请先登录' };
    }
    
    // 将postId转换为数字进行比较
    const numericPostId = Number(postId);
    const parentPostIndex = posts.findIndex(post => post.id === numericPostId);
    
    if (parentPostIndex === -1) {
      return { success: false, message: '帖子不存在' };
    }
    
    // 创建子帖子（评论）
    const childPost = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      title: `回复: ${posts[parentPostIndex].title.substring(0, 30)}...`, // 简化的标题
      content: commentText,
      category: 'comment', // 特殊分类表示评论
      likes: 0,
      comments: [],
      context: `${numericPostId}/#`, // 上下文属性：父帖子id/#
      parentId: numericPostId, // 父帖子ID（数字类型）
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 添加到帖子列表
    posts.unshift(childPost);
    
    // 保存到本地存储
    if (this.saveAllPosts(posts)) {
      return { success: true, comment: childPost };
    } else {
      return { success: false, message: '评论失败' };
    }
  },

  // 删除评论（子帖子）
  deleteComment(commentId) {
    const posts = this.getAllPosts();
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, message: '请先登录' };
    }
    
    const numericCommentId = Number(commentId);
    const commentIndex = posts.findIndex(post => post.id === numericCommentId);
    
    if (commentIndex === -1) {
      return { success: false, message: '评论不存在' };
    }
    
    // 检查权限：只有评论作者或帖子作者可以删除评论
    const comment = posts[commentIndex];
    const isCommentAuthor = comment.userId === currentUser.id;
    
    // 如果是评论，还需要检查是否是帖子作者
    let isPostAuthor = false;
    if (comment.parentId) {
      const parentPost = posts.find(post => post.id === comment.parentId);
      if (parentPost && parentPost.userId === currentUser.id) {
        isPostAuthor = true;
      }
    }
    
    if (!isCommentAuthor && !isPostAuthor) {
      return { success: false, message: '无权删除此评论' };
    }
    
    // 删除评论
    posts.splice(commentIndex, 1);
    
    if (this.saveAllPosts(posts)) {
      return { success: true };
    } else {
      return { success: false, message: '删除失败' };
    }
  },

  // 初始化测试数据（仅用于开发）
  initTestData() {
    const users = this.getAllUsers();
    if (users.length === 0) {
      const testUsers = [
        {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'flexible', // 添加role字段
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          username: 'demo',
          email: 'demo@example.com',
          password: 'demo123',
          role: 'flexible', // 添加role字段
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(testUsers));
      console.log('测试数据已初始化');
    }
  }
};

// 导出默认实例
export default auth;