import { getFeed, getSubscriptions } from './api.js';

async function init() {
  console.log('▶️ init arrancó');
  const feedSection = document.getElementById('feed-container');
  const subsSection = document.getElementById('subs-container');

  console.log('🔑 Intentando getFeed()…');
  try {
    const feedResp = await getFeed();
    console.log('📬 getFeed devolvió:', feedResp);
    renderFeed(feedResp.data.publications);
  } catch (err) {
    console.error('💥 init getFeed error:', err);
  }

  console.log('🔑 Intentando getSubscriptions()…');
  try {
    const subsResp = await getSubscriptions();
    console.log('📬 getSubscriptions devolvió:', subsResp);
    renderSubscriptions(subsResp.data.subscriptions);
  } catch (err) {
    console.error('💥 init getSubscriptions error:', err);
  }
}

function renderFeed(posts) {
  const container = document.getElementById('feed-container');
  container.innerHTML = posts.map(p => `
    <article class="post-card" onclick="location.href='publicacion.html?id=${p._id}'">
      <header>
        <div class="artist-info">
          <strong><a href="perfil-artista.html?id=${p.user_id._id}">${p.user_id.username}</a></strong>
          <span class="tag">${p.category}</span>
        </div>
        <span class="date">${new Date(p.createdAt).toLocaleDateString()}</span>
      </header>
      <img src="${p.multimedia[0]?.url || 'https://picsum.photos/800'}" alt="${p.title}" />
      <footer class="stats">
        ❤️ ${p.likes.length} &nbsp; 💬 — &nbsp; 👁️ ${p.views}
      </footer>
      ${ /* Si rol artista: botón editar */ '' }
      ${ /* p.user_id._id === loggedUserId ? `<button class="btn-secondary">Editar</button>` : '' */''}
    </article>
  `).join('');
}

function renderSubscriptions(subs) {
  const container = document.getElementById('subs-container');
  // ya tiene el <h3>, inyectamos solo los items:
  container.innerHTML += subs.map(s => `
    <div class="subscription" onclick="location.href='perfil-artista.html?id=${s.artist_id._id}'">
      <img src="${s.artist.avatarUrl||'https://picsum.photos/50'}" class="avatar" />
      <div class="sub-info">
        <a href="perfil-artista.html?id=${s.artist_id._id}">${s.artist_id.username}</a>
        <p>${s.newPosts} nuevas publicaciones</p>
      </div>
      <button class="btn-secondary" onclick="event.stopPropagation(); location.href='cancelar-suscripcion.html?id=${s._id}'">
        Cancelar
      </button>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', init);



/*import { loadSidebar } from './sidebar.js';
import { loadTopbar }   from './topbar.js'; // si lo tienes separado
import { getFeed }      from './api.js';

async function init() {
     console.log('▶️ init arrancó');

  // Cargamos los componentes comunes
  await loadSidebar();
  await loadTopbar();

  // 🚧 Para pruebas quitamos la validación de token:
  // const token = localStorage.getItem('token');
  // if (!token) { /* redirigir a login  }
   console.log('🔑 Intentando getFeed()…');
  try {
    const resp = await getFeed(/* token );
    console.log('📬 getFeed devolvió:', resp);
    const publicaciones = resp.data.publications;
     console.log(`🔖 renderizando ${publicaciones.length} posts`);
    renderFeed(publicaciones);
  } catch (err) {
    console.error(err.message);
     console.error('💥 init capturó error:', err);
    // mostrar en UI un mensaje de error...
  }
}

function renderFeed(posts) {
  const container = document.querySelector('.feed');
  container.innerHTML = posts.map(p => `
    <article class="post-card" onclick="location.href='publicacion.html?id=${p._id}'">
      <header>
        <div class="artist-info">
          <strong>
            <a href="perfil-artista.html?id=${p.user_id._id}">
              ${p.user_id.username}
            </a>
          </strong>
          <span class="tag">${p.category}</span>
        </div>
        <span class="date">${new Date(p.createdAt).toLocaleDateString('es-ES',{ day:'numeric', month:'short' })}</span>
      </header>
      <img src="${p.multimedia?.[0]?.url || 'https://picsum.photos/800/800?random'}" alt="${p.title}" />
      <footer class="stats">
        ❤️ ${p.likes.length} &nbsp; 💬 ${p.comments?.length||0} &nbsp; 👁️ ${p.views}
      </footer>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', init);


/*import { loadSidebar } from './sidebar.js';
import { loadTopbar } from './topbar.js';
import { getFeed, getSubscriptions } from './api.js';

async function init() {
  await loadSidebar();
  await loadTopbar();

  const user = JSON.parse(localStorage.getItem('activeUser') || '{}');
  const role = user.role;

  // Render feed
  const feedEl = document.getElementById('feed-posts');
  let data;
  if (role === 'artista') {
    data = await getFeed('/publications/my');
  } else {
    data = await getFeed('/publications/search');
  }
  feedEl.innerHTML = data.publications.map(pub =>
    `<div class="post-card" onclick="location.href='publicacion.html?id=${pub._id}'">
       <img src="${pub.multimedia[0]?.url || 'https://picsum.photos/400'}" alt="">
       <div class="info">
         <a href="perfil-artista.html?id=${pub.user_id._id}" class="artist-info">
           ${pub.user_id.username}
         </a>
         <h3>${pub.title}</h3>
         <p class="date">${new Date(pub.createdAt).toLocaleDateString('es-ES')}</p>
       </div>
       <div class="actions">
         <button onclick="event.stopPropagation(); like('${pub._id}')">❤️ ${pub.likes.length}</button>
         ${role === 'artista' ? `<button onclick="event.stopPropagation(); location.href='editar-publicacion.html?id=${pub._id}'">Editar</button>` : ''}
       </div>
     </div>`
  ).join('');

  // Render right-sidebar for fans
  if (role === 'fan') {
    const subs = await getSubscriptions();
    const right = document.getElementById('right-sidebar');
    right.innerHTML = '<h3>Suscripciones</h3>' + subs.map(s =>
      `<div class="subscription">
         <img src="${s.artist.profilePicture}" class="avatar">
         <div><a href="perfil-artista.html?id=${s.artist._id}">${s.artist.username}</a>
           <p>${s.newPosts} nuevas publicaciones</p></div>
       </div>`
    ).join('');
  }
}

init();*/