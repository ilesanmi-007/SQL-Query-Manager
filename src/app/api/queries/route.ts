import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = await request.json();
    const userId = (session.user as any).id;

    const { data, error } = await supabase
      .from('queries')
      .insert([{
        name: query.name,
        sql: query.sql,
        description: query.description,
        result: query.result,
        result_image: query.resultImage,
        date: query.date,
        timestamp: query.timestamp,
        versions: JSON.stringify(query.versions || []),
        current_version: query.currentVersion || 1,
        tags: JSON.stringify(query.tags || []),
        is_favorite: query.isFavorite || false,
        user_id: userId,
        visibility: query.visibility || 'private'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get('visibility');

    let query = supabase.from('queries').select('*');

    if (visibility === 'public') {
      query = query.eq('visibility', 'public');
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
