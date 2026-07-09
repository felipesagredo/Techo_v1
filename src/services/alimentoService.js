const API = 'http://localhost:5000/api/alimentos'

export const obtenerAlimentos = async (token) => {

  const response = await fetch(API, {

    headers: {

      Authorization: `Bearer ${token}`,

    },

  })

  return await response.json()
}

export const crearAlimento = async (

  alimento,

  token

) => {

  const response = await fetch(API, {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      Authorization: `Bearer ${token}`,

    },

    body: JSON.stringify(alimento),

  })

  return await response.json()
}

export const editarAlimento = async (

  id,

  alimento,

  token

) => {

  const response = await fetch(

    `${API}/${id}`,

    {

      method: 'PUT',

      headers: {

        'Content-Type': 'application/json',

        Authorization: `Bearer ${token}`,

      },

      body: JSON.stringify(alimento),

    }

  )

  return await response.json()
}

export const eliminarAlimento = async (

  id,

  token

) => {

  const response = await fetch(

    `${API}/${id}`,

    {

      method: 'DELETE',

      headers: {

        Authorization: `Bearer ${token}`,

      },

    }

  )

  return await response.json()
}