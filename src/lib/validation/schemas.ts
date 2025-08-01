import { z } from 'zod';

// 공통 검증 규칙
const username = z.string()
  .min(3, '사용자명은 최소 3자 이상이어야 합니다')
  .max(20, '사용자명은 최대 20자까지 가능합니다')
  .regex(/^[a-zA-Z0-9_-]+$/, '사용자명은 영문, 숫자, _, -만 사용 가능합니다');

const email = z.string()
  .email('올바른 이메일 형식이 아닙니다')
  .max(255, '이메일은 최대 255자까지 가능합니다');

const password = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(100, '비밀번호는 최대 100자까지 가능합니다')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대소문자와 숫자를 포함해야 합니다');

const url = z.string()
  .url('올바른 URL 형식이 아닙니다')
  .max(2048, 'URL은 최대 2048자까지 가능합니다');

const markdown = z.string()
  .max(50000, '내용은 최대 50,000자까지 가능합니다');

// 인증 관련 스키마
export const signUpSchema = z.object({
  username,
  email,
  password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const updateProfileSchema = z.object({
  username: username.optional(),
  bio: z.string().max(500, '자기소개는 최대 500자까지 가능합니다').optional(),
  avatar_url: url.optional().nullable(),
  website: url.optional().nullable(),
  github: z.string().max(39, 'GitHub 사용자명은 최대 39자까지 가능합니다').optional().nullable(),
  twitter: z.string().max(15, 'Twitter 사용자명은 최대 15자까지 가능합니다').optional().nullable(),
});

// 리소스 관련 스키마
export const createResourceSchema = z.object({
  title: z.string()
    .min(5, '제목은 최소 5자 이상이어야 합니다')
    .max(200, '제목은 최대 200자까지 가능합니다'),
  description: z.string()
    .min(10, '설명은 최소 10자 이상이어야 합니다')
    .max(1000, '설명은 최대 1000자까지 가능합니다'),
  url,
  category: z.string()
    .min(1, '카테고리를 선택해주세요')
    .max(50, '카테고리는 최대 50자까지 가능합니다'),
  tags: z.array(z.string().max(30, '태그는 최대 30자까지 가능합니다'))
    .max(10, '태그는 최대 10개까지 가능합니다')
    .optional(),
});

export const updateResourceSchema = createResourceSchema.partial();

// 게시물 관련 스키마
export const createPostSchema = z.object({
  title: z.string()
    .min(5, '제목은 최소 5자 이상이어야 합니다')
    .max(200, '제목은 최대 200자까지 가능합니다'),
  content: markdown.min(20, '내용은 최소 20자 이상이어야 합니다'),
  category: z.string()
    .min(1, '카테고리를 선택해주세요')
    .max(50, '카테고리는 최대 50자까지 가능합니다'),
  tags: z.array(z.string().max(30, '태그는 최대 30자까지 가능합니다'))
    .max(10, '태그는 최대 10개까지 가능합니다')
    .optional(),
  is_published: z.boolean().default(true),
});

export const updatePostSchema = createPostSchema.partial();

// 댓글 관련 스키마
export const createCommentSchema = z.object({
  content: z.string()
    .min(1, '댓글을 입력해주세요')
    .max(1000, '댓글은 최대 1000자까지 가능합니다'),
  parent_id: z.string().uuid().optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, '댓글을 입력해주세요')
    .max(1000, '댓글은 최대 1000자까지 가능합니다'),
});

// 검색 관련 스키마
export const searchSchema = z.object({
  query: z.string()
    .min(1, '검색어를 입력해주세요')
    .max(100, '검색어는 최대 100자까지 가능합니다'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sort: z.enum(['recent', 'popular', 'relevant']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// 평가 관련 스키마
export const createRatingSchema = z.object({
  rating: z.number()
    .int()
    .min(1, '평점은 1점 이상이어야 합니다')
    .max(5, '평점은 5점 이하여야 합니다'),
  review: z.string()
    .max(500, '리뷰는 최대 500자까지 가능합니다')
    .optional(),
});

// 파일 업로드 관련 스키마
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (!file) return false;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }, '지원하는 이미지 형식: JPEG, PNG, GIF, WebP'),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
}).refine((data) => {
  if (!data.file) return false;
  return data.file.size <= data.maxSize;
}, '파일 크기는 5MB 이하여야 합니다');

// API 요청 검증 스키마
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid('올바른 ID 형식이 아닙니다'),
});

// 타입 추출
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
