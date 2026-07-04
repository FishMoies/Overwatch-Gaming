import { Router } from 'express'
import { getDb, getOne, getAll, run, getValue } from '../db.js'
import { adminMiddleware } from '../middleware/auth.js'

const router = Router()

// 确保数据库已初始化
router.use(async (req, res, next) => {
  await getDb()
  next()
})

/**
 * GET /api/staff - 公开接口：获取展示用站务数据
 * 返回格式兼容 StaffPage.vue 的 permanentStaff / rotatingStaff 结构
 */
router.get('/', async (req, res) => {
  try {
    // JOIN staff_assignments + users + staff_positions
    const rows = getAll(`
      SELECT
        sa.id,
        sa.uid,
        sa.sid,
        sa.staff_type,
        sa.term,
        sa.contact,
        sa.sort_order,
        u.username,
        u.nickname,
        u.avatar,
        sp.name AS positionName,
        sp.description AS positionDesc
      FROM staff_assignments sa
      LEFT JOIN users u ON sa.uid = u.uid
      LEFT JOIN staff_positions sp ON sa.sid = sp.sid
      ORDER BY sa.staff_type, sa.sort_order, sa.id
    `)

    const permanentStaff = []
    const rotatingStaff = []

    for (const row of rows) {
      const item = {
        id: row.id,
        uid: row.uid,
        sid: row.sid,
        username: row.username || '',
        nickname: row.nickname || null,
        displayName: row.nickname || row.username || '未知用户',
        avatar: row.avatar || '/default-avatar.png',
        title: row.positionName || '',
        positionName: row.positionName || '',
        positionDesc: row.positionDesc || '',
        description: row.positionDesc || '',
        term: row.term || '',
        contact: row.contact || '',
        sort_order: row.sort_order
      }

      if (row.staff_type === 'rotating') {
        rotatingStaff.push(item)
      } else {
        permanentStaff.push(item)
      }
    }

    res.json({
      success: true,
      permanentStaff,
      rotatingStaff
    })
  } catch (error) {
    console.error('获取站务数据失败:', error)
    res.status(500).json({ success: false, message: '获取站务数据失败' })
  }
})

/**
 * GET /api/staff/positions - 公开接口：获取所有 SID 岗位定义
 */
router.get('/positions', async (req, res) => {
  try {
    const positions = getAll('SELECT * FROM staff_positions ORDER BY sort_order')
    res.json({ success: true, positions })
  } catch (error) {
    console.error('获取岗位定义失败:', error)
    res.status(500).json({ success: false, message: '获取岗位定义失败' })
  }
})

// ==================== 以下路由需要管理员权限 ====================

/**
 * GET /api/staff/admin - 管理员：获取所有任命记录（含用户信息）
 */
router.get('/admin', adminMiddleware, async (req, res) => {
  try {
    const rows = getAll(`
      SELECT
        sa.*,
        u.username,
        u.nickname,
        u.avatar,
        sp.name AS positionName,
        sp.description AS positionDesc
      FROM staff_assignments sa
      LEFT JOIN users u ON sa.uid = u.uid
      LEFT JOIN staff_positions sp ON sa.sid = sp.sid
      ORDER BY sa.staff_type, sa.sort_order, sa.id
    `)
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('获取任命记录失败:', error)
    res.status(500).json({ success: false, message: '获取任命记录失败' })
  }
})

