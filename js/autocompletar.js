document.addEventListener('DOMContentLoaded', function () {
    let baseDatos = {};
    const patenteInput = document.getElementById('patente_equipo');
    const datalist = document.createElement('datalist');
    datalist.id = 'patentesList';
    patenteInput.parentNode.appendChild(datalist);
    patenteInput.setAttribute('list', 'patentesList');

    fetch('baseDatos.json')
        .then(response => response.json())
        .then(data => {
            baseDatos = data;
            console.log('Base de datos cargada:', baseDatos);

            // Llenar datalist con todas las patentes
            baseDatos.equipos.forEach(equipo => {
                const option = document.createElement('option');
                option.value = equipo.patente;
                datalist.appendChild(option);
            });

            // Configurar autocompletado
            configurarAutocompletado();
        })
        .catch(error => console.error('Error al cargar la base de datos:', error));

    function configurarAutocompletado() {
        patenteInput.addEventListener('input', function () {
            const valorInput = this.value.trim().toLowerCase(); // Convertir a minúsculas

            if (valorInput.length === 0) {
                // Si el campo está vacío, mostrar todas las opciones
                datalist.innerHTML = '';
                baseDatos.equipos.forEach(equipo => {
                    const option = document.createElement('option');
                    option.value = equipo.patente;
                    datalist.appendChild(option);
                });
                return;
            }

            // Filtrar patentes que coincidan (case insensitive)
            const coincidencias = baseDatos.equipos.filter(equipo =>
                equipo.patente.toLowerCase().includes(valorInput)
            ).slice(0, 5);  // <-- Paréntesis de cierre para filter() antes de slice() // Limitar a 5 sugerencias

            // Actualizar datalist
            datalist.innerHTML = '';
            coincidencias.forEach(equipo => {
                const option = document.createElement('option');
                option.value = equipo.patente;
                datalist.appendChild(option);
            });

            // Si hay coincidencia exacta, autocompletar otros campos
            const equipoExacto = baseDatos.equipos.find(equipo =>
                equipo.patente.toLowerCase() === valorInput);

            if (equipoExacto) {
                autocompletarCampos(equipoExacto);
            }
        });
    }

    function autocompletarCampos(equipo) {
        document.getElementById('nombre_equipo').value = equipo.nombre_equipo || '';
        document.getElementById('empresa').value = equipo.propietario || '';
        document.getElementById('ultimo_horometro').value = equipo['ult. horómetro'] || '';
        document.getElementById('area').value = equipo.area || '';
    }
});