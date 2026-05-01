import { supabase } from './supabase';

// ─── Dashboard Aggregates ───
export async function getDashboardStats() {
  const [
    { data: projects },
    { data: transactions },
    { data: flaggedTxns },
    { data: fraudAlerts },
  ] = await Promise.all([
    supabase.from('projects').select('id, budget, spent, risk_score, status'),
    supabase.from('transactions').select('id, amount'),
    supabase.from('transactions').select('id').eq('status', 'flagged'),
    supabase.from('fraud_alerts').select('id, risk_score').eq('is_resolved', false),
  ]);

  const totalFunds = projects?.reduce((sum, p) => sum + Number(p.budget), 0) || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const flaggedCount = flaggedTxns?.length || 0;
  const avgRisk = projects?.length
    ? Math.round(projects.reduce((sum, p) => sum + p.risk_score, 0) / projects.length)
    : 0;

  return { totalFunds, activeProjects, flaggedCount, avgRisk, alertCount: fraudAlerts?.length || 0 };
}

// ─── Projects ───
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ─── Transactions ───
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, projects(name)')
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data;
}

// ─── Fraud Alerts ───
export async function getFraudAlerts() {
  const { data, error } = await supabase
    .from('fraud_alerts')
    .select('*, projects(name)')
    .order('flagged_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ─── Bids ───
export async function getBidsByProject(projectId) {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('project_id', projectId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ─── Audit Logs ───
export async function getAuditLogs() {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
