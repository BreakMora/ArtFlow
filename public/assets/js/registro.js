document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  const form = document.querySelector('.form');

  // Función para mostrar errores
  const showError = (input, message) => {
    const errorElement = document.createElement('p');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    input.insertAdjacentElement('afterend', errorElement);
    input.style.borderColor = 'red';
  };

  // Validación del formulario (solo frontend)
  const validateForm = (formData) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    // [Mantén todas tus validaciones frontend actuales...]
    // (Las mismas validaciones que ya tenías para nombre, email, contraseña, etc.)
    
    return errors;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar errores anteriores
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const formData = {
      firstName: form.nombre.value.trim(),
      lastName: form.apellido.value.trim(),
      username: form.usuario.value.trim(),
      email: form.correo.value.trim(),
      password: form.contrasena.value, // Contraseña en texto plano (se hasheará en el backend)
      gender: form.genero.value,
      birthDate: form.fechaNacimiento.value,
      role: form.rol.value,
      status: 'active'
    };

    // Validación frontend
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input) showError(input, message);
      });
      return;
    }

    // Enviar al backend (la contraseña viajará por HTTPS)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      alert('¡Registro exitoso! Serás redirigido al login.');
      setTimeout(() => window.location.href = 'login.html', 1500);
      
    } catch (error) {
      showError(form.contrasena, error.message || 'Error al registrar. Intenta nuevamente.');
    }
  });
});