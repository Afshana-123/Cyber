/**
 * TRACE Web — API Client
 * Centralized fetch wrapper for the Express backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch(path, options = {}) {
  try {
    const resp = await fetch(`${API_BASE}${path}`, {
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
  return apiFetch('/api/alerts');
}

export async function fetchProjects(districtId) {
  const qs = districtId ? `?district_id=${districtId}` : '';
  return apiFetch(`/api/projects${qs}`);
}

export async function fetchContract(id) {
  return apiFetch(`/api/contract/${id}`);
}

export async function fetchSchemes(districtId) {
  return apiFetch(`/api/schemes/${districtId}`);
}

export async function fetchRiskScore(id, type = 'project') {
  return apiFetch(`/api/risk-score/${id}?type=${type}`);
}

export async function fetchPayments(contractId) {
  return apiFetch(`/api/payments/${contractId}`);
}

export async function fetchInspections() {
  return apiFetch('/api/inspections');
}

// ─── Helpers ─────────────────────────────────────────────────

export function formatCurrency(amount) {
  if (amount >= 10000000000) {
    return `₹${(amount / 10000000000).toFixed(0)} Cr`;
  } else if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatLargeCurrency(amount) {
  if (amount >= 10000000000000) {
    return `₹${(amount / 10000000000000).toFixed(0)} L Cr`;
  } else if (amount >= 1000000000000) {
    return `₹${(amount / 10000000000).toLocaleString('en-IN')} Cr`;
  } else if (amount >= 10000000000) {
    return `₹${(amount / 10000000000).toFixed(0)} Cr`;
  }
  return formatCurrency(amount);
}
