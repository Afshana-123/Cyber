import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// PATCH /api/fraud/[id] — Update alert status (investigate, dismiss, escalate)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['investigate', 'dismiss', 'escalate', 'resolve'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: investigate, dismiss, escalate, resolve' },
        { status: 400 }
      );
    }

    // Map actions to status values
    const statusMap = {
      investigate: 'investigating',
      dismiss: 'dismissed',
      escalate: 'escalated',
      resolve: 'resolved',
    };

    const newStatus = statusMap[action];

    // Update in Supabase using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .update({ status: newStatus })
      .eq('id', id)
      .select('*, districts(name, state)');

    if (error) {
      console.error('Supabase update error:', error.message);
    }

    return NextResponse.json({
      success: true,
      newStatus,
      alert: data?.[0] || null,
      message: `Alert ${action}d successfully`,
      persisted: !error && data?.length > 0,
    });
  } catch (err) {
    console.error('PATCH /api/fraud/[id] catch:', err.message);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// GET /api/fraud/[id] — Get single alert details
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('alerts')
      .select('*, districts(name, state)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
