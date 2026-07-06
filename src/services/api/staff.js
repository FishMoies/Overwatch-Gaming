/**
 * 站务管理 API 模块
 */
import { request } from './core.js'

export const staffApi = {
  /**
   * 获取站务展示数据（公开）
   */
  getStaff() {
    return request('/staff')
  },

  /**
   * 获取所有 SID 岗位定义（公开）
   */
  getPositions() {
    return request('/staff/positions')
  },

  /**
   * 获取所有任命记录（管理员）
   */
  getAdminData() {
    return request('/staff/admin', { auth: true })
  },

  /**
   * 新增任命（管理员）
   */
  createAssignment(data) {
    return request('/staff', {
      method: 'POST',
      body: data,
      auth: true
    })
  },

  /**
   * 更新任命（管理员）
   */
  updateAssignment(id, data) {
    return request(`/staff/${id}`, {
      method: 'PUT',
      body: data,
      auth: true
    })
  },

  /**
   * 删除任命（管理员）
   */
  deleteAssignment(id) {
    return request(`/staff/${id}`, {
      method: 'DELETE',
      auth: true
    })
  },

  /**
   * 批量更新排序（管理员）
   */
  reorder(items) {
    return request('/staff/reorder', {
      method: 'PUT',
      body: { items },
      auth: true
    })
  }
}