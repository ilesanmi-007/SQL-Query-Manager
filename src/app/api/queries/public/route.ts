import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('queries')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedData = data?.map(item => ({
      id: item.id,
      name: item.name,
      sql: item.sql,
      description: item.description,
      result: item.result,
      resultImage: item.result_image,
      date: item.date,
      timestamp: item.timestamp,
      lastEdited: item.last_edited,
      versions: item.versions ? JSON.parse(item.versions) : [],
      currentVersion: item.current_version,
      tags: item.tags ? JSON.parse(item.tags) : [],
      isFavorite: item.is_favorite,
      userId: item.user_id,
      visibility: item.visibility || 'private'
    })) || [];

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Failed to fetch public queries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
