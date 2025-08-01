import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import UserManagement from './UserManagement';

export const metadata: Metadata = {
  title: 'User Management | Admin Dashboard',
  description: 'Manage users and permissions',
};

export default async function UsersPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/');
  }
  
  return <UserManagement userRole={profile.role} />;
}
