'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import { Bell, Heart, MessageCircle, UserPlus, Award, FileText } from 'lucide-react'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'badge' | 'resource'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
  sender?: {
    id: string
    username: string
    avatar_url?: string
  }
}

export function RealtimeNotifications() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return

    // 실시간 알림 구독
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const notification = payload.new as any
          
          // 발신자 정보 가져오기
          let senderInfo = null
          if (notification.sender_id) {
            const { data } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', notification.sender_id)
              .single()
            senderInfo = data
          }

          const enrichedNotification: Notification = {
            ...notification,
            sender: senderInfo
          }

          // 토스트 알림 표시
          showNotificationToast(enrichedNotification)
          
          // 알림 목록에 추가
          setNotifications(prev => [enrichedNotification, ...prev])
        }
      )
      .subscribe()

    // 실시간 사용자 활동 상태
    const presenceChannel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        console.log('온라인 사용자:', state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('사용자 접속:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('사용자 퇴장:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          })
        }
      })

    // 컴포넌트 언마운트 시 정리
    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(presenceChannel)
    }
  }, [user])

  const showNotificationToast = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type)
    
    toast(
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {notification.title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {notification.message}
          </p>
          {notification.sender && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              by {notification.sender.username}
            </p>
          )}
        </div>
      </div>,
      {
        duration: 5000,
        action: notification.link ? {
          label: '보기',
          onClick: () => window.location.href = notification.link!
        } : undefined,
      }
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />
      case 'mention':
        return <Bell className="h-5 w-5 text-purple-500" />
      case 'badge':
        return <Award className="h-5 w-5 text-yellow-500" />
      case 'resource':
        return <FileText className="h-5 w-5 text-indigo-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return null // 이 컴포넌트는 UI를 렌더링하지 않고 백그라운드에서 동작
}
