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
    const res = await fetch(`${API_URL}/cuadrillas/${id}/miembros`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error fetching members');
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_URL}/users/available`, { headers: getAuthHeaders() });
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

  removeMember: async (data) => {
    const res = await fetch(`${API_URL}/cuadrillas/remove-member`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error removing member');
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
  },
  
  delete: async (id) => {
    const res = await fetch(`${API_URL}/cuadrillas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error deleting cuadrilla');
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/cuadrillas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error updating cuadrilla');
    return res.json();
  },

  autoAssignTools: async (id) => {
    const res = await fetch(`${API_URL}/cuadrillas/${id}/auto-assign-tools`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Error auto-assigning tools');
    }
    return res.json();
  },

  getAvailableTools: async () => {
    const res = await fetch(`${API_URL}/cuadrillas/available-tools`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error fetching available tools');
    return res.json();
  },

  assignTool: async (data) => {
    const res = await fetch(`${API_URL}/cuadrillas/assign-tool`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Error assigning tool');
    }
    return res.json();
  },

  returnTool: async (data) => {
    const res = await fetch(`${API_URL}/cuadrillas/return-tool`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Error returning tool');
    }
    return res.json();
  }
};
