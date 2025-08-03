'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'AI Community Platform은 무료인가요?',
    answer: '네, 기본적인 모든 기능은 무료로 이용할 수 있습니다. 프리미엄 기능은 추후 추가될 예정입니다.',
  },
  {
    question: '어떤 종류의 AI 기술을 배울 수 있나요?',
    answer: '머신러닝, 딥러닝, 자연어처리, 컴퓨터 비전, 강화학습 등 AI의 모든 분야를 다룹니다. ChatGPT, Claude 같은 최신 LLM 활용법도 포함됩니다.',
  },
  {
    question: '초보자도 참여할 수 있나요?',
    answer: '물론입니다! 초급부터 고급까지 단계별 학습 경로를 제공하며, 초보자를 위한 기초 과정도 충실히 준비되어 있습니다.',
  },
  {
    question: '멘토링은 어떻게 받을 수 있나요?',
    answer: '커뮤니티에서 활동하는 전문가들에게 질문하거나, 1:1 멘토링을 신청할 수 있습니다. 많은 멘토들이 자발적으로 도움을 제공합니다.',
  },
  {
    question: '학습 인증서를 발급받을 수 있나요?',
    answer: '특정 학습 경로를 완료하면 수료증을 발급받을 수 있습니다. 이는 포트폴리오에 활용할 수 있습니다.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              자주 묻는 질문
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              궁금한 점이 있으신가요? 아래에서 답변을 찾아보세요.
            </p>
          </motion.div>

          {/* FAQ items */}
          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-6 py-4 text-left shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
                >
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-base text-gray-600 dark:text-gray-300">
              더 궁금한 점이 있으신가요?{' '}
              <a
                href="/community"
                className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                커뮤니티에서 질문하기
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
