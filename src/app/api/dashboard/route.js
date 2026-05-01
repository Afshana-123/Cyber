import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [
      { data: projects },
      { data: schemes },
      { data: transactions },
      { data: alerts },
      { data: districts },
      { data: beneficiaries },
    ] = await Promise.all([
      supabase.from('projects').select('id, contract_value_cr, risk_score, status, bid_anomaly_pct'),
      supabase.from('schemes').select('id, allocated_crore, missing_crore, risk_score, status'),
      supabase.from('transactions').select('id, amount_cr, event_type'),
      supabase.from('alerts').select('id, risk_score, status'),
      supabase.from('districts').select('id, risk_score, status'),
      supabase.from('beneficiaries').select('id, is_ghost'),
    ]);

    const totalFundsCr = (schemes || []).reduce((s, i) => s + Number(i.allocated_crore || 0), 0);
    const missingCr = (schemes || []).reduce((s, i) => s + Number(i.missing_crore || 0), 0);
    const totalProjectValueCr = (projects || []).reduce((s, p) => s + Number(p.contract_value_cr || 0), 0);
    const flaggedProjects = (projects || []).filter(p => p.status === 'flagged').length;
    const flaggedDistricts = (districts || []).filter(d => d.status === 'flagged').length;
    const openAlerts = (alerts || []).filter(a => a.status !== 'resolved').length;
    const ghostBeneficiaries = (beneficiaries || []).filter(b => b.is_ghost).length;
    const avgRisk = (projects || []).length
      ? Math.round((projects || []).reduce((s, p) => s + (p.risk_score || 0), 0) / projects.length)
      : 0;

    return NextResponse.json({
      totalFundsCr,
      missingCr,
      totalProjectValueCr,
      totalProjects: (projects || []).length,
      totalSchemes: (schemes || []).length,
      totalDistricts: (districts || []).length,
      flaggedProjects,
      flaggedDistricts,
      openAlerts,
      ghostBeneficiaries,
      avgRisk,
      totalTransactions: (transactions || []).length,
      totalBeneficiaries: (beneficiaries || []).length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
