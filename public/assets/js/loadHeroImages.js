// loadHeroImages.js

export async function loadHeroImages() {
  const API_URL = 'http://localhost:3000/api/v1/main/images-content';
  const container = document.getElementById('hero-images-container');

  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    if (result.status === 'success') {
      result.data.forEach(img => {
        const div = document.createElement('div');
        div.classList.add('hero-image');
        div.innerHTML = `<img src="${img.url}" alt="${img.altText}" />`;
        container.appendChild(div);
      });
    } else {
      console.error('No se pudieron cargar las imágenes');
    }
  } catch (err) {
    console.error('Error cargando imágenes:', err);
  }
}
