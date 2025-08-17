// Variables globales
let registros = [];
let baseDatos = {};

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btnBorrarTodo').addEventListener('click', borrarTodo);
    // Cargar lista completa de registros al iniciar
    const registrosGuardados = localStorage.getItem('listaRegistrosCombustible');
    if (registrosGuardados) {
        registros = JSON.parse(registrosGuardados);
        actualizarTablaRegistros();
    }

    // Cargar último formulario completado (opcional)
    const formDataGuardado = localStorage.getItem('ultimoRegistroCombustible');
    if (formDataGuardado) {
        const formData = JSON.parse(formDataGuardado);
        // Nuevo: Formulario de camión
        document.getElementById('fecha').value = formData.fechaCamion || '';
        document.getElementById('patente_camion').value = formData.patenteCamion || '';
        document.getElementById('operador').value = formData.operador || '';
        document.getElementById('control_combustible').value = formData.controlCombustible || '';
        document.getElementById('saldo_inicio').value = formData.saldoInicial || '';

        // Formulario de equipos (existente)
        document.getElementById('patente_equipo').value = formData.patente || '';
        document.getElementById('horometro').value = formData.horometro || '';
        document.getElementById('cantidad_litros').value = formData.cantidadLitros || '';
        document.getElementById('observacion').value = formData.observacion || '';
        document.getElementById('nombre_equipo').value = formData.nombreEquipo || '';
        document.getElementById('empresa').value = formData.empresa || '';
        document.getElementById('ultimo_horometro').value = formData.ultimoHorometro || '';
        document.getElementById('area').value = formData.area || '';


    }

    // Cargar base de datos
    cargarBaseDatos();

    // Configurar eventos
    document.getElementById('btnEnviar').addEventListener('click', registrarEquipo);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
    document.getElementById('btnDescargar').addEventListener('click', generarReporte);
    document.getElementById('saldo_inicio').addEventListener('input', actualizarTotales);

    function cargarBaseDatos() {
        fetch('baseDatos.json')
            .then(response => response.json())
            .then(data => {
                baseDatos = data;
                console.log('Base de datos cargada:', baseDatos);
                configurarAutocompletado();
            })
            .catch(error => console.error('Error al cargar la base de datos:', error));
    }

    function configurarAutocompletado() {
        const patenteInput = document.getElementById('patente_equipo');

        patenteInput.addEventListener('input', function () {
            const patente = this.value.trim().toUpperCase();
            const equipo = baseDatos.equipos.find(e =>
                e.patente && typeof e.patente === 'string' &&
                e.patente.toUpperCase() === patente
            );

            if (equipo) {
                document.getElementById('nombre_equipo').value = equipo.nombre_equipo || '';
                document.getElementById('empresa').value = equipo.propietario || '';
                document.getElementById('ultimo_horometro').value = equipo['ult. horómetro'] || '';
                document.getElementById('area').value = equipo.area || '';
                document.getElementById('observacion').value = equipo.nota || '';
            }
        });
    }

    function registrarEquipo() {
        const formData = {
            id: Date.now(),
            // Datos del equipo (existente)
            patente: document.getElementById('patente_equipo').value.trim(),
            horometro: document.getElementById('horometro').value.trim(),
            cantidadLitros: document.getElementById('cantidad_litros').value.trim(),
            observacion: document.getElementById('observacion').value.trim(),
            nombreEquipo: document.getElementById('nombre_equipo').value.trim(),
            empresa: document.getElementById('empresa').value.trim(),
            ultimoHorometro: document.getElementById('ultimo_horometro').value.trim(),
            area: document.getElementById('area').value.trim(),
            fecha: new Date().toLocaleString(),

            // Nuevo: Datos del camión
            fechaCamion: document.getElementById('fecha').value,
            patenteCamion: document.getElementById('patente_camion').value,
            operador: document.getElementById('operador').value,
            controlCombustible: document.getElementById('control_combustible').value,
            saldoInicial: document.getElementById('saldo_inicio').value
        };

        // Validación de campos (puedes agregar validación para los campos del camión si es necesario)
        if (!formData.patente || !formData.horometro || !formData.cantidadLitros ||
            !formData.nombreEquipo || !formData.empresa || !formData.ultimoHorometro || !formData.area) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        registros.push(formData);

        // Guardar en localStorage
        localStorage.setItem('listaRegistrosCombustible', JSON.stringify(registros));
        localStorage.setItem('ultimoRegistroCombustible', JSON.stringify(formData));

        actualizarTablaRegistros();
        actualizarTotales();

        // Limpiar solo campos específicos (opcional)
        document.getElementById('horometro').value = '';
        document.getElementById('cantidad_litros').value = '';
        document.getElementById('observacion').value = '';
    }

    function actualizarTablaRegistros() {
        const tbody = document.getElementById('cuerpoTabla');
        tbody.innerHTML = '';

        registros.forEach(registro => {
            const row = tbody.insertRow();

            row.insertCell(0).textContent = registro.patente;
            row.insertCell(1).textContent = registro.horometro;
            row.insertCell(2).textContent = registro.cantidadLitros;
            row.insertCell(3).textContent = registro.observacion;
            row.insertCell(4).textContent = registro.nombreEquipo;
            row.insertCell(5).textContent = registro.empresa;
            row.insertCell(6).textContent = registro.ultimoHorometro;
            row.insertCell(7).textContent = registro.area;

            const cellAcciones = row.insertCell();
            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = '✕ Eliminar';
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.onclick = () => eliminarRegistro(registro.id);
            cellAcciones.appendChild(btnEliminar);
        });
    }

    function eliminarRegistro(id) {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            registros = registros.filter(registro => registro.id !== id);
            localStorage.setItem('listaRegistrosCombustible', JSON.stringify(registros));
            actualizarTablaRegistros();
            actualizarTotales();
        }
    }

    function limpiarFormulario() {
        document.getElementById('formEquipos').reset();
        // Opcional: Si quieres limpiar también el último registro guardado
    }

    function generarReporte() {
        if (registros.length === 0) {
            alert('No hay registros para generar el reporte');
            return;
        }

        // Obtener y formatear fecha
        const fechaInput = document.getElementById('fecha').value;
        let fechaParaReporte, dia, mes, anio;

        if (fechaInput) {
            // Parsear la fecha directamente desde el input (formato YYYY-MM-DD)
            [anio, mes, dia] = fechaInput.split('-');
            fechaParaReporte = fechaInput; // Usar el valor original para el reporte

            // Formatear para nombre de archivo (DD_MM_YYYY)
            dia = dia.padStart(2, '0');
            mes = mes.padStart(2, '0');
        } else {
            // Si no hay fecha seleccionada, usar fecha actual (local)
            const hoy = new Date();
            anio = hoy.getFullYear();
            mes = String(hoy.getMonth() + 1).padStart(2, '0');
            dia = String(hoy.getDate()).padStart(2, '0');
            fechaParaReporte = `${anio}-${mes}-${dia}`;
        }

        // Obtener otros datos del formulario
        const patente = document.getElementById('patente_camion').value || 'No especificado';
        const operador = document.getElementById('operador').value || 'No especificado';
        const controlCombustible = document.getElementById('control_combustible').value || 'No especificado';
        const saldoInicial = document.getElementById('saldo_inicio').value || '0.00';
        const totalSuministrado = calcularTotalSuministrado();
        const saldoFinal = calcularSaldoFinal();

        // Formatear patente para nombre de archivo
        const patenteFormato = patente.trim().toUpperCase().replace(/\s+/g, '_');

        // Crear nombre de archivo (DD_MM_YYYY)
        const nombreArchivo = `Reporte_Combustible_${patenteFormato}_${dia}_${mes}_${anio}.xlsx`;

        // Preparar datos del reporte (el resto del código se mantiene igual)
        const reporte = [
            ["REGISTRO SUMINISTRO COMBUSTIBLE A EQUIPOS EN TERRENO", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["Fecha:", fechaParaReporte, "", "", "", "", "Saldo Inicial (litros):", saldoInicial],
            ["Patente Camión:", patente, "", "", "", "", "Total Suministrado (litros):", totalSuministrado],
            ["Operador:", operador, "Control Combustible:", controlCombustible, "", "", "Saldo Final (litros):", saldoFinal],
            ["", "", "", "", "", "", "", ""],
            ["DETALLE DE EQUIPOS ABASTECIDOS", "", "", "", "", "", "", ""],
            ["Patente", "Horómetro", "Cantidad (litros)", "Observación", "Nombre del Equipo", "Empresa", "Último Horómetro", "Área"],
            ...registros.map(reg => [
                reg.patente,
                reg.horometro,
                parseFloat(reg.cantidadLitros).toFixed(2),
                reg.observacion,
                reg.nombreEquipo,
                reg.empresa,
                reg.ultimoHorometro,
                reg.area
            ])
        ];

        // Crear libro de Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(reporte);

        // Configurar formato del Excel
        ws["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
            { s: { r: 6, c: 0 }, e: { r: 6, c: 7 } }
        ];

        ws["!cols"] = [
            { width: 15 }, { width: 12 }, { width: 15 },
            { width: 25 }, { width: 20 }, { width: 18 },
            { width: 15 }, { width: 12 }
        ];

        // Generar y descargar archivo
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Combustible");
        XLSX.writeFile(wb, nombreArchivo);
    }

    function calcularTotalSuministrado() {
        if (!registros || registros.length === 0) return "0.00";
        const total = registros.reduce((sum, reg) => sum + (parseFloat(reg.cantidadLitros) || 0), 0);
        return total.toFixed(2);
    }

    function calcularSaldoFinal() {
        const saldoInicial = parseFloat(document.getElementById('saldo_inicio').value) || 0;
        return (saldoInicial - parseFloat(calcularTotalSuministrado())).toFixed(2);
    }

    function actualizarTotales() {
        document.getElementById('total_suministrado').value = calcularTotalSuministrado();
        document.getElementById('saldo_final').value = calcularSaldoFinal();
    }

    function borrarTodo() {
        if (confirm('¿Estás seguro de que deseas borrar todos los registros de equipos?\n\nEsta acción no se puede deshacer.')) {
            // Guardar los datos del camión que queremos preservar
            const fecha = document.getElementById('fecha').value;
            const patenteCamion = document.getElementById('patente_camion').value;
            const operador = document.getElementById('operador').value;
            const controlCombustible = document.getElementById('control_combustible').value;
            const saldoInicial = document.getElementById('saldo_inicio').value;

            // Limpiar los registros y el localStorage
            registros = [];
            localStorage.removeItem('listaRegistrosCombustible');

            // Restaurar los datos del camión
            document.getElementById('fecha').value = fecha;
            document.getElementById('patente_camion').value = patenteCamion;
            document.getElementById('operador').value = operador;
            document.getElementById('control_combustible').value = controlCombustible;
            document.getElementById('saldo_inicio').value = saldoInicial;

            // Actualizar la tabla y los totales
            actualizarTablaRegistros();
            actualizarTotales();

            // Limpiar el formulario de equipos
            document.getElementById('formEquipos').reset();

            alert('Todos los registros de equipos han sido eliminados.');
        }
    }
});