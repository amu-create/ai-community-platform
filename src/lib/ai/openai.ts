import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 임베딩 생성 함수
export async function createEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

// 텍스트 요약 함수
export async function summarizeContent(content: string, maxTokens: number = 150) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes AI learning content. Keep summaries concise and informative.',
        },
        {
          role: 'user',
          content: `Summarize the following content in ${maxTokens} tokens or less:\n\n${content}`,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw error;
  }
}

// 콘텐츠 분석 및 태그 생성
export async function generateContentTags(content: string, title: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that analyzes AI learning content and generates relevant tags. Return only a JSON array of 5-10 relevant tags.',
        },
        {
          role: 'user',
          content: `Generate tags for this AI learning content:\n\nTitle: ${title}\nContent: ${content.substring(0, 1000)}...`,
        },
      ],
      temperature: 0.7,
    });
    
    const result = response.choices[0].message.content || '[]';
    return JSON.parse(result) as string[];
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

// 학습 경로 추천
export async function recommendLearningPath(userProfile: any, preferences: any) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI learning advisor. Based on user profile and preferences, recommend a personalized learning path.',
        },
        {
          role: 'user',
          content: `User Profile: ${JSON.stringify(userProfile)}\nPreferences: ${JSON.stringify(preferences)}\n\nRecommend a learning path with specific resources and steps.`,
        },
      ],
      temperature: 0.8,
    });
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error recommending learning path:', error);
    throw error;
  }
}
