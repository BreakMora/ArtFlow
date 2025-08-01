
import { getArtist, getArtistPosts, checkSubscription, subscribe, unsubscribe } from './api.js';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function init() {
  // 1) Determinar el artistId (viene en ?id= o, si soy artista, del token)
  let artistId = getQueryParam('id');
  const me = JSON.parse(localStorage.getItem('activeUser') || '{}');
  if (!artistId) {
    if (me._id && me.role === 'artista') artistId = me._id;
    else return console.error('PerfilArtista: no hay id de artista en la URL ni soy artista.');
  }

  // 2) Capturar los nodos (al menos necesitamos la galería)
  const fotoEl    = document.querySelector('.foto-perfil');
  const nombreEl  = document.querySelector('.nombre-artista');
  const bioEl     = document.querySelector('.bio');
  const susWrp    = document.querySelector('.suscripcion');
  const grid      = document.querySelector('.grid-galeria');
  
  if (!grid) {
    return console.error('PerfilArtista: falta <div class="grid-galeria"> para poner las publicaciones.');
  }

  // 3) Cargar datos del artista
  try {
    const { data: { artist } } = await getArtist(artistId);
    if (fotoEl)   fotoEl.src           = artist.profilePicture || '/public/assets/img/placeholder.png';
    if (nombreEl) nombreEl.textContent = '@' + artist.username;
    if (bioEl)    bioEl.textContent    = artist.bio || '';
  } catch (err) {
    return console.error('PerfilArtista: error fetching artist', err);
  }

  // 4) Renderizar botón de suscripción (sólo para fans viendo a otro artista)
  const isOwner = me._id === artistId;
  if (susWrp && me.role === 'fan' && !isOwner) {
    try {
      const { data: { isSubscribed } } = await checkSubscription(artistId);
      const btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.textContent = isSubscribed ? 'Cancelar suscripción' : 'Suscribirse';
      btn.onclick = async () => {
        try {
          if (isSubscribed) await unsubscribe(artistId);
          else             await subscribe(artistId);
          location.reload();
        } catch(e) {
          console.error('PerfilArtista: error toggling subscription', e);
        }
      };
      susWrp.innerHTML = '';
      susWrp.append(btn);
    } catch(e) {
      console.warn('PerfilArtista: no pudimos verificar suscripción', e);
    }
  } else if (susWrp) {
    // artista no ve botón, fan dueño tampoco
    susWrp.style.display = 'none';
  }

  // 5) Cargar y renderizar posts
  try {
    const { data: { posts } } = await getArtistPosts(artistId, {
      freeOnly: me.role === 'fan' && !isOwner,
      limit: 20
    });
    grid.innerHTML = posts.map(p => `
      <a href="publicacion.html?id=${p._id}">
        <img 
          src="${p.multimedia?.[0]?.url || '/public/assets/img/placeholder.png'}" 
          alt="${p.title}" 
        />
      </a>
    `).join('');
  } catch(e) {
    console.error('PerfilArtista: error fetching posts', e);
  }
}

document.addEventListener('DOMContentLoaded', init);
