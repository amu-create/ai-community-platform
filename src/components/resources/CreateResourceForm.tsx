'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createResourceSchema, type CreateResourceInput } from '@/lib/validation/schemas';
import { useValidatedForm, useRealtimeValidation } from '@/lib/validation/hooks';
import { sanitize } from '@/lib/validation/sanitize';

const categories = [
  'Documentation',
  'Tutorial',
  'Tool',
  'Library',
  'Framework',
  'Course',
  'Article',
  'Video',
  'Other',
];

export default function CreateResourceForm() {
  const router = useRouter();
  const [isUrlValid, setIsUrlValid] = useState(true);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    submitHandler,
    isSubmitting,
  } = useValidatedForm<CreateResourceInput>({
    schema: createResourceSchema,
    sanitizeFields: {
      html: ['description'],
      url: ['url'],
    },
    onSuccess: async (data) => {
      try {
        const response = await fetch('/api/resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || '리소스 생성에 실패했습니다');
        }
        
        // 성공 시 상세 페이지로 이동
        router.push(`/resources/${result.data.id}`);
      } catch (error) {
        console.error('Submit error:', error);
        alert(error instanceof Error ? error.message : '오류가 발생했습니다');
      }
    },
  });
  
  // URL 실시간 검증
  const urlValue = watch('url');
  const { isValid: urlValid } = useRealtimeValidation(
    { url: urlValue },
    createResourceSchema.pick({ url: true })
  );
  
  // 태그 관리
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const addTag = () => {
    const sanitizedTag = sanitize.text(tagInput.trim());
    if (sanitizedTag && !tags.includes(sanitizedTag) && tags.length < 10) {
      setTags([...tags, sanitizedTag]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  
  return (
    <form onSubmit={submitHandler} className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">새 리소스 등록</h1>
      
      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          제목 *
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="리소스 제목을 입력하세요"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      
      {/* URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-2">
          URL *
        </label>
        <input
          {...register('url')}
          type="url"
          id="url"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.url ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://example.com"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
        )}
        {urlValue && !errors.url && (
          <p className={`mt-1 text-sm ${urlValid ? 'text-green-600' : 'text-yellow-600'}`}>
            {urlValid ? '✓ 올바른 URL 형식입니다' : '올바른 URL을 입력해주세요'}
          </p>
        )}
      </div>
      
      {/* 카테고리 */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          카테고리 *
        </label>
        <select
          {...register('category')}
          id="category"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>
      
      {/* 설명 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          설명 *
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="리소스에 대한 설명을 입력하세요"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {watch('description')?.length || 0}/1000
        </p>
      </div>
      
      {/* 태그 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          태그 (최대 10개)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="태그를 입력하고 Enter를 누르세요"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            추가
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>
      
      {/* 제출 버튼 */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '등록 중...' : '리소스 등록'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
