
import { loadHeader } from 'header.js';
import { qs, showError } from 'domUtils.js';
import { loginUser } from 'api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();

  const form = qs('.form');
  const identifierInput = qs('input[name="identifier"]', form);
  const passwordInput   = qs('input[name="password"]', form);
  const submitBtn       = qs('button[type="submit"]', form);

  form.addEventListener('submit', async e => {
    e.preventDefault();

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

      if (user.role === 'fan') {
        window.location.href = 'fan-home.html';
      } else if (user.role === 'artist') {
        window.location.href = 'artist-home.html';
      } else {
        throw new Error('Rol desconocido');
      }
    } catch (err) {
      showError(passwordInput, err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar Sesión';
    }
  });
});
