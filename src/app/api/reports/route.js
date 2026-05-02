import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*, districts(name, state), projects(name)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Map status from the checklist JSONB column if the schema cache doesn't have a native status column
    const mappedData = data.map(report => ({
      ...report,
      status: report.status || (report.checklist && report.checklist.status) || 'received'
    }));
    
    return NextResponse.json(mappedData);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const validStatuses = ['received', 'under_investigation', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    // First fetch the existing checklist to merge
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('reports')
      .select('checklist')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentChecklist = current.checklist || {};
    const updatedChecklist = { ...currentChecklist, status };

    // Try to update both the native status column and the checklist fallback
    const { data, error } = await supabaseAdmin
      .from('reports')
      // Only updating checklist to bypass schema cache issues with new columns
      .update({ checklist: updatedChecklist })
      .eq('id', id)
      .select('id, checklist')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      id: data.id, 
      status: data.checklist?.status || status 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