/**
 * POST /api/staff - 管理员：新增任命
 * Body: { uid, sid, staff_type, term?, contact? }
 */
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { uid, sid, staff_type, term, contact } = req.body

    if (!uid || !sid) {
      return res.json({ success: false, message: '缺少必要参数: uid 和 sid' })
    }

    // 验证用户是否存在
    const user = getOne('SELECT id, uid, username FROM users WHERE uid = ?', [uid])
    if (!user) {
      return res.json({ success: false, message: '用户不存在' })
    }

    // 验证 SID 是否存在
    const position = getOne('SELECT sid, name FROM staff_positions WHERE sid = ?', [sid])
    if (!position) {
      return res.json({ success: false, message: '岗位编号不存在' })
    }

    // 检查是否已经任命了该用户到同一岗位
    const existing = getOne('SELECT id FROM staff_assignments WHERE uid = ? AND sid = ?', [uid, sid])
    if (existing) {
      return res.json({ success: false, message: `用户 ${user.username} 已担任岗位 ${position.name}（${sid}）` })
    }

    const staffType = staff_type === 'rotating' ? 'rotating' : 'permanent'

    // 获取当前最大排序值
    const maxOrder = getValue('SELECT COALESCE(MAX(sort_order), -1) + 1 FROM staff_assignments WHERE staff_type = ?', [staffType])

    const result = run(
      "INSERT INTO staff_assignments (uid, sid, staff_type, term, contact, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [uid, sid, staffType, term || '', contact || '', maxOrder || 0]
    )

    res.json({
      success: true,
      message: `已任命 ${user.username} 为 ${position.name}`,
      id: result.lastInsertRowid
    })
  } catch (error) {
    console.error('新增任命失败:', error)
    res.status(500).json({ success: false, message: `新增任命失败: ${error.message}` })
  }
})

/**
 * PUT /api/staff/reorder - 管理员：批量更新排序
 * Body: { items: [{ id, sort_order }] }
 */
router.put('/reorder', adminMiddleware, async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: '无效的排序数据' })
    }

    for (const item of items) {
      if (item.id && item.sort_order !== undefined) {
        run("UPDATE staff_assignments SET sort_order = ?, updated_at = datetime('now', 'localtime') WHERE id = ?",
          [item.sort_order, item.id])
      }
    }

    res.json({ success: true, message: '排序已更新' })
  } catch (error) {
    console.error('更新排序失败:', error)
    res.status(500).json({ success: false, message: `更新排序失败: ${error.message}` })
  }
})

/**
 * PUT /api/staff/:id - 管理员：更新任命
 */
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.json({ success: false, message: '无效的任命 ID' })
    }

    const existing = getOne('SELECT * FROM staff_assignments WHERE id = ?', [id])
    if (!existing) {
      return res.json({ success: false, message: '任命记录不存在' })
    }

    const { uid, sid, staff_type, term, contact } = req.body

    const updates = []
    const params = []

    if (uid !== undefined) {
      const user = getOne('SELECT uid FROM users WHERE uid = ?', [uid])
      if (!user) return res.json({ success: false, message: '用户不存在' })
      updates.push('uid = ?')
      params.push(uid)
    }
    if (sid !== undefined) {
      const position = getOne('SELECT sid FROM staff_positions WHERE sid = ?', [sid])
      if (!position) return res.json({ success: false, message: '岗位编号不存在' })
      updates.push('sid = ?')
      params.push(sid)
    }
    if (staff_type !== undefined) {
      const staffType = staff_type === 'rotating' ? 'rotating' : 'permanent'
      updates.push('staff_type = ?')
      params.push(staffType)
    }
    if (term !== undefined) {
      updates.push('term = ?')
      params.push(term)
    }
    if (contact !== undefined) {
      updates.push('contact = ?')
      params.push(contact)
    }

    if (updates.length === 0) {
      return res.json({ success: false, message: '没有需要更新的字段' })
    }

    updates.push("updated_at = datetime('now', 'localtime')")
    params.push(id)

    run(`UPDATE staff_assignments SET ${updates.join(', ')} WHERE id = ?`, params)

    res.json({ success: true, message: '任命已更新' })
  } catch (error) {
    console.error('更新任命失败:', error)
    res.status(500).json({ success: false, message: `更新任命失败: ${error.message}` })
  }
})

/**
 * DELETE /api/staff/:id - 管理员：删除任命
 */
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.json({ success: false, message: '无效的任命 ID' })
    }

    const existing = getOne('SELECT * FROM staff_assignments WHERE id = ?', [id])
    if (!existing) {
      return res.json({ success: false, message: '任命记录不存在' })
    }

    run('DELETE FROM staff_assignments WHERE id = ?', [id])
    res.json({ success: true, message: '任命已删除' })
  } catch (error) {
    console.error('删除任命失败:', error)
    res.status(500).json({ success: false, message: `删除任命失败: ${error.message}` })
  }
})

export default router
