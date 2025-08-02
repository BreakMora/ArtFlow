// public/assets/js/crearPublicacion.js
import { qs, showError } from './domUtils.js';
import { crearPublicacion } from './api.js';

// Extrae la extensión del URL y la normaliza al enum esperado
function getExtFromUrl(url) {
  const match = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return 'jpg';            // fallback
  const ext = match[1].toLowerCase();
  return ['jpg','jpeg','png','gif','mp4','avi','mp3','wav','webm'].includes(ext)
    ? ext
    : 'jpg';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = qs('#form-publicacion');
  if (!form) return;

  const titleInput       = qs('input[name="title"]', form);
  const descriptionInput = qs('textarea[name="description"]', form);
  const categoryInput    = qs('select[name="category"]', form);
  const typeInput        = qs('select[name="type"]', form);
  const multimediaInput  = qs('input[name="multimedia"]', form);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.querySelectorAll('.error-message').forEach(n => n.remove());

    const title       = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const category    = categoryInput.value;
    const type        = typeInput.value;
    const url         = multimediaInput.value.trim();

    if (!title || !description || !category || !type) {
      showError(form, 'Todos los campos son obligatorios');
      return;
    }

    const user = JSON.parse(localStorage.getItem('activeUser'));
    if (!user?._id) {
      showError(form, 'Usuario no autenticado');
      return;
    }

    const multimedia = url
      ? [{ 
          url, 
          title, 
          format: getExtFromUrl(url) 
        }]
      : [];

    const payload = {
      title,
      description,
      category,
      type,
      multimedia,
      user_id: user._id
    };

    try {
      await crearPublicacion(payload);
      alert('¡Publicación creada exitosamente!');
      form.reset();
      multimediaInput.value = '';
    } catch (err) {
      showError(form, 'Error al crear la publicación: ' + err.message);
    }
  });
});
