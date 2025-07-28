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

  const response = await fetch(`${API_URL}/publications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Error al crear la publicación');
  }

  return response.json();
}

/*const API_URL = "http://localhost:3000/api/v1";

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
*/