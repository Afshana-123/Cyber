import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, districts(name, state)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        name: body.name,
        district_id: body.district_id,
        contractor_name: body.contractor_name,
        contract_value_cr: Number(body.contract_value_cr) || 0,
        benchmark_low_cr: Number(body.benchmark_low_cr) || 0,
        benchmark_high_cr: Number(body.benchmark_high_cr) || 0,
        bids_received: Number(body.bids_received) || 0,
        risk_score: 0,
        status: 'clean',
        phase: 1,
      })
      .select('*, districts(name, state)')
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
