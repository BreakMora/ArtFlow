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
/*
export async function crearPublicacion(data) {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/publications/create`, {
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
*/

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

  // Si falla, mostramos todo el body de error
  if (!res.ok) {
    const text = await res.text();
    console.error('Error completo del servidor:', text);
    let errData;
    try { errData = JSON.parse(text) } catch(e) { errData = { message: text } }
    throw new Error(errData.message || 'Error al crear la publicación');
  }

  return res.json();
}


export async function getFeed(/* token? */) {
  try {
    const res = await fetch(`${API_URL}/publications/feed` /*, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    }*/);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener feed');
    return data;  // { status:'success', data:{ publications: [...] } }
  } catch (err) {
    console.error('Error en getFeed:', err);
    throw err;
  }
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

/**
 * Obtiene el feed de publicaciones.

export async function getFeed(/* token ) {
  try {
    // ✔️ Para pruebas, llamamos sin enviar token:
    const res = await fetch(`${API_URL}/publications/feed`);
    
    // 🔒 Cuando integremos autenticación, descomenta estas líneas:
    /*
    const res = await fetch(`${API_URL}/publications/feed`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error obteniendo feed');
    return data; // { status: 'success', data: { publications, pagination } }
  } catch (err) {
    console.error('Error en getFeed:', err);
    throw err;
  }
}
// Obtener publicaciones del feed del usuario autenticado
/*export async function getFeed(token) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/publications/feed', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error al obtener feed:', error);
      throw new Error(error.message || 'Error desconocido al obtener feed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getFeed:', error);
    throw error;
  }
}

// Obtener las suscripciones del usuario (por ejemplo, artistas a los que sigue)
export async function getSubscriptions(token) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/subscriptions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error al obtener suscripciones:', error);
      throw new Error(error.message || 'Error al obtener suscripciones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getSubscriptions:', error);
    throw error;
  }
}

// Obtener recomendaciones (artistas, publicaciones, o categorías recomendadas)
export async function getRecommendations(token) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/recommendations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error al obtener recomendaciones:', error);
      throw new Error(error.message || 'Error al obtener recomendaciones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getRecommendations:', error);
    throw error;
  }
}*/
