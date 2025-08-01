import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import DashboardContent from './DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard | AI Community Platform',
  description: 'Your personalized learning dashboard',
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return <DashboardContent user={user} profile={profile} />;
}
