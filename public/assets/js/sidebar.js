export function loadSidebar(tipo) {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
 
  const baseMenu = `
    <h2 class="logo">ArtFlow</h2>
    <nav class="nav-menu">
      
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
    alert('Sesión cerrada');
    window.location.href = '/login.html';
  });
}