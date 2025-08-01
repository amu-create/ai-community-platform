import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { Toaster } from '@/components/ui/toaster';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
