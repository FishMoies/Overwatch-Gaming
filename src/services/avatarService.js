import { supabase } from '../supabaseClient'
import userService from './user'

// 上传头像
export const uploadAvatar = async (file, uid) => {
  try {
    const filePath = `${uid}/avatar.png`

    //上传到 Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true // 覆盖旧头像
      })

    if (uploadError) {
      throw uploadError
    }

    //获取 public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const publicUrl = data.publicUrl

    //更新数据库
    const { error: dbError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', uid)

    if (dbError) {
      throw dbError
    }

    //更新本地 userService
    userService.updateUser(uid, {
      avatar: publicUrl
    })

    return { success: true, url: publicUrl }

  } catch (error) {
    console.error('上传头像失败:', error)
    return { success: false, error }
  }
}