import { generateSEO } from '@/lib/seo/config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  ...generateSEO({
    title: '이용약관',
    description: 'AI Community Platform 서비스 이용약관입니다.',
  }),
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">이용약관</h1>
      
      <div className="prose prose-lg max-w-none space-y-6 text-gray-600 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
          <p>
            본 약관은 AI Community Platform(이하 "서비스")가 제공하는 모든 서비스의 이용조건 및 
            절차에 관한 기본적인 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">제2조 (이용계약의 성립)</h2>
          <p>
            이용계약은 이용자가 본 약관에 동의하고, 서비스가 정한 가입 절차를 완료함으로써 성립됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">제3조 (서비스의 제공)</h2>
          <p>서비스는 다음과 같은 서비스를 제공합니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI 학습 콘텐츠 및 자료 제공</li>
            <li>커뮤니티 포럼 및 Q&A 서비스</li>
            <li>사용자 프로필 및 활동 관리</li>
            <li>학습 진도 추적 및 레벨 시스템</li>
            <li>기타 서비스가 제공하는 일체의 서비스</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">제4조 (회원의 의무)</h2>
          <p>회원은 다음 사항을 준수해야 합니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>타인의 정보를 도용하지 않습니다</li>
            <li>서비스의 운영을 방해하는 행위를 하지 않습니다</li>
            <li>저작권 등 타인의 권리를 침해하지 않습니다</li>
            <li>건전한 커뮤니티 문화 조성에 협력합니다</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">제5조 (개인정보보호)</h2>
          <p>
            서비스는 회원의 개인정보를 보호하기 위해 노력하며, 개인정보의 수집 및 이용에 관해서는 
            별도의 개인정보처리방침을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">제6조 (면책조항)</h2>
          <p>
            서비스는 천재지변, 시스템 장애 등 불가항력적인 사유로 인한 서비스 중단에 대해 
            책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">제7조 (약관의 변경)</h2>
          <p>
            서비스는 필요시 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 
            회원에게 통지합니다.
          </p>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm">
            시행일: 2025년 1월 1일<br />
            최종 수정일: 2025년 1월 1일
          </p>
        </div>
      </div>
    </div>
  )
}
