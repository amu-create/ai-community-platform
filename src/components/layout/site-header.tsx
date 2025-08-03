'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: '리소스', href: '/resources' },
  { name: '학습 경로', href: '/learning-paths' },
  { name: '커뮤니티', href: '/community' },
  { name: '채팅', href: '/chat' },
]

export function SiteHeader({ user }: { user?: any }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Community
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <>
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                      <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || '사용자'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">대시보드</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">프로필</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">설정</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth" className="hidden md:block">
              <Button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all duration-300 hover:scale-105">
                로그인
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="space-y-1 px-4 pb-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/auth"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
