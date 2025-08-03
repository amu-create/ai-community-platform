'use client'

import { motion } from 'framer-motion'
import { BookOpen, Users, Code, Trophy, Zap, Shield } from 'lucide-react'

const features = [
  {
    name: '체계적인 학습 경로',
    description: '초급부터 고급까지 단계별 맞춤 커리큘럼으로 효율적인 학습이 가능합니다.',
    icon: BookOpen,
    color: 'from-purple-600 to-purple-400',
  },
  {
    name: '실시간 커뮤니티',
    description: '질문하고 답변하며 함께 성장하는 활발한 개발자 커뮤니티입니다.',
    icon: Users,
    color: 'from-blue-600 to-blue-400',
  },
  {
    name: '실습 중심 학습',
    description: '이론뿐만 아니라 실제 프로젝트를 통해 실무 능력을 키웁니다.',
    icon: Code,
    color: 'from-green-600 to-green-400',
  },
  {
    name: '성취도 시스템',
    description: '학습 진행도를 추적하고 레벨업하며 동기부여를 유지합니다.',
    icon: Trophy,
    color: 'from-yellow-600 to-yellow-400',
  },
  {
    name: 'AI 기반 추천',
    description: '개인 맞춤형 AI 추천으로 최적화된 학습 경험을 제공합니다.',
    icon: Zap,
    color: 'from-pink-600 to-pink-400',
  },
  {
    name: '검증된 콘텐츠',
    description: '전문가가 검증한 고품질 학습 자료만을 엄선하여 제공합니다.',
    icon: Shield,
    color: 'from-indigo-600 to-indigo-400',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-base font-semibold leading-7 text-purple-600 dark:text-purple-400"
          >
            더 나은 학습 경험
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            AI 학습을 위한 완벽한 플랫폼
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300"
          >
            효과적인 AI 학습을 위한 모든 기능을 한 곳에서 제공합니다
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <dt>
                  <div className={`absolute flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    {feature.name}
                  </p>
                </dt>
                <dd className="ml-16 mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
