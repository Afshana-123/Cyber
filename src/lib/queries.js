import { supabase } from './supabase';

// ─── Dashboard Aggregates ───
export async function getDashboardStats() {
  const [
    { data: projects },
    { data: schemes },
    { data: transactions },
    { data: alerts },
    { data: districts },
  ] = await Promise.all([
    supabase.from('projects').select('id, contract_value_cr, risk_score, status'),
    supabase.from('schemes').select('id, allocated_crore, missing_crore, risk_score, status'),
    supabase.from('transactions').select('id, amount_cr, event_type'),
    supabase.from('alerts').select('id, risk_score, status'),
    supabase.from('districts').select('id, risk_score, status'),
  ]);

  const totalFundsCr = (schemes || []).reduce((sum, s) => sum + Number(s.allocated_crore || 0), 0);
  const totalProjectValue = (projects || []).reduce((sum, p) => sum + Number(p.contract_value_cr || 0), 0);
  const activeProjects = (projects || []).filter(p => p.status !== 'completed').length;
  const flaggedProjects = (projects || []).filter(p => p.status === 'flagged').length;
  const flaggedDistricts = (districts || []).filter(d => d.status === 'flagged').length;
  const openAlerts = (alerts || []).filter(a => a.status !== 'resolved').length;
  const avgRisk = (projects || []).length
    ? Math.round((projects || []).reduce((sum, p) => sum + (p.risk_score || 0), 0) / projects.length)
    : 0;

  return {
    totalFundsCr,
    totalProjectValue,
    activeProjects,
    totalProjects: (projects || []).length,
    totalSchemes: (schemes || []).length,
    flaggedProjects,
    flaggedDistricts,
    openAlerts,
    avgRisk,
    totalTransactions: (transactions || []).length,
  };
}

// ─── Projects ───
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, districts(name, state)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, districts(name, state)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ─── Schemes ───
export async function getSchemes() {
  const { data, error } = await supabase
    .from('schemes')
    .select('*, districts(name, state)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── Transactions ───
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, districts(name, state)')
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── Alerts ───
export async function getAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, districts(name, state)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── Beneficiaries ───
export async function getBeneficiaries() {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*, schemes(name), districts(name, state)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── Districts ───
export async function getDistricts() {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('risk_score', { ascending: false });
  if (error) throw error;
  return data || [];
}
