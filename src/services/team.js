// 本地存储键名
const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  TEAMS: 'teams',
  POSTS: 'posts'
};

// 战队管理服务
export const teamService = {
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
    
    return { success: true, team: newTeam };
  },

  // 加入战队
  joinTeam(teamName, userId) {
    const teams = this.getAllTeams();
    
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
    
    return { success: true, team };
  },

  // 退出战队
  leaveTeam(userId) {
    const teams = this.getAllTeams();
    
    // 查找用户所在的战队
    const team = teams.find(t => t.memberIds.includes(userId));
    if (!team) {
      return { success: false, message: '您尚未加入任何战队' };
    }
    
    // 从战队成员中移除用户
    const memberIndex = team.memberIds.indexOf(userId);
    if (memberIndex === -1) {
      return { success: false, message: '您不是该战队的成员' };
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
    
    return { success: true, teamDeleted };
  },

  // 获取用户所在的战队信息
  getUserTeam(userId) {
    const teams = this.getAllTeams();
    return teams.find(team => team.memberIds.includes(userId)) || null;
  },

  // 获取战队成员列表
  getTeamMembers(teamId) {
    const teams = this.getAllTeams();
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      return [];
    }
    
    // 需要用户数据，这里只返回成员ID列表
    return team.memberIds;
  },

  // 根据ID获取战队信息
  getTeamById(teamId) {
    const teams = this.getAllTeams();
    return teams.find(t => t.id === teamId) || null;
  },

  // 根据名称搜索战队
  searchTeams(query) {
    const teams = this.getAllTeams();
    const lowerQuery = query.toLowerCase();
    
    return teams.filter(team => 
      team.name.toLowerCase().includes(lowerQuery) ||
      team.displayName.toLowerCase().includes(lowerQuery)
    );
  },

  // 解散战队（仅创建者可以解散）
  disbandTeam(teamId, userId) {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) {
      return { success: false, message: '战队不存在' };
    }
    
    const team = teams[teamIndex];
    
    // 检查权限：只有创建者可以解散战队
    if (team.creatorId !== userId) {
      return { success: false, message: '只有战队创建者可以解散战队' };
    }
    
    // 删除战队
    teams.splice(teamIndex, 1);
    
    if (this.saveAllTeams(teams)) {
      return { success: true };
    } else {
      return { success: false, message: '解散战队失败' };
    }
  },

  // 获取热门战队（按成员数量排序）
  getPopularTeams(limit = 10) {
    const teams = this.getAllTeams();
    
    return teams
      .sort((a, b) => b.memberIds.length - a.memberIds.length)
      .slice(0, limit)
      .map(team => ({
        ...team,
        memberCount: team.memberIds.length
      }));
  },

  // 检查用户是否在战队中
  isUserInTeam(userId, teamId) {
    const team = this.getTeamById(teamId);
    if (!team) {
      return false;
    }
    
    return team.memberIds.includes(userId);
  }
};

// 导出默认实例
export default teamService;