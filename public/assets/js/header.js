// public/assets/js/header.js
export async function loadHeader() {
  const res = await fetch('/public/header.html');
  const html = await res.text();
  document.getElementById('header-placeholder').innerHTML = html;
}

  const nav = document.querySelector('.topbar nav');
  if (!nav) return;
  if (window.location.pathname.endsWith('login.html')) {
    const a = document.createElement('a');
    a.href = 'recover.html';
    a.textContent = '¿Olvidaste tu contraseña?';
    nav.append(a);
  }
  if (window.location.pathname.endsWith('registro.html')) {
    const b = document.createElement('a');
    b.href = 'login.html';
    b.textContent = 'Inicia Sesión';
    nav.append(b);
  }
