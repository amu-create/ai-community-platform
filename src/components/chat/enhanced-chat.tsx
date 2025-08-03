'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Smile, MoreVertical, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  isMe: boolean
}

interface ChatRoom {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  avatar: string
  isOnline: boolean
}

const mockRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'AI 학습 일반',
    lastMessage: '다음 주에 새로운 과정이 시작됩니다!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 3,
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=general',
    isOnline: true,
  },
  {
    id: '2',
    name: 'PyTorch 스터디',
    lastMessage: '오늘 실습 코드 공유합니다',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=pytorch',
    isOnline: true,
  },
  {
    id: '3',
    name: '김개발',
    lastMessage: '내일 시간 괜찮으신가요?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    isOnline: false,
  },
]

const mockMessages: Message[] = [
  {
    id: '1',
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    content: '안녕하세요! PyTorch 관련 질문이 있습니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isMe: false,
  },
  {
    id: '2',
    userId: 'me',
    userName: '나',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: '네, 무엇을 도와드릴까요?',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    isMe: true,
  },
  {
    id: '3',
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    content: 'Transformer 모델 구현 중에 attention mask 부분이 이해가 안 가네요.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isMe: false,
  },
]

export function EnhancedChat() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom>(mockRooms[0])
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      userId: 'me',
      userName: '나',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
      content: newMessage,
      timestamp: new Date(),
      isMe: true,
    }

    setMessages([...messages, message])
    setNewMessage('')

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Simulate response
      const response: Message = {
        id: (Date.now() + 1).toString(),
        userId: '1',
        userName: '김개발',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
        content: '좋은 질문이네요! Attention mask는...',
        timestamp: new Date(),
        isMe: false,
      }
      setMessages(prev => [...prev, response])
    }, 2000)
  }

  return (
    <div className="flex h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Sidebar - Room List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700">
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="대화 검색..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Room List */}
        <ScrollArea className="h-[calc(600px-73px)]">
          <div className="p-2">
            {mockRooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                onClick={() => setSelectedRoom(room)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRoom.id === room.id
                    ? 'bg-purple-50 dark:bg-purple-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={room.avatar} alt={room.name} />
                    <AvatarFallback>{room.name[0]}</AvatarFallback>
                  </Avatar>
                  {room.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{room.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(room.lastMessageTime, {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-purple-600 text-xs text-white">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedRoom.avatar} alt={selectedRoom.name} />
              <AvatarFallback>{selectedRoom.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedRoom.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedRoom.isOnline ? '온라인' : '오프라인'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-3 max-w-[70%] ${
                      message.isMe ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.userAvatar} alt={message.userName} />
                      <AvatarFallback>{message.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.isMe
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p
                        className={`text-xs text-muted-foreground mt-1 ${
                          message.isMe ? 'text-right' : ''
                        }`}
                      >
                        {formatDistanceToNow(message.timestamp, {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                </div>
                <span>입력 중...</span>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex items-center gap-2"
          >
            <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="icon">
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
