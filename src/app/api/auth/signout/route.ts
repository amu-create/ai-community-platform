import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createServerClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
