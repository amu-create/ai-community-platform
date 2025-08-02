import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 환경변수가 없을 때 기본값 사용 (주로 빌드 시점)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 런타임에서만 검증
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다')
}

export const supabase = createSupabaseClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// 클라이언트 컴포넌트에서 사용할 함수
export const createClient = () => supabase
