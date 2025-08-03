'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 py-24 sm:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 1463 360"
        >
          <path
            className="fill-white/5"
            d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.849-472.086z"
          />
          <path
            className="fill-white/10"
            d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
          />
        </svg>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            지금 바로 AI 학습을 시작하세요
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90"
          >
            무료로 가입하고 1,000개 이상의 AI 학습 리소스에 접근하세요. 
            전문가 멘토링과 커뮤니티 지원으로 더 빠르게 성장할 수 있습니다.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6"
          >
            <a
              href="/auth"
              className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-xl hover:scale-105"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105"
            >
              더 알아보기
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <p className="text-sm font-semibold text-white/70">
              500명 이상의 개발자가 함께하고 있습니다
            </p>
            <div className="mt-4 flex justify-center">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 ring-2 ring-white"
                  />
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-medium text-purple-600 ring-2 ring-white">
                  +495
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
