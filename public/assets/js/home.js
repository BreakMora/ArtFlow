
import { getFeed } from './api.js';

let currentPage = 1;
const PAGE_SIZE = 10;
let loading = false;
let allLoaded = false;

async function loadMore() {
  if (loading || allLoaded) return;
  loading = true;
  try {
    const posts = await getFeed(currentPage, PAGE_SIZE);
   
    if (posts.length < PAGE_SIZE) allLoaded = true;
    renderFeed(posts);
    currentPage++;
  } catch (err) {
    console.error('Error cargando feed:', err);
  } finally {
    loading = false;
  }
}

function renderFeed(posts) {
  const container = document.getElementById('feed-container');
  container.innerHTML = ''; // limpia antes

  posts.forEach(p => {
    const media = Array.isArray(p.multimedia) ? p.multimedia[0] : null;
    let src = null;

    if (media && media.url) {
      const url = media.url;
      // si es enlace de Drive, extraemos el ID y armamos un "direct link"
      const m = url.match(/\/d\/([^/]+)\//);
      if (m) {
        src = `https://drive.google.com/uc?export=view&id=${m[1]}`;
      } else {
        src = url;
      }
    }

    const article = document.createElement('article');
    article.className = 'post-card';
    article.innerHTML = `
      <header>
        <div class="artist-info">
          <strong>${p.user_id.username}</strong>
          <span class="tag">${p.category}</span>
        </div>
        <span class="date">${new Date(p.createdAt).toLocaleDateString()}</span>
      </header>

      ${ src
        ? `<img src="${src}" alt="${p.title}" onerror="this.style.display='none'" />`
        : `<p class="description">${p.description}</p>`
      }

      <footer class="stats">
        ❤️ ${p.likes.length} &nbsp; 👁️ ${p.views}
      </footer>
    `;
    container.appendChild(article);
  });
}


/*function renderFeed(posts) {
  const container = document.getElementById('feed-container');
  posts.forEach(p => {
    console.log('POST multimedia:', p.multimedia); // <–– revisa aquí qué te viene

    // si hay multimedia y el primer elemento tiene url valida:
    const hasMedia = Array.isArray(p.multimedia) && p.multimedia[0] && p.multimedia[0].url;
    const mediaUrl = hasMedia ? p.multimedia[0].url : null;

    const article = document.createElement('article');
    article.className = 'post-card';
    article.innerHTML = `
      <header>
        <div class="artist-info">
          <strong>${p.user_id.username}</strong>
          <span class="tag">${p.category}</span>
        </div>
        <span class="date">${new Date(p.createdAt).toLocaleDateString()}</span>
      </header>

      ${ mediaUrl
        ? `<img src="${mediaUrl}" alt="${p.title}" onerror="this.style.display='none'" />`
        : `<p class="description">${p.description}</p>`
      }

      <footer class="stats">
        ❤️ ${p.likes.length} &nbsp; 👁️ ${p.views}
      </footer>
    `;
    container.appendChild(article);
  });
}

/*
function renderFeed(posts) {
  const container = document.getElementById('feed-container');
  posts.forEach(p => {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.innerHTML = `
      <header>
        <div class="artist-info">
          <strong>${p.user_id.username}</strong>
          <span class="tag">${p.category}</span>
        </div>
        <span class="date">${new Date(p.createdAt).toLocaleDateString()}</span>
      </header>
      ${ p.multimedia?.length
          ? `<img src="${p.multimedia[0].url}" alt="${p.title}" />`
          : `<p class="description">${p.description}</p>`
      }
      <footer class="stats">
        ❤️ ${p.likes.length} &nbsp; 👁️ ${p.views}
      </footer>
    `;
    container.appendChild(article);
  });
}*/

// disparar al llegar al final de la página
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadMore();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadMore();
});

/*import { getFeed, getSubscriptions } from './api.js';

let currentPage = 1;
const pageSize = 5;
let loading = false;
let allLoaded = false;

async function loadInitial() {
  await renderSubscriptions();
  await loadMore();
  window.addEventListener('scroll', onScroll);
}

async function loadMore() {
  if (loading || allLoaded) return;
  loading = true;
  const container = document.getElementById('feed-container');
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.textContent = 'Cargando…';
  container.appendChild(spinner);

  try {
    const posts = await getFeed(currentPage, pageSize);
    console.log('🖼️ multimedia field de cada publicación:', feedResp.data.publications.map(p => p.multimedia));

    spinner.remove();
    if (posts.length === 0) {
      allLoaded = true;
      const endMsg = document.createElement('p');
      endMsg.className = 'end-feed';
      endMsg.textContent = 'No hay más publicaciones.';
      container.appendChild(endMsg);
    } else {
      renderFeed(posts);
      currentPage++;
    }
  } catch (err) {
    spinner.textContent = 'Error al cargar.';
    console.error(err);
  } finally {
    loading = false;
  }
}

function onScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMore();
  }
}

async function renderSubscriptions() {
  try {
    const subs = await getSubscriptions();
    const container = document.getElementById('subs-container');
    subs.forEach(s => {
      const div = document.createElement('div');
      div.className = 'subscription';
      div.innerHTML = `
        <img src="${s.artist.avatarUrl || 'https://picsum.photos/50'}" class="avatar"/>
        <div class="sub-info">
          <a href="perfil-artista.html?id=${s.artist._id}">${s.artist.username}</a>
          <p>${s.newPosts} nuevas publicaciones</p>
        </div>
        <button class="btn-secondary" onclick="event.stopPropagation();location.href='cancelar-suscripcion.html?id=${s._id}'">
          Cancelar
        </button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}
function renderFeed(posts) {
  const container = document.getElementById('feed-container');
  posts.forEach(p => {
    const art = document.createElement('article');
    art.className = 'post-card';
    art.onclick = () => location.href = `publicacion.html?id=${p._id}`;
    // construimos el HTML
    art.innerHTML = `
      <header>
        <div class="artist-info">
          <strong>
            <a href="perfil-artista.html?id=${p.user_id._id}">${p.user_id.username}</a>
          </strong>
          <span class="tag">${p.category}</span>
        </div>
        <span class="date">${new Date(p.createdAt).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
      </header>
      <h3 class="post-title">${p.title}</h3>
      <p class="post-description">${p.description}</p>
      ${p.multimedia && p.multimedia.length
        ? `<img src="${p.multimedia[0].url}" alt="${p.title}" />`
        : ``
      }
      <footer class="stats">
        ❤️ ${p.likes.length} &nbsp; 💬 — &nbsp; 👁️ ${p.views}
      </footer>
    `;
    container.appendChild(art);
  });
}

document.addEventListener('DOMContentLoaded', loadInitial);*/
