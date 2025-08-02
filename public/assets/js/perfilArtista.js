// public/assets/js/perfilArtista.js
import {
  getArtist,
  getArtistPosts,
  checkSubscription,
  subscribe,
  unsubscribe
} from './api.js';
 
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
 
async function init() {
  // 1) Determinar artistId
  let artistId = getQueryParam('id');
  const me = JSON.parse(localStorage.getItem('activeUser') || '{}');
  if (!artistId && me.role === 'artista') artistId = me._id;
  if (!artistId) return console.error('PerfilArtista: faltó ID de artista.');
 
  // 2) Capturar nodos
  const fotoEl    = document.getElementById('foto-perfil');
  const nombreEl  = document.getElementById('nombre-artista');
  const bioEl     = document.getElementById('bio-artista');
  const webEl     = document.getElementById('web');
  const twitterEl = document.getElementById('twitter');
  const instaEl   = document.getElementById('instagram');
  const susWrp    = document.querySelector('.suscripcion') || document.getElementById('btn-suscribirse').parentNode;
  const grid      = document.querySelector('.grid-galeria');
 
  // 3) Cargar datos básicos del artista
  try {
    const { data: { artist } } = await getArtist(artistId);
    fotoEl.src    = artist.profilePicture || 'https://picsum.photos/400/600?random=6';
    nombreEl.textContent = '@' + artist.username;
    bioEl.textContent    = artist.bio || '';
    webEl.href       = artist.socials.website  || '#';
    twitterEl.href   = artist.socials.twitter  || '#';
    instaEl.href     = artist.socials.instagram|| '#';
  } catch (e) {
    return console.error('PerfilArtista: error al cargar artista', e);
  }
 
  const isOwner = me._id === artistId;
 
  // 4) Renderizar botón de suscripción o cancelar
  if (me.role === 'fan' && !isOwner) {
    let isSub = false;
    try {
      const { data: { isSubscribed } } = await checkSubscription(artistId);
      isSub = isSubscribed;
    } catch (_) {
      console.warn('PerfilArtista: no se pudo verificar suscripción');
    }
    susWrp.innerHTML = '';
    if (isSub) {
      const btnCancel = document.createElement('button');
      btnCancel.className = 'btn-secondary';
      btnCancel.textContent = 'Cancelar suscripción';
      btnCancel.onclick = async () => {
        if (!confirm('¿Seguro que quieres cancelar la suscripción?')) return;
        try {
          await unsubscribe(artistId);
          alert('Suscripción cancelada. Tendrás acceso hasta fin de periodo.');
          location.reload();
        } catch (e) {
          console.error(e);
          alert('No se pudo cancelar la suscripción.');
        }
      };
      susWrp.append(btnCancel);
    } else {
      // el modal maneja el subscribe
      const btnSub = document.createElement('button');
      btnSub.id = 'btn-suscribirse';
      btnSub.className = 'btn-primary';
      btnSub.textContent = 'Suscribirse';
      susWrp.append(btnSub);
    }
  } else {
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
  } catch (e) {
    console.error('PerfilArtista: error al cargar publicaciones', e);
  }
}
 
document.addEventListener('DOMContentLoaded', init);