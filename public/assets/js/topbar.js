// public/assets/js/topbar.js
export function loadTopbar() {
  const container = document.getElementById('topbar-placeholder');
  if (!container) return;

  container.innerHTML = `
    <header class="buscador">
      <input type="text" class="search-bar" placeholder="Buscar artistas / temas" id="searchInput" />
      <button class="search-button" id="searchBtn">🔍</button>
    </header>
  `;

  const searchBtn = container.querySelector('#searchBtn');
  const searchInput = container.querySelector('#searchInput');

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = "\`resultados-busqueda.html?q=\${encodeURIComponent(query)}\`";
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBtn.click();
  });
}
