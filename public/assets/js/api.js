const API_URL = "http://localhost:3000/api/v1";

async function authFetch(path, opts = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    ...opts.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || res.statusText);
  return data;
}


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

export function getArtist(id) {
  return authFetch(`/artists/${id}`, { method: 'GET' });
}

export function getArtistPosts(id, { freeOnly = false, limit = 20 } = {}) {
  const qs = new URLSearchParams();
  if (freeOnly) qs.set('freeOnly', 'true');
  if (limit)    qs.set('limit', limit);
  return authFetch(`/artists/${id}/posts?${qs}`, { method: 'GET' });
}
// check subscription
export function checkSubscription(artistId) {
  return authFetch(`/artists/${artistId}/check-subscription`);
}
// subscribe / unsubscribe
export function subscribe(artistId) {
  return authFetch(`/artists/${artistId}/subscribe`, { method: 'POST' });
}
export function unsubscribe(artistId) {
  return authFetch(`/artists/${artistId}/unsubscribe`, { method: 'DELETE' });
}