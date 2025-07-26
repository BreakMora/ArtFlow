import { loadHeader } from './header.js';
import { qs, showError } from './domUtils.js';
import { loginUser } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();

console.log('Cargando ---------------------------------');

  const form = qs('.form');
  const identifierInput = qs('input[name="identifier"]', form);
  const passwordInput   = qs('input[name="password"]', form);
  const submitBtn       = qs('button[type="submit"]', form);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('Cargando ---------------------------------2');

    form.querySelectorAll('.error-message').forEach(n => n.remove());

    const identifier = identifierInput.value.trim();
    const password   = passwordInput.value;

    let hasError = false;
    if (!identifier) {
      showError(identifierInput, 'Ingresa usuario');
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
      const { user, token } = await loginUser({ identifier, password });
      localStorage.setItem('authToken', token);
      localStorage.setItem('activeUser', JSON.stringify(user));
      console.log('Cargando ---------------------------------3');

      if (user.role === 'fan') {
        window.location.href = 'fan-home.html';
      } else if (user.role === 'artista') {
        window.location.href = 'artist-home.html';
      } else {
        throw new Error('Rol desconocido');
      }
      console.log('Cargando ---------------------------------4');
      console.log('Cargando ---------------------------------user', user.role);
    } catch (err) {
      showError(passwordInput, err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar Sesión';
    }
  });
});
