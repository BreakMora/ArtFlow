import { qs, showError } from './domUtils.js';
import { crearPublicacion } from './api.js';


console.log("crearPublicacion.js cargado");
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM listo");
const form = qs('#form-publicacion');
  if (!form) return; // No ejecutes más si el formulario no existe

  const titleInput = qs('input[name="title"]', form);
  const descriptionInput = qs('textarea[name="description"]', form);
  /* const categoryInput = qs('select[name="category"]', form);
     const typeInput = qs('select[name="type"]', form); */
  const errorContainer = qs('.error-container');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('enviando...')
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    /* const category = categoryInput.value;
       const type = typeInput.value; */

    const errorContainer = qs('#error');

    if (!title || !description /* || !category || !type */) {
      showError(form, 'Todos los campos son obligatorios');
      return;
    }

    const user = JSON.parse(localStorage.getItem('activeUser'));
    if (!user?._id) {
      showError(form, 'No se encontró el usuario autenticado');
      return;
    }

    const publicacionData = {
      title,
      description,
      /* category,
         type, */
      user_id: user._id
    };

    try {
      await crearPublicacion(publicacionData);
      alert('¡Publicación creada exitosamente!');
      form.reset();
    } catch (err) {
      showError(form, 'Error al crear la publicación: ' + err.message);
    }
  });
});
