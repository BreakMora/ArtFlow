import { loadHeader } from './header.js';
import { qs, showError } from './domUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();

  const form = qs('.form');
  const identifierInput = qs('input[name="identifier"]', form);
  const passwordInput = qs('input[name="password"]', form);
  const submitBtn = qs('button[type="submit"]', form);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.querySelectorAll('.error-message').forEach(n => n.remove());

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    // Validación básica
    let hasError = false;
    if (!identifier) {
      showError(identifierInput, 'Ingresa usuario o correo');
      hasError = true;
    }
    if (!password) {
      showError(passwordInput, 'Ingresa la contraseña');
      hasError = true;
    }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Ingresando…';

    try {
      // Enviar credenciales al backend
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar token y datos de usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('activeUser', JSON.stringify(data.user));

      // Redirección basada en rol
      if (data.user.role === 'fan') {
        window.location.href = 'fan-home.html';
      } else if (data.user.role === 'artista') {
        window.location.href = 'perfil-artista.html';
      } else {
        throw new Error('Rol desconocido');
      }

    } catch (err) {
      showError(passwordInput, err.message || 'Credenciales inválidas');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar Sesión';
    }
  });
});