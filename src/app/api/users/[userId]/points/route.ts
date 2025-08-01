import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createClient();
    const { userId } = params;

    // 사용자 포인트 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_points, current_level, level_progress')
      .eq('id', userId)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 현재 레벨 정의 가져오기
    const { data: levelDefinition } = await supabase
      .from('level_definitions')
      .select('*')
      .eq('level', profile.current_level)
      .single();

    // 다음 레벨 정의 가져오기
    const { data: nextLevelDefinition } = await supabase
      .from('level_definitions')
      .select('*')
      .eq('level', profile.current_level + 1)
      .single();

    return NextResponse.json({
      total_points: profile.total_points,
      current_level: profile.current_level,
      level_progress: profile.level_progress,
      level_definition: levelDefinition,
      next_level_definition: nextLevelDefinition
    });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}