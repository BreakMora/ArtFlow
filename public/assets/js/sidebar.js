// public/assets/js/sidebar.js
export async function loadSidebar() {
  const placeholder = document.getElementById('sidebar-placeholder');
  if (!placeholder) return;

  // Intenta obtener el usuario de localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('activeUser'));
  } catch {}
  const role = user?.role || 'fan'; // por defecto fan

  // Definimos los items comunes y los específicos
  const common = [
    { text: 'Suscripciones',     href: 'ver-suscripciones.html',       icon: '🔍' },
   
   /* { text: 'Perfil',       href: 'perfil-usuario.html', icon: '👤' },*/
  ];

  const byRole = {
    fan: [
       { text: 'Inicio',       href: 'fan-home.html',           icon: '🏠' },
        ],
    artista: [
      { text: 'Crear Publicación', href: 'crear-publicacion.html',  icon: '✏️' },
      { text: 'Mis Publicaciones', href: 'perfil-artista.html',   icon: '🖼️' },
    ],
  };

  const logoutItem = { text: 'Cerrar Sesión', href: '#', icon: '🚪', logout: true };

  // Construimos el HTML
  const links = [
    ...common,
    ...(byRole[role] || []),
    logoutItem
  ];

  const nav = document.createElement('nav');
  nav.className = 'nav-menu';

  links.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'nav-link';
    a.innerHTML = `<span class="icon">${item.icon}</span> ${item.text}`;
    if (item.logout) {
      a.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('activeUser');
        window.location.href = 'login.html';
      });
    }
    nav.appendChild(a);
  });

  // Logo
  const logo = document.createElement('a');
  logo.className = 'logo';
  logo.href = 'home.html';
  logo.textContent = 'ArtFlow';

  // Vaciar y anexar
  placeholder.innerHTML = '';
  placeholder.appendChild(logo);
  placeholder.appendChild(nav);
}


/*export function loadSidebar(tipo) {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  const baseMenu = `
    <h2 class="logo">ArtFlow</h2>
    <nav class="nav-menu">
      <a href="#" class="nav-link active">Dashboard</a>
      <a href="fan-home.html" class="nav-link">Feed</a>
      ${tipo === 'artista' ? `
        <a href="http://localhost:3000/artista-dashboard.html" class="nav-link active">Inicio</a>
        <a href="http://localhost:3000/crear-publicacion.html" class="nav-link">Crear Publicación</a>
        <a href="#" class="nav-link">Configuración</a>
        <a href="#"class="nav-link">Método de Retiro</a>
        
      ` : `
        <a href="http://localhost:3000/fan-home.html" class="nav-link active">Inicio</a>
        <a href="#"class="nav-link">Explorar</a>
        <a href="http://localhost:3000/ver-suscripciones.html"class="nav-link">Suscripciones</a>
        <a href="#"class="nav-link">Perfil</a>
      `}
      <a href="#" class="nav-link logout-link" id="cerrar-sesion">Cerrar Sesión</a>
    </nav>
  `;

  sidebar.innerHTML = baseMenu;
  document.getElementById('sidebar-placeholder').appendChild(sidebar);

  // Lógica de logout (puedes reemplazarla con la real)
  document.getElementById('cerrar-sesion').addEventListener('click', () => {
    // Aquí limpias sesión/cookies/localStorage y rediriges
    localStorage.removeItem('authToken');
    localStorage.removeItem('activeUser');
    alert('Sesión cerrada');
    window.location.href = '/login.html';
  });
}*/