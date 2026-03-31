// Cuaderno de borrador (usa localStorage)
let cuaderno = [];

// Cargar cuaderno guardado
function cargarCuaderno() {
    const guardado = localStorage.getItem('cuaderno_arquitectura');
    if (guardado) {
        cuaderno = JSON.parse(guardado);
    }
}

// Guardar cuaderno
function guardarCuaderno() {
    localStorage.setItem('cuaderno_arquitectura', JSON.stringify(cuaderno));
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'exito') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-bounce ${
        tipo === 'exito' ? 'bg-green-600' : 'bg-red-600'
    }`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

// Guardar combinación
function guardarCombinacion(arquitectura, interior, paisaje) {
    const nuevaCombinacion = {
        id: Date.now(),
        arquitectura: arquitectura,
        interior: interior,
        paisaje: paisaje,
        fecha: new Date().toLocaleDateString('es-AR')
    };
    
    cuaderno.push(nuevaCombinacion);
    guardarCuaderno();
    mostrarNotificacion(`✓ Guardado: ${arquitectura} + ${interior} + ${paisaje}`);
}

// Mostrar cuaderno (modal)
function mostrarCuaderno() {
    if (cuaderno.length === 0) {
        alert('📓 Tu cuaderno está vacío. Explorá estilos y guardá combinaciones.');
        return;
    }
    
    let mensaje = '📓 MI CUADERNO DE BORRADOR\n\n';
    cuaderno.forEach((item, index) => {
        mensaje += `${index + 1}. 🏛️ ${item.arquitectura}\n`;
        mensaje += `   🪑 ${item.interior}\n`;
        mensaje += `   🌿 ${item.paisaje}\n`;
        mensaje += `   📅 ${item.fecha}\n\n`;
    });
    mensaje += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    mensaje += '🗑️ Para eliminar, abrí la consola y escribí: limpiarCuaderno()';
    
    alert(mensaje);
}

// Limpiar cuaderno (para depuración)
function limpiarCuaderno() {
    if (confirm('¿Eliminar todas las combinaciones guardadas?')) {
        cuaderno = [];
        guardarCuaderno();
        mostrarNotificacion('Cuaderno vaciado', 'exito');
    }
}

// Ver cuaderno desde el link
document.addEventListener('DOMContentLoaded', () => {
    cargarCuaderno();
    
    const cuadernoLink = document.getElementById('cuadernoLink');
    if (cuadernoLink) {
        cuadernoLink.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarCuaderno();
        });
    }
});

// Exportar funciones para uso global
window.guardarCombinacion = guardarCombinacion;
window.limpiarCuaderno = limpiarCuaderno;
window.mostrarCuaderno = mostrarCuaderno;