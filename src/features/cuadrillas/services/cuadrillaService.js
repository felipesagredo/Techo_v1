const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const cuadrillaService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/cuadrillas`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error fetching cuadrillas');
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/cuadrillas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error creating cuadrilla');
    return res.json();
  },

  getMembers: async (id) => {
    const res = await fetch(`${API_URL}/cuadrillas/${id}/miembros`);
    if (!res.ok) throw new Error('Error fetching members');
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('Error fetching users');
    return res.json();
  },

  getRoles: async () => {
    const res = await fetch(`${API_URL}/cuadrillas/roles`);
    if (!res.ok) throw new Error('Error fetching roles');
    return res.json();
  },

  addMember: async (data) => {
    const res = await fetch(`${API_URL}/cuadrillas/add-member`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Error adding member');
    }
    return res.json();
  },

  getAvailableCount: async () => {
    const res = await fetch(`${API_URL}/cuadrillas/available-count`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error fetching available count');
    return res.json();
  },

  autoGenerate: async (data) => {
    const res = await fetch(`${API_URL}/cuadrillas/auto-generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Error in auto-generation');
    }
    return res.json();
  }
};
