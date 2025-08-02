'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Users, 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  Bookmark,
  GraduationCap,
  Shield,
  MessageSquare,
  Trophy
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Home },
  { name: '리소스', href: '/resources', icon: BookOpen },
  { name: '학습 경로', href: '/learning-paths', icon: GraduationCap },
  { name: '북마크', href: '/bookmarks', icon: Bookmark },
  { name: '커뮤니티', href: '/community', icon: Users },
  { name: '채팅', href: '/chat', icon: MessageSquare },
  { name: '레벨', href: '/levels', icon: Trophy },
];

export function DashboardNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserRole(data.role || 'user');
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 왼쪽: 로고와 메인 네비게이션 */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                AI Community
              </Link>
            </div>
            
            {/* 데스크톱 네비게이션 */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* 관리자 메뉴 */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    pathname.startsWith('/admin')
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
                  )}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  관리자
                </Link>
              )}
            </div>
          </div>

          {/* 오른쪽: 사용자 메뉴 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <p className="text-xs text-primary">
                        {userRole === 'admin' ? 'Administrator' : 'Moderator'}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer text-primary">
                        <Shield className="mr-2 h-4 w-4" />
                        관리자 대시보드
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center sm:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            
            {/* 모바일 관리자 메뉴 */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                  pathname.startsWith('/admin')
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Shield className="mr-3 h-5 w-5" />
                  관리자
                </div>
              </Link>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
                {isAdmin && (
                  <div className="text-xs text-primary">
                    {userRole === 'admin' ? 'Administrator' : 'Moderator'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 space-y-1 px-2">
              <Link
                href="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                프로필
              </Link>
              <Link
                href="/settings"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                설정
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-primary/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  관리자 대시보드
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start px-3"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
