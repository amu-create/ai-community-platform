'use client'

import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          {/* Title animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl"
          >
            <span className="block">AI 학습의</span>
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              새로운 기준
            </span>
          </motion.h1>

          {/* Description animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl"
          >
            최신 AI 기술을 체계적으로 학습하고, 전문가들과 지식을 공유하며,
            함께 성장하는 국내 최고의 AI 학습 커뮤니티
          </motion.p>

          {/* CTA buttons animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6"
          >
            <a
              href="/auth"
              className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <span className="relative z-10">무료로 시작하기</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </a>
            <a
              href="/resources"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md hover:scale-105 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              리소스 둘러보기
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-8 sm:gap-12"
          >
            <div>
              <p className="text-3xl font-bold text-purple-600 sm:text-4xl">1,000+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">학습 리소스</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 sm:text-4xl">500+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">활성 사용자</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600 sm:text-4xl">50+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">전문가 멘토</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
