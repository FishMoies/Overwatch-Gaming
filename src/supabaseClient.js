import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dxygwuxghdjitfplkhhy.supabase.co'
const supabaseKey = 'sb_publishable_sYzxeByy-AEdgm-HpGnXhA_Qgz7_MJN'

export const supabase = createClient(supabaseUrl, supabaseKey)