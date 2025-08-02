// public/assets/js/auth.js
export function getToken() {
  return localStorage.getItem('authToken');
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function requireAuth(redirectTo = 'login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    throw new Error('No autenticado');
  }
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('activeUser');
  window.location.href = 'login.html';
}
