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

// 用户管理服务
export const userService = {
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
      return { success: true };
    } else {
      return { success: false, message: '删除失败' };
    }
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
      return { success: true, user: users[userIndex] };
    } else {
      return { success: false, message: '更新职责失败' };
    }
  },

  // 更新用户职责（别名，用于明确支持多选）
  updateUserRoles(userId, roles) {
    return this.updateUserRole(userId, roles);
  },

  // 获取用户所在的战队信息
  getUserTeam(userId) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.teamId) {
      return null;
    }
    
    // 需要导入teamService，这里先返回null，实际使用时需要依赖注入
    return null;
  },

  // 设置用户战队ID
  setUserTeamId(userId, teamId) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' };
    }
    
    users[userIndex].teamId = teamId;
    users[userIndex].updatedAt = new Date().toISOString();
    
    if (this.saveAllUsers(users)) {
      return { success: true, user: users[userIndex] };
    } else {
      return { success: false, message: '更新战队信息失败' };
    }
  },

  // 清除用户战队ID
  clearUserTeamId(userId) {
    return this.setUserTeamId(userId, null);
  },

  // 搜索用户（按用户名或邮箱）
  searchUsers(query) {
    const users = this.getAllUsers();
    const lowerQuery = query.toLowerCase();
    
    return users.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    ).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: Array.isArray(user.role) ? user.role : [user.role || 'flexible'],
      teamId: user.teamId || null
    }));
  }
};

// 导出默认实例
export default userService;