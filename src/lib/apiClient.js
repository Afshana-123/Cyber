/**
 * TRACE Web — API Client
 * Centralized fetch wrapper for Next.js API routes.
 */

async function apiFetch(path, options = {}) {
  try {
    const resp = await fetch(path, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      ...options,
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${resp.status}`);
    }
    return await resp.json();
  } catch (err) {
    console.error(`API error [${path}]:`, err.message);
    throw err;
  }
}

// ─── Endpoints ───────────────────────────────────────────────

export async function fetchDistricts() {
  return apiFetch('/api/districts');
}

export async function fetchAlerts() {
  return apiFetch('/api/fraud');
}

export async function fetchProjects(districtId) {
  const qs = districtId ? `?district_id=${districtId}` : '';
  return apiFetch(`/api/projects${qs}`);
}

export async function fetchTransactions() {
  return apiFetch('/api/transactions');
}

export async function fetchBeneficiaries() {
  return apiFetch('/api/beneficiaries');
}

export async function fetchSchemes() {
  return apiFetch('/api/schemes');
}

export async function fetchDashboard() {
  return apiFetch('/api/dashboard');
}

// ─── Helpers ─────────────────────────────────────────────────

export function formatCurrency(amount) {
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatLargeCurrency(amount) {
  const num = Number(amount);
  if (num >= 10000000000000) {
    return `₹${(num / 10000000000000).toFixed(0)} L Cr`;
  } else if (num >= 10000000000) {
    return `₹${(num / 10000000).toLocaleString('en-IN')} Cr`;
  } else if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(0)} Cr`;
  }
  return formatCurrency(num);
}
