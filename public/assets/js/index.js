const ContentManager = (() => {
    // URL base de la API
    const API_BASE_URL = 'http://localhost:3000/api/v1';

    // Cache para almacenar los datos temporalmente
    let cache = {
        textContent: null,
        imagesContent: null
    };

    // Métodos privados
    const fetchData = async (endpoint) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            // Datos de respaldo por si falla la API
            if (endpoint === '/main/text-content') {
                return {
                    status: 'success',
                    data: [
                        { key: 'hero_title', value: 'Tu podrías ser el próximo Paulo Coelho' },
                        { key: 'hero_subtitle', value: 'No necesitas ser un genio para ser un gran artista' }
                    ]
                };
            }
            return null;
        }
    };

    const updateTextContent = () => {
        if (!cache.textContent) return;

        cache.textContent.forEach(item => {
            const element = document.getElementById(item.key);
            if (element) {
                element.textContent = item.value;
            }
        });
    };

    const updateImagesContent = () => {
        const imagesContainer = document.getElementById('hero_images');
        if (!imagesContainer) return;

        // Si no hay imágenes en cache, usa imágenes de placeholder
        if (!cache.imagesContent || cache.imagesContent.length === 0) {
            cache.imagesContent = [
                { url: 'https://via.placeholder.com/600x400?text=Arte+1', altText: 'Obra de arte 1' },
                { url: 'https://via.placeholder.com/600x400?text=Arte+2', altText: 'Obra de arte 2' },
                { url: 'https://via.placeholder.com/600x400?text=Arte+3', altText: 'Obra de arte 3' },
                { url: 'https://via.placeholder.com/600x400?text=Arte+4', altText: 'Obra de arte 4' }
            ];
        }

        imagesContainer.innerHTML = '';

        cache.imagesContent.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image.url;
            imgElement.alt = image.altText;
            imgElement.classList.add('hero-image');

            imgElement.onerror = () => {
                console.error('Error al cargar imagen:', image.url);
                imgElement.src = 'https://via.placeholder.com/600x400?text=Error+Cargando+Imagen';
            };

            imagesContainer.appendChild(imgElement);
        });
    };

    // Métodos públicos
    return {
        async init() {
            try {
                // Obtener datos de texto
                const textResponse = await fetchData('/main/text-content');
                if (textResponse && textResponse.status === 'success') {
                    cache.textContent = textResponse.data;
                    updateTextContent();
                }

                // Obtener datos de imágenes
                const imagesResponse = await fetchData('/main/images-content');
                if (imagesResponse && imagesResponse.status === 'success') {
                    cache.imagesContent = imagesResponse.data;
                }
                
                updateImagesContent();

            } catch (error) {
                console.error('Error initializing ContentManager:', error);
                // Intenta cargar con datos de respaldo
                updateTextContent();
                updateImagesContent();
            }
        },

        getTextContent() {
            return cache.textContent;
        },

        getImagesContent() {
            return cache.imagesContent;
        },

        refresh: async function () {
            await this.init();
        }
    };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ContentManager.init();
});