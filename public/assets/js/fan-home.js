 document.addEventListener('DOMContentLoaded', async () => {
      const feed = document.getElementById('feed');
      const carousel = document.getElementById('recomendados-carousel');
      const sidebar = document.getElementById('subs-sidebar');

      const token = localStorage.getItem('authToken');

      if (!token) {
        feed.innerHTML = '<p>Debes iniciar sesión para ver el contenido.</p>';
        return;
      }

      try {

        const fetchOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        const resFeed = await fetch('/api/v1/user/feed', fetchOptions);
        const feedData = await resFeed.json();

        if (feedData.status === 'success') {
          const pubs = feedData.data.publications;
          feed.innerHTML = pubs.length ? '' : '<p>No hay publicaciones por ahora.</p>';

          pubs.forEach(pub => {
            const artist = pub.user_id?.username || 'Artista';
            const artistId = pub.user_id?._id || '#';
            const tag = pub.category || 'Sin categoría';
            const date = new Date(pub.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            const img = pub.multimedia?.[0]?.url || 'https://picsum.photos/800/800?random=404';

            const commentsHTML = pub.comments?.map(c => `
          <p><strong>${c.user_id?.username || 'Anon'}:</strong> ${c.content}</p>
        `).join('') || '';

            const postHTML = `
          <article class="post-card" onclick="location.href='publicacion.html?id=${pub._id}'">
            <header>
              <div class="artist-info">
                <strong><a href="perfil-artista.html?id=${artistId}" onclick="event.stopPropagation()">${artist}</a></strong>
                <span class="tag">${tag}</span>
              </div>
              <span class="date">${date}</span>
            </header>
            <img src="${img}" alt="Obra de arte" />
            <footer class="stats">
              ❤ ${pub.likes || 0} &nbsp; 💬 ${pub.comments?.length || 0} &nbsp; 👁 ${pub.views || 0}
            </footer>
            ${commentsHTML ? `<div class="comments">${commentsHTML}</div>` : ''}
          </article>
        `;
            feed.insertAdjacentHTML('beforeend', postHTML);
          });
        } else {
          feed.innerHTML = `<p>${feedData.message || 'No se pudo cargar el feed.'}</p>`;
        }

        const resRecs = await fetch('/api/v1/user/recommended-artists', fetchOptions);
        const recData = await resRecs.json();

        if (recData.status === 'success') {
          const artists = recData.data.artists;
          carousel.innerHTML = artists.length
            ? artists.map(a => `<div class="artist-bubble"><a href="perfil-artista.html?id=${a._id}">${a.username}</a></div>`).join('')
            : '<p>No hay recomendaciones nuevas.</p>';
        } else {
          carousel.innerHTML = `<p>${recData.message || 'Error al cargar artistas recomendados.'}</p>`;
        }

        // Cargar suscripciones activas
        const resProfile = await fetch('/api/v1/user/profile', fetchOptions);
        const profileData = await resProfile.json();

        if (profileData.status === 'success' && profileData.data.subscriptions) {
          const subs = profileData.data.subscriptions;
          sidebar.innerHTML += subs.length
            ? subs.map(sub => `
          <div class="subscription">
            <img src="https://picsum.photos/50/50?random=${Math.random()}" alt="Perfil" class="avatar" />
            <div class="sub-info">
              <a href="perfil-artista.html?id=${sub.artist_id._id}">${sub.artist_id.username}</a>
              <p>Artista suscrito</p>
            </div>
          </div>`).join('')
            : '<p>No estás suscrito a ningún artista.</p>';
        }

      } catch (error) {
        feed.innerHTML = '<p>Error al conectar con el servidor.</p>';
        console.error('Error:', error);
      }
    });