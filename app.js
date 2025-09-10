document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_URL = 'https://68bb0df184055bce63f1062a.mockapi.io/api/v1/dispositivos_IoT'; // URL completa del recurso
    const STATUS_COMMANDS = [
        "adelante", "atrás", "detener", "adelante derecha", "adelante izquierda",
        "atrás derecha", "atrás izquierda", "giro 90 grados derecha", "giro 90 grados izquierda",
        "giro 360 grados derecha", "giro 360 grados izquierda"
    ];

    // --- ELEMENTOS DEL DOM ---
    const lastStatusElement = document.getElementById('last-status');
    const tableBody = document.getElementById('records-table-body');
    const controlPanel = document.getElementById('control-panel');
    const loader = document.getElementById('loader');

    // --- FUNCIONES ---

    /**
     * Muestra u oculta el spinner de carga y deshabilita los botones.
     * @param {boolean} isLoading - True para mostrar, false para ocultar.
     */
    const toggleLoading = (isLoading) => {
        loader.style.display = isLoading ? 'block' : 'none';
        lastStatusElement.style.display = isLoading ? 'none' : 'block';
        document.querySelectorAll('#control-panel button').forEach(button => {
            button.disabled = isLoading;
        });
    };

    /**
     * Obtiene los últimos 5 registros de la API y actualiza la UI.
     */
    const fetchLastFiveRecords = async () => {
        toggleLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const records = await response.json();

            // Ordena los registros por ID descendente para obtener los más nuevos
            const sortedRecords = records.sort((a, b) => parseInt(b.id) - parseInt(a.id));
            const lastFive = sortedRecords.slice(0, 5);

            // Actualiza el último status
            if (lastFive.length > 0) {
                lastStatusElement.textContent = lastFive[0].status;
            } else {
                lastStatusElement.textContent = 'Sin registros';
            }

            // Actualiza la tabla
            tableBody.innerHTML = ''; // Limpia la tabla
            lastFive.forEach(record => {
                const row = `
                    <tr>
                        <th scope="row">${record.id}</th>
                        <td>${record.status}</td>
                        <td>${record.date}</td>
                        <td>${record.ip}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });

        } catch (error) {
            console.error("Error al obtener los registros:", error);
            lastStatusElement.textContent = 'Error';
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">No se pudieron cargar los datos.</td></tr>`;
        } finally {
            toggleLoading(false);
        }
    };
    
    /**
     * Obtiene la IP pública del cliente.
     * @returns {Promise<string>} La dirección IP o 'No disponible'.
     */
    const getPublicIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) return 'No disponible';
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Error al obtener IP:", error);
            return 'No disponible';
        }
    };

    /**
     * Crea y envía un nuevo registro a la API.
     * @param {string} status - El valor del status a enviar.
     */
    const addRecord = async (status) => {
        toggleLoading(true);
        try {
            const ip = await getPublicIP();
            const date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

            const newRecord = {
                name: 'WebApp Client', // Nombre de dispositivo genérico
                status: status,
                ip: ip,
                date: date,
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRecord),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Si el POST fue exitoso, refrescamos la lista
            await fetchLastFiveRecords();

        } catch (error) {
            console.error("Error al agregar el registro:", error);
            // Re-enable UI in case of error
            toggleLoading(false);
        }
    };

    /**
     * Crea los botones de control y los añade al panel.
     */
    const createControlButtons = () => {
        STATUS_COMMANDS.forEach(command => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-light';
            button.textContent = command;
            button.addEventListener('click', () => addRecord(command));
            controlPanel.appendChild(button);
        });
    };


    // --- INICIALIZACIÓN ---
    createControlButtons();
    fetchLastFiveRecords();
});