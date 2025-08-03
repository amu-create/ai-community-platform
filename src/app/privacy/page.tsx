import { generateSEO } from '@/lib/seo/config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  ...generateSEO({
    title: '개인정보처리방침',
    description: 'AI Community Platform의 개인정보처리방침입니다.',
  }),
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">개인정보처리방침</h1>
      
      <div className="prose prose-lg max-w-none space-y-6 text-gray-600 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            AI Community Platform은 다음과 같은 목적으로 개인정보를 수집하고 이용합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>회원 가입 및 관리</li>
            <li>서비스 제공 및 맞춤형 콘텐츠 추천</li>
            <li>서비스 개선 및 신규 서비스 개발</li>
            <li>법령 및 서비스 이용약관 위반 행위 제재</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. 수집하는 개인정보 항목</h2>
          <h3 className="text-xl font-semibold mb-2">필수 항목</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>이메일 주소</li>
            <li>닉네임</li>
            <li>프로필 정보 (선택사항)</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-4">자동 수집 항목</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>서비스 이용 기록</li>
            <li>접속 로그</li>
            <li>쿠키</li>
            <li>접속 IP 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            회원의 개인정보는 서비스 이용계약 체결(회원가입)부터 계약 해지(회원탈퇴)까지 보유 및 이용됩니다.
            단, 관계 법령의 규정에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다. 
            다만, 다음의 경우는 예외로 합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>회원이 사전에 동의한 경우</li>
            <li>법령의 규정에 의한 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. 개인정보의 안전성 확보 조치</h2>
          <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취합니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>개인정보의 암호화</li>
            <li>해킹 등에 대비한 기술적 대책</li>
            <li>개인정보 접근 권한 제한</li>
            <li>정기적인 보안 점검</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. 회원의 권리</h2>
          <p>회원은 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정 요구</li>
            <li>개인정보 삭제 요구</li>
            <li>개인정보 처리 정지 요구</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. 쿠키의 사용</h2>
          <p>
            서비스는 개인화되고 맞춤화된 서비스를 제공하기 위해 쿠키를 사용합니다.
            회원은 브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. 개인정보보호 책임자</h2>
          <p>
            개인정보 관련 문의사항이 있으시면 아래로 연락주시기 바랍니다:
          </p>
          <p>
            이메일: privacy@aicommunity.com
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
