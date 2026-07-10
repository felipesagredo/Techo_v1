import { API_URL } from '../../../config.js';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const voluntarioService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/users`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error al obtener voluntarios');
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar voluntario');
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar voluntario');
    return res.json();
  }
};
