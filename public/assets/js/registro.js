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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!formData.firstName) {
      errors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName) {
      errors.lastName = 'El apellido es requerido';
    }

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
      errors.password = 'Debe tener al menos 8 caracteres, una mayúscula y un número';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.gender) {
      errors.gender = 'Selecciona un género';
    }

    if (!formData.birthDate) {
      errors.birthDate = 'La fecha de nacimiento es requerida';
    }

    if (!formData.rol) {
      errors.rol = 'Selecciona un rol';
    }

    return errors;
  };

  const showErrors = (errors) => {
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    Object.keys(errors).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (error) {
      console.error('Error al registrar:', error);
      throw error;
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      firstName: form.querySelector('input[name="nombre"]').value.trim(),
      lastName: form.querySelector('input[name="apellido"]').value.trim(),
      username: form.querySelector('input[name="usuario"]').value.trim(),
      email: form.querySelector('input[name="correo"]').value.trim(),
      password: form.querySelector('input[name="contrasena"]').value,
      confirmPassword: form.querySelector('input[name="repetirContrasena"]').value,
      gender: form.querySelector('select[name="genero"]').value,
      birthDate: form.querySelector('input[name="fechaNacimiento"]').value,
      status: 'active',
      rol: form.querySelector('select[name="rol"]').value
    };

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
      const { user, token } = await registerUser(formData);

      localStorage.setItem('authToken', token);
      window.location.href = 'dashboard.html';

    } catch (error) {
      const errorContainer = document.createElement('div');
      errorContainer.className = 'error-message';
      errorContainer.textContent = error.message || 'Error al registrar. Intenta nuevamente.';
      errorContainer.style.color = 'red';
      errorContainer.style.margin = '10px 0';
      errorContainer.style.textAlign = 'center';

      form.insertBefore(errorContainer, submitBtn);

      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      submitBtn.style.opacity = '1';
    }
  });

  const circleImages = document.querySelectorAll('.circle-img');
  circleImages.forEach(img => {
    img.addEventListener('mouseenter', () => {
      img.style.transform = 'scale(1.05)';
      img.style.transition = 'transform 0.3s ease';
    });

    img.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
    });
  });
});
