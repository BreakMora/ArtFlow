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
