const API_URL = "http://localhost:3000/api/v1";

export async function registerUser(userData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al registrar');
  return data;
}

// Añade esta nueva función para el login
export async function loginUser({ identifier, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Ahora:
    body: JSON.stringify({
    username: identifier, // ← ahora usa el username
  password
})

  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  return {
    user: data.user,
    token: data.token
  };
}


export async function crearPublicacion(data) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API_URL}/publications/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error completo del servidor:', text);
    let errData;
    try { errData = JSON.parse(text); }
    catch { errData = { message: text }; }
    throw new Error(errData.details || errData.message || 'Error al crear la publicación');
  }

  return res.json();
}

export async function getSubscriptions(/* token? */) {
  try {
    const res = await fetch(`${API_URL}/subscriptions` /*, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    }*/);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener suscripciones');
    return data;  // { status:'success', data:{ subscriptions: [...] } }
  } catch (err) {
    console.error('Error en getSubscriptions:', err);
    throw err;
  }
}