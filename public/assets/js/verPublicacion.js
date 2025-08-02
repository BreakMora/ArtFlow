// public/assets/js/ver-publicacion.js
import { getPublicationById } from './api.js';

 const token = localStorage.getItem('authToken');

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderPublication(pub) {
  const container = document.getElementById('publication-container');
  const imgUrl = pub.multimedia?.[0]?.url || 'https://via.placeholder.com/800';

  container.innerHTML = `
    <div class="publication-header">
      <img src="${imgUrl}" alt="Perfil" class="perfil-img" />
      <div class="user-info">
        <a href="perfil-artista.html?id=${pub.user_id._id}" class="artist-name">${pub.user_id.username}</a>
        <p class="fecha-publicacion">Publicado el ${new Date(pub.createdAt).toLocaleDateString()}</p>
      </div>
    </div>

    <h1 class="titulo-publicacion">${pub.title}</h1>
    <p class="categoria-publicacion">Categoría: <span>${pub.category}</span></p>

    <img src="${imgUrl}" alt="Publicación" class="imagen-publicacion" />

    <p class="descripcion-publicacion">${pub.description}</p>

    <div class="interacciones">
      <button class="btn-like">❤️ Me gusta</button>
    </div>
  `;
}

(async () => {
if (!token) {
  document.getElementById('publication-container').innerHTML =
    '<p>Debes iniciar sesión para ver esta publicación.</p>';
  return;
}

  const id = getIdFromURL();
  if (!id) {
    alert('ID de publicación no proporcionado.');
    return;
  }

  try {
    const pub = await getPublicationById(id, token);
    renderPublication(pub);
  } catch (e) {
    console.error(e);
    document.getElementById('publication-container').innerHTML =
      '<p>Error al cargar la publicación.</p>';
  }
})();
