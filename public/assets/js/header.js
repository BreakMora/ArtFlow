// public/assets/js/header.js
export async function loadHeader() {
  const res = await fetch('/public/header.html');
  const html = await res.text();
  document.getElementById('header-placeholder').innerHTML = html;

  const currentPage = window.location.pathname.split('/').pop(); // ej: login.html
  const nav = document.querySelector('.topbar nav');

  const links = nav.querySelectorAll('[data-link]');
  links.forEach(link => {
    const target = link.getAttribute('href');
    const key = link.dataset.link;

    switch (currentPage) {
      case 'login.html':
        if (key === 'login' || key === 'recover') link.remove();
        break;

      case 'registro.html':
        if (key === 'registro') link.remove();
        break;

      case 'recover.html':
        if (key === 'recover') link.remove();
        break;

      case 'index.html':
      case '':
        // En index se muestran todos menos blog
        break;

      default:
        break;
    }

  });
}
