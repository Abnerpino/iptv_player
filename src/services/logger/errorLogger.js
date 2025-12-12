import { appendFile, writeFile, exists, stat, copyFile, unlink, ExternalDirectoryPath, CachesDirectoryPath } from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';

// Ruta del archivo: Se guarda en el almacenamiento 'público' de la app (Accesible por USB)
const LOG_FILE_PATH = ExternalDirectoryPath + '/bitacora_errores.txt';
// Ruta temporal para compartir (Accesible por el sistema de compartir)
const CACHE_FILE_PATH = CachesDirectoryPath + '/bitacora_errores.txt';
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5 MB

const ErrorLogger = {
    /**
     * Registra un error en el archivo de texto
     * @param {string} context - Dónde ocurrió
     * @param {Error|string} error - El objeto de error o mensaje
     */
    log: async (context, error) => {
        try {
            const timestamp = new Date().toLocaleString();
            const version = DeviceInfo.getVersion();
            const errorMessage = typeof error === 'object' ? error.message : error;
            const stackTrace = error.stack ? `\nStack: ${error.stack}` : '';

            const logEntry = `\n[${timestamp}] - [IPTV Player ${version}] - [${context}]: ${errorMessage}${stackTrace}\n--------------------------------------------------\n`;

            // Verifica existencia y tamaño
            const fileExists = await exists(LOG_FILE_PATH);

            if (fileExists) {
                const _stat = await stat(LOG_FILE_PATH);
                // Si pesa más de 5MB, lo borra y empieza de cero
                if (_stat.size > MAX_FILE_SIZE) {
                    await unlink(LOG_FILE_PATH);
                    await writeFile(LOG_FILE_PATH, '[RESET LOG - FILE SIZE LIMIT REACHED]\n', 'utf8');
                }
            }

            // Agrega el error al final del archivo
            await appendFile(LOG_FILE_PATH, logEntry, 'utf8');

            // Opcional: Sigue mostrando en consola para desarrollo
            if (__DEV__) {
                console.log('Error registrado en bitácora:', logEntry);
            }

        } catch (err) {
            console.error('Error crítico: No se pudo escribir en la bitácora', err);
        }
    },

    /**
     * Prepara el archivo para ser compartido moviéndolo a la caché
     */
    prepareForShare: async () => {
        try {
            // Verifica si existe el log original
            if (!(await exists(LOG_FILE_PATH))) {
                return null;
            }

            // Si ya existe uno viejo en caché, lo borra para asegurar frescura
            if (await exists(CACHE_FILE_PATH)) {
                await unlink(CACHE_FILE_PATH);
            }

            // Copia del almacenamiento externo a la caché interna
            await copyFile(LOG_FILE_PATH, CACHE_FILE_PATH);

            // Retorna la ruta de la caché
            return CACHE_FILE_PATH;
        } catch (error) {
            console.error('Error preparando archivo para compartir:', error);
            return null;
        }
    },

    /**
     * Verifica si realmente existe el archivo antes de enviar
     */
    checkFile: async () => {
        return await exists(LOG_FILE_PATH);
    },
};

export default ErrorLogger;