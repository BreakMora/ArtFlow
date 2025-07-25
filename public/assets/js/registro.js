document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  const form = document.querySelector('.form');
  const loginBtn = document.querySelector('.login-btn');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  const validateForm = (formData) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!formData.firstName) errors.firstName = 'El nombre es requerido';
    if (!formData.lastName) errors.lastName = 'El apellido es requerido';
    if (!formData.username) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 4) {
      errors.username = 'Debe tener al menos 4 caracteres';
    }

    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Correo inválido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Debe tener al menos 8 caracteres, un símbolo, una mayúscula, una minúscula y un número';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Repite la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.gender) {
      errors.gender = 'Selecciona un género';
    } else if (!['Masculino', 'Femenino', 'Otro'].includes(formData.gender)) {
      errors.gender = 'Género no válido';
    }

    if (!formData.birthDate) errors.birthDate = 'La fecha de nacimiento es requerida';
    if (!formData.role) errors.role = 'Selecciona un rol';

    return errors;
  };

  const showErrors = (errors) => {
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    Object.keys(errors).forEach(key => {
      const htmlNames = {
        firstName: 'nombre',
        lastName: 'apellido',
        username: 'usuario',
        email: 'correo',
        password: 'contrasena',
        confirmPassword: 'repetirContrasena',
        gender: 'genero',
        birthDate: 'fechaNacimiento',
        role: 'rol'
      };

      const htmlName = htmlNames[key] || key;
      const input = form.querySelector(`[name="${htmlName}"]`);

      if (input) {
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.textContent = errors[key];
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '5px';
        errorElement.style.fontSize = '0.8rem';

        input.insertAdjacentElement('afterend', errorElement);
        input.style.borderColor = 'red';

        input.addEventListener('input', () => {
          input.style.borderColor = '';
          errorElement.remove();
        }, { once: true });
      }
    });
  };

  const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Error en el registro');
    return data;
  };

  const clearForm = () => {
    const fields = ['nombre', 'apellido', 'usuario', 'correo', 'contrasena', 'repetirContrasena', 'genero', 'fechaNacimiento', 'rol'];
    fields.forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input) input.value = '';
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const formData = {
      firstName: form.querySelector('input[name="nombre"]').value.trim(),
      lastName: form.querySelector('input[name="apellido"]').value.trim(),
      username: form.querySelector('input[name="usuario"]').value.trim(),
      email: form.querySelector('input[name="correo"]').value.trim(),
      password: form.querySelector('input[name="contrasena"]').value,
      confirmPassword: form.querySelector('input[name="repetirContrasena"]').value,
      gender: form.querySelector('select[name="genero"]').value,
      birthDate: form.querySelector('input[name="fechaNacimiento"]').value,
      role: form.querySelector('select[name="rol"]').value,
      status: form.querySelector('input[name="estado"]').value
    };

    // Capitalizar género para coincidir con el enum del backend
    if (formData.gender && formData.gender !== 'otro') {
      formData.gender = formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase();
    }

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    submitBtn.style.opacity = '0.7';

    try {
      const { confirmPassword, ...userData } = formData;
      const { user, token } = await registerUser(userData);

      alert('¡Registro exitoso! Tus datos han sido guardados correctamente.');
      clearForm();
    } catch (error) {
      const message = error.message.toLowerCase();
      const fieldErrors = {};

      if (message.includes('correo')) {
        fieldErrors.email = 'El correo ya está registrado';
      } else if (message.includes('usuario')) {
        fieldErrors.username = 'El nombre de usuario ya está en uso';
      }

      if (Object.keys(fieldErrors).length > 0) {
        showErrors(fieldErrors);
      } else {
        const existingError = form.querySelector('.error-message.global');
        if (!existingError) {
          const errorContainer = document.createElement('p');
          errorContainer.className = 'error-message global';
          errorContainer.textContent = error.message || 'Error al registrar. Intenta nuevamente.';
          errorContainer.style.color = 'red';
          errorContainer.style.margin = '10px 0';
          errorContainer.style.textAlign = 'center';
          form.insertBefore(errorContainer, submitBtn);
        }
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      submitBtn.style.opacity = '1';
    }
  });
});