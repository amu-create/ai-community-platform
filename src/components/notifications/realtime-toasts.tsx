'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
}

export function RealtimeToasts() {
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'notification' }, (payload) => {
        const notification = payload.payload as ToastNotification
        
        toast({
          title: notification.title,
          description: notification.message,
        })
      })
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, toast])

  return null
}

export function ToastNotification({ notification }: { notification: ToastNotification }) {
  const Icon = toastIcons[notification.type]
  const colorClass = toastColors[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {notification.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
