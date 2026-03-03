const API_BASE = '/api';

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (res.status === 204) return null;
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
    }
    return res.json();
}

// ── Lists ────────────────────────────────────────────────────
export const fetchLists = () => request('/lists');
export const createList = (data) => request('/lists', { method: 'POST', body: JSON.stringify(data) });
export const deleteList = (id) => request(`/lists/${id}`, { method: 'DELETE' });

// ── Tasks ────────────────────────────────────────────────────
export const fetchTasks = (listId) => request(listId ? `/tasks?list=${listId}` : '/tasks');
export const createTask = (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
