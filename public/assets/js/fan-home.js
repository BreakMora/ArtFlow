document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/v1/user/recommended-artists';
  const carouselContainer = document.querySelector('.carousel');

  async function fetchRecommendedArtists() {
    try {
      const res = await fetch(API_URL, {
        credentials: 'include' // Necesario si usas sesión con cookies
      });

      const result = await res.json();

      if (res.status !== 200 || result.status !== 'success') {
        console.warn('No se pudieron cargar artistas:', result.message);
        return;
      }

      const artists = result.data.artists;

      // Limpiar contenido anterior
      carouselContainer.innerHTML = '';

      if (artists.length === 0) {
        carouselContainer.innerHTML = '<p>No hay artistas recomendados.</p>';
        return;
      }

      artists.forEach(artist => {
        const artistBubble = document.createElement('div');
        artistBubble.className = 'artist-bubble';
        artistBubble.innerHTML = `
          <a href="perfil-artista.html?artistId=${artist._id}">
            ${artist.firstName || ''} ${artist.lastName || ''} (@${artist.username})
          </a>
        `;
        carouselContainer.appendChild(artistBubble);
      });
    } catch (error) {
      console.error('Error al obtener artistas recomendados:', error);
    }
  }

  fetchRecommendedArtists();
});
