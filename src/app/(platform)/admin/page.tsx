import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import AdminDashboard from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | AI Community Platform',
  description: 'Admin dashboard for managing the AI Community Platform',
};

export default async function AdminPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/');
  }
  
  return <AdminDashboard userRole={profile.role} />;
}
