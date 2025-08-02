document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  const btnSuscribirse = document.querySelector('.btn-primary');
  const modal = document.getElementById('modal-suscripcion');
  const cerrarBtn = document.querySelector('.cerrar-modal');
  const montoInput = document.getElementById('monto');
  const montoResumen = document.getElementById('montoResumen');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnContinuar = document.getElementById('btn-continuar');
  const nombreArtistaModal = document.getElementById('modal-artista-nombre');
  const nombreArtistaResumen = document.getElementById('modal-artista-resumen');

 /* if (!btnSuscribirse || !modal) return;*/ //ESto daña el modal

   // Obtener el nombre del artista del perfil (ya cargado por perfilArtista.js)
  function updateArtistName() {
    const artistNameElement = document.getElementById('nombre-artista');
    if (artistNameElement) {
      const artistName = artistNameElement.textContent.replace('@', '');
      nombreArtistaModal.textContent = `@${artistName}`;
      nombreArtistaResumen.textContent = `@${artistName}`;
      nombreArtistaModal.href = window.location.href; // Mantener misma URL
    }
  }


  // Configurar el modal cuando se hace clic en Suscribirse
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-suscribirse' || e.target.classList.contains('btn-primary')) {
      updateArtistName(); // Actualizar nombre antes de mostrar
      modal.style.display = 'flex';
    }
  });

  /////////////////////////////////////Cuestionar 
  /*btnSuscribirse.addEventListener('click', () => {
    modal.style.display = 'flex';
  });*/
/////////////////////////////////////*/

  cerrarBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  btnCancelar?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  montoInput?.addEventListener('input', () => {
    const valor = parseFloat(montoInput.value);
    montoResumen.textContent = isNaN(valor) ? "0.00" : valor.toFixed(2);
  });

  btnContinuar?.addEventListener('click', async () => {
  const monto = parseInt(montoInput.value);

  if (isNaN(monto) || monto < 1 || montoInput.value.includes('.')) {
    alert("Por favor ingresa un monto entero positivo.");
    return;
  }document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  const modal = document.getElementById('modal-suscripcion');
  const cerrarBtn = document.querySelector('.cerrar-modal');
  const montoInput = document.getElementById('monto');
  const montoResumen = document.getElementById('montoResumen');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnContinuar = document.getElementById('btn-continuar');
  const nombreArtistaModal = document.getElementById('modal-artista-nombre');
  const nombreArtistaResumen = document.getElementById('modal-artista-resumen');

  // Obtener el nombre del artista del perfil (ya cargado por perfilArtista.js)
  function updateArtistName() {
    const artistNameElement = document.getElementById('nombre-artista');
    if (artistNameElement) {
      const artistName = artistNameElement.textContent.replace('@', '');
      nombreArtistaModal.textContent = `@${artistName}`;
      nombreArtistaResumen.textContent = `@${artistName}`;
      nombreArtistaModal.href = window.location.href; // Mantener misma URL
    }
  }

  // Configurar el modal cuando se hace clic en Suscribirse
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-suscribirse' || e.target.classList.contains('btn-primary')) {
      updateArtistName(); // Actualizar nombre antes de mostrar
      modal.style.display = 'flex';
    }
  });

  // Resto del código del modal...
  cerrarBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  btnCancelar?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  montoInput?.addEventListener('input', () => {
    const valor = parseFloat(montoInput.value);
    montoResumen.textContent = isNaN(valor) ? "0.00" : valor.toFixed(2);
  });

  btnContinuar?.addEventListener('click', async () => {
    const monto = parseInt(montoInput.value);
    const artistId = new URLSearchParams(window.location.search).get('id');

    if (isNaN(monto) || monto < 1 || montoInput.value.includes('.')) {
      alert("Por favor ingresa un monto entero positivo.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crear-suscripcion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          monto,
          artistId
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al procesar la suscripción.");
    }
  });
});

 try {
      const response = await fetch(`${API_BASE_URL}/crear-suscripcion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          monto
        })
      });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error(err);
    alert("Error al procesar la suscripción.");
  }
});

});
