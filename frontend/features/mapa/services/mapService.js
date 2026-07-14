export async function fetchAddresses(token, API_BASE) {
  const res = await fetch(`${API_BASE}/api/addresses`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (res.status === 401 || res.status === 403) {
    const err = new Error('Sin autorización para ver las direcciones.')
    err.status = res.status
    throw err
  }

  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`)

  const data = await res.json()
  return Array.isArray(data.addresses) ? data.addresses : []
}

export async function createAddress(body, token, API_BASE) {
  const res = await fetch(`${API_BASE}/api/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Error guardando')
  }

  return res.json()
}

export async function updateAddress(id, body, token, API_BASE) {
  const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) throw new Error('No se pudo actualizar la dirección')
  return res.json()
}

export async function deleteAddress(id, token, API_BASE) {
  const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) throw new Error('No se pudo eliminar la dirección')
  return res.json()
}

export default {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress
}
