const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Base fetch wrapper with auth token support
 */
async function apiFetch(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// --- Auth ---
export const register = (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });
export const login = (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const getMe = () => apiFetch('/auth/me');

// --- Invites ---
export const sendInvite = (guardianEmail) => apiFetch('/invite', { method: 'POST', body: JSON.stringify({ guardianEmail }) });
export const acceptInvite = (token) => apiFetch('/invite/accept', { method: 'POST', body: JSON.stringify({ token }) });
export const getPendingInvites = () => apiFetch('/invite/pending');

// --- Transactions ---
export const createTransaction = (body) => apiFetch('/transactions/create', { method: 'POST', body: JSON.stringify(body) });
export const getMyTransactions = () => apiFetch('/transactions/my');
export const approveTransaction = (id) => apiFetch(`/transactions/${id}/approve`, { method: 'POST' });
export const rejectTransaction = (id) => apiFetch(`/transactions/${id}/reject`, { method: 'POST' });
