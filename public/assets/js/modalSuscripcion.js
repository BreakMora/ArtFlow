document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  const btnSuscribirse = document.querySelector('.btn-primary');
  const modal = document.getElementById('modal-suscripcion');
  const cerrarBtn = document.querySelector('.cerrar-modal');
  const montoInput = document.getElementById('monto');
  const montoResumen = document.getElementById('montoResumen');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnContinuar = document.getElementById('btn-continuar');

  if (!btnSuscribirse || !modal) return;

  btnSuscribirse.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

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
  }

  try {
    const response = await fetch(`${API_BASE_URL}/crear-suscripcion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ monto })
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
