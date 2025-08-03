'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, MessageCircle, Heart, UserPlus, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'comment' | 'like' | 'follow' | 'achievement'
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: any
}

const notificationIcons = {
  comment: MessageCircle,
  like: Heart,
  follow: UserPlus,
  achievement: Award,
}

const notificationColors = {
  comment: 'text-blue-500',
  like: 'text-red-500',
  follow: 'text-green-500',
  achievement: 'text-yellow-500',
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'comment',
        title: '새로운 댓글',
        message: '김개발님이 당신의 게시물에 댓글을 남겼습니다.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: '2',
        type: 'like',
        title: '좋아요',
        message: '이머신님이 당신의 리소스를 좋아합니다.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '3',
        type: 'follow',
        title: '새로운 팔로워',
        message: '박딥러닝님이 당신을 팔로우하기 시작했습니다.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: '4',
        type: 'achievement',
        title: '업적 달성!',
        message: '첫 번째 학습 경로를 완료했습니다!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ]
    
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-80 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">알림</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      모두 읽음
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">알림이 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification) => {
                      const Icon = notificationIcons[notification.type]
                      const colorClass = notificationColors[notification.type]
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-0.5 ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm flex items-center gap-2">
                                {notification.title}
                                {!notification.read && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    New
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: ko,
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    setIsOpen(false)
                    // Navigate to notifications page
                  }}
                >
                  모든 알림 보기
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
