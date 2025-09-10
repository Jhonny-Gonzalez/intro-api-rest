document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_URL = 'https://68bb0df184055bce63f1062a.mockapi.io/api/v1/dispositivos_IoT';
    const POLLING_INTERVAL = 2000; // 2000 ms = 2 segundos

    // --- ELEMENTOS DEL DOM ---
    const lastStatusElement = document.getElementById('last-status');
    const tableBody = document.getElementById('records-table-body');

    // --- FUNCIONES ---

    /**
     * Obtiene los últimos 10 registros de la API y actualiza la UI.
     * No muestra un loader para que la actualización sea fluida.
     */
    const fetchAndUpdateData = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                // Si la API falla, lo mostramos en la tabla sin detener el polling
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const records = await response.json();

            // Ordena los registros por ID descendente para obtener los más nuevos
            const sortedRecords = records.sort((a, b) => parseInt(b.id) - parseInt(a.id));
            const lastTen = sortedRecords.slice(0, 10);

            // Actualiza el último status
            if (lastTen.length > 0) {
                // Solo actualiza si el valor es diferente para evitar parpadeo
                if (lastStatusElement.textContent !== lastTen[0].status) {
                    lastStatusElement.textContent = lastTen[0].status;
                }
            } else {
                lastStatusElement.textContent = 'Sin registros';
            }

            // Actualiza la tabla
            tableBody.innerHTML = ''; // Limpia la tabla
            lastTen.forEach(record => {
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
            console.error("Error durante el polling:", error);
            // Opcional: mostrar un estado de error en la UI sin ser intrusivo
            lastStatusElement.textContent = 'Error de conexión';
        }
    };
    
    // --- INICIALIZACIÓN ---
    
    // 1. Llama a la función una vez al cargar la página para mostrar datos inmediatamente.
    fetchAndUpdateData();

    // 2. Establece un intervalo para llamar a la función repetidamente cada 2 segundos.
    setInterval(fetchAndUpdateData, POLLING_INTERVAL);
});